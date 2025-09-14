// DemandeDataTable.tsx
import React, { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CircleCheckBigIcon, Download, Eye, Undo } from "lucide-react";
import Papa from "papaparse";
import { Demande, ModeType } from "../../types";

type Props = {
  demandes: Demande[];
  onDemandeClick: (id: string) => void;
  mode: ModeType
};

const columnHelper = createColumnHelper<Demande>();

export function DemandeDataTable({ demandes, onDemandeClick, mode }: Props) {

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(10);

  const columns = useMemo(
    () => [
      columnHelper.accessor("reference", { header: "Reference", cell: info => info.getValue() }),
      columnHelper.accessor("titre", {
        header: "Titre",
        cell: info => <div className="font-medium">{info.getValue()}</div>,
      }),
      columnHelper.accessor("application", { header: "Application" }),
      columnHelper.accessor("region", { header: "Région" }),
      columnHelper.accessor("agence", { header: "Agence" }),
      columnHelper.accessor("priorite", {
        header: "Priorité",
        cell: info => {
          const val = info.getValue();
          const color =
            val === "critique" ? "bg-red-100 text-red-700" :
              val === "haute" ? "bg-orange-100 text-orange-700" :
                val === "normale" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700";
          return <Badge className={`${color} capitalize`}>{val}</Badge>;
        }
      }),
      columnHelper.accessor("statut", {
        header: "Statut",
        cell: info => {
          const s = info.getValue() as string;
          const map: Record<string, string> = {
            "brouillon": "bg-gray-100 text-gray-700",
            "soumise": "bg-blue-100 text-blue-700",
            "en_cours": "bg-yellow-100 text-yellow-800",
            "resolue": "bg-green-100 text-green-700",
            "rejetee": "bg-red-100 text-red-700",
            "fermee": "bg-slate-100 text-slate-700"
          };
          return <Badge className={`${map[s] || "bg-gray-100 text-gray-700"} capitalize`}>{s.replace('_', ' ')}</Badge>;
        }
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">

            {mode == "as-n1" && <Button size="sm" variant="default" onClick={() => onDemandeClick(row.original.reference)}>
              <CircleCheckBigIcon className="w-4 h-4" />
            </Button>}
            {mode == "as-n1" && <Button size="sm" variant="destructive" onClick={() => downloadRowCsv(row.original)}>
              <Undo className="w-4 h-4" />
            </Button>}
            <Button size="sm" variant="outline" onClick={() => onDemandeClick(row.original.reference)}>
              <Eye className="w-4 h-4" />
            </Button>
            {/* <Button size="sm" variant="ghost" onClick={() => downloadRowCsv(row.original)}>
                  <Download className="w-4 h-4" />
                </Button> */}

          </div>
        )
      })
    ],
    [onDemandeClick]
  );

  // Client-side global filter (simple)
  const filteredRows = useMemo(() => {
    if (!globalFilter) return demandes;
    const q = globalFilter.toLowerCase();
    return demandes.filter(d =>
      d.titre.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      `${d.demandeur?.name ?? ""} ${d.demandeur?.nom ?? ""}`.toLowerCase().includes(q)
    );
  }, [globalFilter, demandes]);

  // Table instance
  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });



  // Export all filtered rows to CSV
  function exportCsv() {
    const rows = filteredRows.map(r => ({
      id: r.id,
      titre: r.titre,
      demandeur: `${r.demandeur?.prenom ?? ""} ${r.demandeur?.nom ?? ""}`,
      region: r.region,
      delegation: r.delegation,
      agence: r.agence,
      priorite: r.priorite,
      statut: r.statut
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demandes_export_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadRowCsv(row: Demande) {
    const csv = Papa.unparse([{
      id: row.id,
      titre: row.titre,
      demandeur: `${row.demandeur?.prenom ?? ""} ${row.demandeur?.nom ?? ""}`,
      region: row.region,
      delegation: row.delegation,
      agence: row.agence,
      priorite: row.priorite,
      statut: row.statut
    }]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demande_${row.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder="Rechercher titre, description ou demandeur..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="min-w-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y table-auto">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-600"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        role="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-2 select-none"
                        aria-sort={header.column.getIsSorted() ? (header.column.getIsSorted() === "asc" ? "ascending" : "descending") : "none"}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className="text-xs text-gray-400">
                          {header.column.getIsSorted() ? (header.column.getIsSorted() === "asc" ? " ▲" : " ▼") : ""}
                        </span>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y">
            {table.getRowModel().rows.slice(0, pageSize).map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-3 py-3 text-sm text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination simple (client-side) */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Affichage {Math.min(1, filteredRows.length)} - {Math.min(pageSize, filteredRows.length)} sur {filteredRows.length}
        </div>
        <div className="flex items-center gap-2">
          {/* Si besoin, ajouter vrais boutons next/prev en se basant sur table.getState().pagination */}
          <Button size="sm" variant="ghost" disabled>
            Prev
          </Button>
          <Button size="sm" variant="ghost" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
