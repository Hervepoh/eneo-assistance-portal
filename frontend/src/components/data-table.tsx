import * as React from "react";
import * as XLSX from "xlsx";

import {
    ArrowUpDown,
    ChevronLeftIcon,
    ChevronRightIcon,
    FileDown,
    Filter,
    FilterX,
    Loader2,
    Search,
    Settings2,
    Trash,
    X
} from "lucide-react";
import { MdDoubleArrow, MdDownload } from "react-icons/md";
import {
    ColumnDef,
    Row,
    flexRender,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getCurrentDateTime } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";


interface Filter {
    field: string;
    operator: string;
    value: string | number;
    logical: 'AND' | 'OR';
}

interface Condition {
    operator: string;
    filters: Filter[];
}

export interface ApiFilters {
    conditions: Condition[];
}

export type columnsFilter = {
    accessorKey: string,
    title: string
}


interface DataTableProps<TData, TValue> {
    readonly columns: ColumnDef<TData, TValue>[],
    readonly data: TData[],
    readonly label: string,
    readonly totalItems: number,
    readonly filterColumns: columnsFilter[],
    readonly isExportable?: boolean
    readonly isDeletable?: boolean
    readonly isFilterable?: boolean
    readonly exportData: TData[]
    readonly onDelete: (rows: Row<TData>[]) => void,
    readonly disabled?: boolean,
    readonly isLoading?: boolean,
    readonly isError?: boolean,
    readonly page: number,
    readonly limit: number,
    readonly setPage: {
        (updater: (prev: number) => number): void; // For functional updates
        (page: number): void; // For direct number updates
    }
    readonly setLimit: (limit: number) => void,
    readonly setApiFilters: (filters: ApiFilters | null) => void
}


export default function DataTable<TData, TValue>({
    columns,
    data,
    totalItems,
    disabled,
    isLoading,
    isError,
    page,
    limit,
    setPage,
    setLimit,
    setApiFilters,
    label,
    filterColumns,
    isFilterable = true,
    isDeletable = false,
    onDelete,
    isExportable = false,
    exportData

}: DataTableProps<TData, TValue>) {
    const initialFilterField = { columnKey: '', operator: '', value: '', logical: 'AND' };

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [showFilterForm, setShowFilterForm] = React.useState(false);
    const [filterFields, setFilterFields] = React.useState([{ ...initialFilterField }]);
    const [message, setMessage] = React.useState(`You are about to perform a bulk delete`);

    const [ConfirmationDialog, confirm] = useConfirm({
        title: "Are you sure?",
        message,
    });

    const transformFilters = (): ApiFilters | null => {
        const conditions: Condition[] = [];
        const filters: Filter[] = [];

        filterFields.forEach(({ columnKey, operator, value, logical }) => {
            if (columnKey && operator && value) {
                let parsedValue: string | number = value;

                // Convertir en nombre si l'opérateur est gte, lte, gt, ou lt
                if (['gte', 'lte', 'gt', 'lt'].includes(operator)) {
                    parsedValue = parseFloat(value);
                    if (isNaN(parsedValue)) {
                        // Si la conversion échoue, ignorer ce filtre
                        return;
                    }
                } else if (['equals', 'contains'].includes(operator)) {
                    if (columnKey === 'amount') {
                        parsedValue = parseFloat(value);
                        if (isNaN(parsedValue)) {
                            return;
                        }
                    } else {
                        // Pour equals et contains, garder la valeur en tant que chaîne de caractères
                        parsedValue = value.toString().trim(); // Supprimer les espaces blancs inutiles

                        // Si la valeur est vide après trim, ignorer ce filtre
                        if (parsedValue === '') {
                            return;
                        }
                    }

                }

                filters.push({ field: columnKey, operator, value: parsedValue, logical: logical as 'AND' | 'OR' });
            }
        });

        if (filters.length > 0) {
            conditions.push({ operator: filters[0].logical, filters });
        }

        return conditions.length > 0 ? { conditions } : null;
    };

    function handleRemoveField(index: number): void {
        const newFields = filterFields.filter((_, i) => i !== index);
        setFilterFields(newFields);
        setApiFilters(transformFilters());
        setPage(1);
    }

    function handleAddField(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        setFilterFields(prevFields => [...prevFields, { ...initialFilterField }]);
    }

    const handleLogicalChange = (index: number, value: 'AND' | 'OR') => {
        const newFields = [...filterFields];
        newFields[index].logical = value;
        setFilterFields(newFields);
    };

    const activeFilters = filterFields.filter(field => field.columnKey && field.operator && field.value);

    const handleFieldChange = (index: number, field: keyof typeof initialFilterField, value: string | number) => {
        const newFields = [...filterFields];
        newFields[index][field] = value.toString();
        setFilterFields(newFields);
    };

    const handleSearch = () => {
        const filters = transformFilters();
        setApiFilters(filters);
        setPage(1);
    };

    const handleReset = () => {
        setFilterFields([]);
        setApiFilters(null);
        setPage(1);
    };

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
        },
        enableRowSelection: true,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        pageCount: Math.ceil(totalItems / limit),
    });

    const exportToXLSX = async (data: any) => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, label);

        const filename: string = `export-${label.toLowerCase()}-${getCurrentDateTime()}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };

    return (
        <>
            <ConfirmationDialog />
            <div className='gap-x-2 flex items-center justify-between mb-4'>
                <div className="flex flex-row-reverse gap-2">
                    {
                        isDeletable && table.getFilteredSelectedRowModel().rows.length > 0 && (
                            <Button
                                onClick={async () => {
                                    setMessage(`You are about to bulk delete "${table.getFilteredSelectedRowModel().rows.length}" entries selected.
This action cannot be undone. Please confirm if you wish to proceed with the deletion`);

                                    const ok = await confirm();
                                    if (ok) {
                                        // Logique for delete
                                        onDelete(table.getFilteredSelectedRowModel().rows);
                                        table.resetRowSelection();
                                    }
                                }}
                                disabled={disabled}
                                size="sm"
                                variant="destructive"
                                className="ml-auto font-normal text-xs"
                            >
                                <Trash className="size-4 mr-2" />
                                Delete ({table.getFilteredSelectedRowModel().rows.length})
                            </Button>
                        )
                    }
                    {
                        table.getFilteredSelectedRowModel().rows.length > 0 && (< Button
                            onClick={async () => {
                                exportToXLSX(table.getFilteredSelectedRowModel().rows);
                            }}
                            disabled={disabled}
                            size="sm"
                            variant="default"
                            className="ml-auto font-normal text-xs bg-green-700 hover:bg-green-900">
                            <MdDownload className="size-4 mr-2" />Export  ({table.getFilteredSelectedRowModel().rows.length})
                        </Button>)
                    }
                </div>
                <div className='flex gap-2'>
                    {
                        isFilterable && (
                            <Button onClick={() => setShowFilterForm(prev => !prev)} size={'sm'}>
                                {showFilterForm ? <FilterX className='size-4 mr-2' /> : <Filter className='size-4 mr-2' />}
                                {showFilterForm ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                        )
                    }
                    {
                        isExportable && (
                            <Button onClick={() => exportToXLSX(exportData)} size="sm" variant="outline">
                                <FileDown className='size-4 mr-2' />
                                Export to XLSX
                            </Button>
                        )
                    }

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                <Settings2 className='size-4 mr-2' /> Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div >

            {isFilterable && showFilterForm && (
                <div className="bg-white shadow-lg w-full rounded-lg p-4 md:p-6 lg:p-8 mx-auto my-4">
                    <h2 className="text-lg font-semibold mb-4">{`Filter ${label}`}</h2>
                    <div className="flex flex-col gap-4">
                        {filterFields.map((filterField, index) => (
                            <div key={index++} className="flex gap-2">
                                <Select
                                    onValueChange={(value) => handleFieldChange(index, 'columnKey', value)}
                                >
                                    <SelectTrigger className="h-10 w-1/4">
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterColumns.map(column => (
                                            <SelectItem key={column.accessorKey} value={column.accessorKey}>
                                                {column.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    onValueChange={(value) => handleFieldChange(index, 'operator', value)}
                                >
                                    <SelectTrigger className="h-10 w-1/4">
                                        <SelectValue placeholder="Select operator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="equals">Equals</SelectItem>
                                        <SelectItem value="contains">Contains</SelectItem>
                                        <SelectItem value="gte">Greater Than or Equal</SelectItem>
                                        <SelectItem value="lte">Less Than or Equal</SelectItem>
                                        <SelectItem value="gt">Greater Than</SelectItem>
                                        <SelectItem value="lt">Less Than</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Input
                                    placeholder={`Value...`}
                                    value={filterField.value}
                                    onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                                    className="h-10 w-1/4"
                                />

                                <Select
                                    value={filterField.logical}
                                    onValueChange={(value) => handleLogicalChange(index, value as 'AND' | 'OR')}
                                >
                                    <SelectTrigger className="h-10 w-1/4">
                                        <SelectValue placeholder="" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AND">AND</SelectItem>
                                        <SelectItem value="OR">OR</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button onClick={() => handleRemoveField(index)} size="sm" variant="outline">
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button onClick={handleAddField} size="sm">Add Filter Field</Button>
                        <div className="flex gap-2 mt-4 justify-between">
                            {activeFilters.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-semibold">Active Filters:</h3>
                                    <div className="flex flex-wrap gap-2 items-center justify-center">
                                        {activeFilters.map((filter, index) => (
                                            <>
                                                <span key={index++} className="bg-gray-200 rounded-md p-1 text-sm">
                                                    <span>
                                                        {`${filter.columnKey} ${filter.operator} ${filter.value}`}
                                                        <Button
                                                            className="ml-2"
                                                            size={"sm"}
                                                            onClick={() => handleRemoveField(index)}
                                                            variant="outline"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </span>
                                                </span>
                                                <span>{index < activeFilters.length - 1 && `(${filter.logical})`}</span>
                                            </>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleSearch} size="sm">
                                    <Search className="size-4 mr-2" /> Search
                                </Button>
                                <Button onClick={handleReset} size="sm" variant="outline">
                                    <X className="size-4 mr-2" /> Reset
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {
                isLoading ? (
                    <div className="flex items-center justify-center min-h-screen">
                        <Loader2 className="animate-spin h-12 w-12 border-4 border-t-transparent border-blue-500 rounded-full" />
                    </div>
                ) : isError ? (
                    <div>{`Something went wrong  ${label.toLowerCase()}.`}</div>
                ) : (
                    <>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <TableHead key={header.id}>
                                                    <button
                                                        onClick={header.column.getToggleSortingHandler()}
                                                        className="flex items-center"
                                                    >
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getCanSort() && (
                                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                                        )}
                                                        {header.column.getIsSorted() === 'asc' ? '🔼' :
                                                            header.column.getIsSorted() === 'desc' ? '🔽' : null}
                                                    </button>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length ? (
                                        table.getRowModel().rows.map(row => (
                                            <TableRow key={row.id}>
                                                {row.getVisibleCells().map(cell => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className='flex items-center justify-between overflow-auto space-x-2 px-2 py-4'>
                            <div className='hidden flex-1 text-sm text-muted-foreground sm:block'>
                                {table.getFilteredSelectedRowModel().rows.length} sur {totalItems} ligne(s) selectionée(s).
                            </div>
                            <div className='flex items-center sm:space-x-6 lg:space-x-8'>
                                <div className='flex items-center space-x-2'>
                                    <p className='hidden text-sm font-medium sm:block'>Nb par page</p>
                                    <Select
                                        value={`${limit}`}
                                        onValueChange={(value) => {
                                            setPage(1); // Reset to first page on page size change
                                            setLimit(Number(value));
                                        }}
                                    >
                                        <SelectTrigger className='h-8 w-[70px]'>
                                            <SelectValue placeholder={`${limit}`} />
                                        </SelectTrigger>
                                        <SelectContent side='top'>
                                            {[5, 10, 20, 30, 40, 50, 100].map((pageSize) => (
                                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                                    {pageSize}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
                                    Page {page} of {Math.ceil(totalItems / limit)}
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Button
                                        variant='outline'
                                        className='hidden h-8 w-8 p-0 lg:flex'
                                        onClick={() => setPage(1)}
                                        disabled={page === 1}
                                    >
                                        <span className='sr-only'>Go to first page</span>
                                        <MdDoubleArrow className='h-4 w-4' />
                                    </Button>
                                    <Button
                                        variant='outline'
                                        className='h-8 w-8 p-0'
                                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                        disabled={page === 1}
                                    >
                                        <span className='sr-only'>Go to previous page</span>
                                        <ChevronLeftIcon className='h-4 w-4' />
                                    </Button>
                                    <Button
                                        variant='outline'
                                        className='h-8 w-8 p-0'
                                        onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(totalItems / limit)))}
                                        disabled={page === Math.ceil(totalItems / limit)}
                                    >
                                        <span className='sr-only'>Go to next page</span>
                                        <ChevronRightIcon className='h-4 w-4' />
                                    </Button>
                                    <Button
                                        variant='outline'
                                        className='hidden h-8 w-8 p-0 lg:flex'
                                        onClick={() => setPage(Math.ceil(totalItems / limit))}
                                        disabled={page === Math.ceil(totalItems / limit)}
                                    >
                                        <span className='sr-only'>Go to last page</span>
                                        <MdDoubleArrow className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </>
    );
};

