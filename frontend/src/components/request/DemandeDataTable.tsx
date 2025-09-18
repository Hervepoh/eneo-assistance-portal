import { useCallback, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CircleCheckBigIcon, Download, Eye, Loader2, RotateCcw, Send, Upload, FileText, X } from "lucide-react";
import Papa from "papaparse";
import { Demande, ModeType } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectAssistanceMutationFn, submitAssistanceMutationFn, validateAssistanceMutationFn, verifyAssistanceMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { assistanceQueryKey } from "@/queries";

type Props = Readonly<{
  demandes: Demande[];
  onDemandeClick: (id: string) => void;
  mode: ModeType
}>;

type VerificationAction = 
  | "SEND_TO_PROCESS"        // Envoyer directement en traitement
  | "SEND_TO_DEC"            // Envoyer en validation DEC
  | "SEND_TO_BAO"            // Envoyer en validation BAO  
  | "SEND_TO_DEC_BAO"        // Envoyer en validation DEC & BAO
  | "RETURN_TO_USER";        // Renvoyer à l'utilisateur pour modification

const columnHelper = createColumnHelper<Demande>();

export function DemandeDataTable({ demandes, onDemandeClick, mode }: Props) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(10);
  const [validateDialogOpen, setValidateDialogOpen] = useState<number | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<number | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  // États pour la vérification
  const [verificationAction, setVerificationAction] = useState<VerificationAction>("SEND_TO_PROCESS");
  const [modificationComment, setModificationComment] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  // ⚡ Mutation pour soumettre la demande
  const { mutate: submitAssistance, isPending } = useMutation({
    mutationFn: submitAssistanceMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [assistanceQueryKey] });
      toast({
        title: 'Succès',
        description: 'La demande a été soumise avec succès.',
        variant: 'default',
      });
    },
    onError: (error: Error, id: number) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la soumission.',
        variant: 'destructive',
      });
      console.error('Erreur lors de la soumission:', id, error);
    }
  });

  // ⚡ Mutation pour valider la demande
  const { mutate: validateAssistance, isPending: isValidating } = useMutation({
    mutationFn: validateAssistanceMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [assistanceQueryKey] });
      toast({
        title: 'Succès',
        description: 'La demande a été validée avec succès.',
        variant: 'default',
      });
      setValidateDialogOpen(null);
    },
    onError: (error: Error, id: number) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la validation.',
        variant: 'destructive',
      });
      console.error('Erreur lors de la validation:', id, error);
    }
  });

  // ⚡ Mutation pour vérifier la demande (nouveau)
  const { mutate: verifyAssistance, isPending: isVerifying } = useMutation({
    mutationFn: ({ id, action, comment, file }: { 
      id: number; 
      action: VerificationAction; 
      comment?: string; 
      file?: File;
    }) => verifyAssistanceMutationFn(id, { action, comment, file }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [assistanceQueryKey] });
      toast({
        title: 'Succès',
        description: 'La vérification a été effectuée avec succès.',
        variant: 'default',
      });
      resetVerificationForm();
      setVerifyDialogOpen(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la vérification.',
        variant: 'destructive',
      });
      console.error('Erreur lors de la vérification:', error);
    }
  });

  // ⚡ Mutation pour rejeter la demande
  const { mutate: rejectAssistance, isPending: isRejecting } = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      rejectAssistanceMutationFn(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [assistanceQueryKey] });
      toast({
        title: 'Succès',
        description: 'La demande a été rejetée avec succès.',
        variant: 'default',
      });
      setRejectDialogOpen(null);
      setRejectReason("");
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du rejet.',
        variant: 'destructive',
      });
      console.error('Erreur lors du rejet:', error);
    }
  });

  const handleSubmit = useCallback((id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir soumettre cette demande ?')) {
      submitAssistance(id);
    }
  }, [submitAssistance]);

  const handleValidate = useCallback((id: number) => {
    validateAssistance(id);
  }, [validateAssistance]);

  const handleVerify = useCallback((id: number) => {
    // Validation selon l'action choisie
    if (verificationAction === "RETURN_TO_USER" && !modificationComment.trim()) {
      toast({
        title: 'Commentaire requis',
        description: 'Veuillez saisir un commentaire pour les modifications requises.',
        variant: 'destructive',
      });
      return;
    }

    verifyAssistance({
      id,
      action: verificationAction,
      comment: verificationAction === "RETURN_TO_USER" ? modificationComment : undefined,
      file: attachedFile || undefined
    });
  }, [verificationAction, modificationComment, attachedFile, verifyAssistance]);

  const handleReject = useCallback((id: number) => {
    if (!rejectReason.trim()) {
      toast({
        title: 'Motif requis',
        description: 'Veuillez saisir un motif de rejet.',
        variant: 'destructive',
      });
      return;
    }
    rejectAssistance({ id, reason: rejectReason });
  }, [rejectReason, rejectAssistance]);

  const resetVerificationForm = () => {
    setVerificationAction("SEND_TO_PROCESS");
    setModificationComment("");
    setAttachedFile(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérification du type de fichier (optionnel)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Type de fichier non autorisé',
          description: 'Seuls les fichiers PDF, Word et images sont autorisés.',
          variant: 'destructive',
        });
        return;
      }
      
      // Vérification de la taille (optionnel, ex: 5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Fichier trop volumineux',
          description: 'La taille du fichier ne doit pas dépasser 5MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setAttachedFile(file);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
  };

  const getActionLabel = (action: VerificationAction) => {
    switch (action) {
      case "SEND_TO_PROCESS": return "Envoyer directement en traitement";
      case "SEND_TO_DEC": return "Envoyer en validation DEC";
      case "SEND_TO_BAO": return "Envoyer en validation BAO";
      case "SEND_TO_DEC_BAO": return "Envoyer en validation DEC & BAO";
      case "RETURN_TO_USER": return "Renvoyer à l'utilisateur pour modification";
      default: return action;
    }
  };

  const TitreCell = ({ value }: { value: string }) => {
    return <div className="font-medium">{value}</div>;
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor("reference", { header: "Reference", cell: info => info.getValue() }),
      columnHelper.accessor("titre", {
        header: "Titre",
        cell: info => <TitreCell value={info.getValue()} />,
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
            "DRAFT": "bg-gray-100 text-gray-700",
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

            {mode == "as-n1" &&
              <Tooltip>
                <AlertDialog
                  open={validateDialogOpen === row.original.id}
                  onOpenChange={(open) => setValidateDialogOpen(open ? row.original.id : null)}
                >
                  <AlertDialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-500"
                        disabled={isValidating}
                        title="Valider"
                      >
                        <CircleCheckBigIcon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer la validation</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir valider la demande <strong>{row.original.reference}</strong> ?
                        <br />
                        <span className="text-sm text-gray-600 mt-2 block">
                          Cette action est irréversible et vous êtes responsable de toutes vos actions dans le système.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleValidate(row.original.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isValidating}
                      >
                        {isValidating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Validation...
                          </>
                        ) : (
                          'Valider'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <TooltipContent className="bg-green-500 text-white">
                  <p>Valider</p>
                </TooltipContent>
              </Tooltip>
            }
            
            {mode == "as-n1" &&
              <Tooltip>
                <AlertDialog
                  open={rejectDialogOpen === row.original.id}
                  onOpenChange={(open) => {
                    setRejectDialogOpen(open ? row.original.id : null);
                    if (!open) {
                      setRejectReason("");
                    }
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isRejecting}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rejeter la demande</AlertDialogTitle>
                      <AlertDialogDescription>
                        Vous êtes sur le point de rejeter la demande <strong>{row.original.reference}</strong>.
                        <br />
                        <span className="text-sm text-gray-600 mt-2 block">
                          Veuillez obligatoirement saisir le motif du rejet.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-4">
                      <Label htmlFor="reject-reason" className="text-sm font-medium">
                        Motif du rejet *
                      </Label>
                      <Textarea
                        id="reject-reason"
                        placeholder="Expliquez clairement les raisons du rejet..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      {rejectReason.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {rejectReason.length} caractères
                        </p>
                      )}
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleReject(row.original.id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isRejecting || !rejectReason.trim()}
                      >
                        {isRejecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Rejet...
                          </>
                        ) : (
                          'Confirmer le rejet'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <TooltipContent className="bg-red-500 text-white">
                  <p>Rejeter</p>
                </TooltipContent>
              </Tooltip>
            }

            {/* Modal de vérification complexe */}
            {mode == "as-verif" &&
              <Tooltip>
                <Dialog
                  open={verifyDialogOpen === row.original.id}
                  onOpenChange={(open) => {
                    setVerifyDialogOpen(open ? row.original.id : null);
                    if (!open) {
                      resetVerificationForm();
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="default"
                        disabled={isVerifying}
                        title="Vérifier"
                      >
                        <CircleCheckBigIcon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Vérification de la demande</DialogTitle>
                      <DialogDescription>
                        Demande <strong>{row.original.reference}</strong> - Choisissez l'action à effectuer
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      {/* Choix de l'action */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Action à effectuer *</Label>
                        <RadioGroup 
                          value={verificationAction} 
                          onValueChange={(value) => setVerificationAction(value as VerificationAction)}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SEND_TO_PROCESS" id="process" />
                            <Label htmlFor="process" className="cursor-pointer">
                              Envoyer directement en traitement
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SEND_TO_DEC" id="dec" />
                            <Label htmlFor="dec" className="cursor-pointer">
                              Envoyer en validation DEC
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SEND_TO_BAO" id="bao" />
                            <Label htmlFor="bao" className="cursor-pointer">
                              Envoyer en validation BAO
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SEND_TO_DEC_BAO" id="dec-bao" />
                            <Label htmlFor="dec-bao" className="cursor-pointer">
                              Envoyer en validation DEC & BAO
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="RETURN_TO_USER" id="return" />
                            <Label htmlFor="return" className="cursor-pointer text-orange-700">
                              Renvoyer à l'utilisateur pour modification
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Commentaire pour modification (si RETURN_TO_USER) */}
                      {verificationAction === "RETURN_TO_USER" && (
                        <div className="space-y-2 p-4 border border-orange-200 rounded-lg bg-orange-50">
                          <Label htmlFor="modification-comment" className="text-sm font-medium text-orange-800">
                            Commentaire pour l'utilisateur *
                          </Label>
                          <Textarea
                            id="modification-comment"
                            placeholder="Décrivez clairement les modifications à apporter..."
                            value={modificationComment}
                            onChange={(e) => setModificationComment(e.target.value)}
                            rows={4}
                            className="resize-none border-orange-300 focus:border-orange-500"
                          />
                          {modificationComment.length > 0 && (
                            <p className="text-xs text-orange-600">
                              {modificationComment.length} caractères
                            </p>
                          )}
                          
                          {/* Upload de fichier */}
                          <div className="space-y-2 mt-4">
                            <Label className="text-sm font-medium text-orange-800">
                              Fichier joint (optionnel)
                            </Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="hidden"
                                id={`file-upload-${row.original.id}`}
                              />
                              <Label 
                                htmlFor={`file-upload-${row.original.id}`}
                                className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-orange-300 rounded-md hover:bg-orange-100 text-sm"
                              >
                                <Upload className="w-4 h-4" />
                                Joindre un fichier
                              </Label>
                              {attachedFile && (
                                <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100 px-2 py-1 rounded">
                                  <FileText className="w-4 h-4" />
                                  <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeFile}
                                    className="h-auto p-0 text-orange-600 hover:text-orange-800"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-orange-600">
                              Formats acceptés: PDF, Word, JPG, PNG (max 5MB)
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Résumé de l'action */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Action sélectionnée:</strong> {getActionLabel(verificationAction)}
                        </p>
                        {verificationAction === "RETURN_TO_USER" && modificationComment && (
                          <p className="text-xs text-blue-600 mt-1">
                            Commentaire: {modificationComment.substring(0, 100)}
                            {modificationComment.length > 100 && "..."}
                          </p>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setVerifyDialogOpen(null)}>
                        Annuler
                      </Button>
                      <Button
                        onClick={() => handleVerify(row.original.id)}
                        disabled={isVerifying || (verificationAction === "RETURN_TO_USER" && !modificationComment.trim())}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          'Confirmer la vérification'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <TooltipContent className="bg-blue-500 text-white">
                  <p>Vérifier</p>
                </TooltipContent>
              </Tooltip>
            }

            {mode == "as-verif" &&
              <Tooltip>
                <AlertDialog
                  open={rejectDialogOpen === row.original.id}
                  onOpenChange={(open) => {
                    setRejectDialogOpen(open ? row.original.id : null);
                    if (!open) {
                      setRejectReason("");
                    }
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isRejecting}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rejeter la demande</AlertDialogTitle>
                      <AlertDialogDescription>
                        Vous êtes sur le point de rejeter la demande <strong>{row.original.reference}</strong>.
                        <br />
                        <span className="text-sm text-gray-600 mt-2 block">
                          Veuillez obligatoirement saisir le motif du rejet.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-4">
                      <Label htmlFor="reject-reason" className="text-sm font-medium">
                        Motif du rejet *
                      </Label>
                      <Textarea
                        id="reject-reason"
                        placeholder="Expliquez clairement les raisons du rejet..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      {rejectReason.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {rejectReason.length} caractères
                        </p>
                      )}
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleReject(row.original.id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isRejecting || !rejectReason.trim()}
                      >
                        {isRejecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Rejet...
                          </>
                        ) : (
                          'Confirmer le rejet'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <TooltipContent className="bg-red-500 text-white">
                  <p>Rejeter</p>
                </TooltipContent>
              </Tooltip>
            }

            <Tooltip>
              <TooltipTrigger>
                <Button size="sm" variant="outline" onClick={() => onDemandeClick(row.original.reference)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-500 text-white">
                <p>Voir</p>
              </TooltipContent>
            </Tooltip>

            {mode == "my" && row.original.statut.toLowerCase() == "draft" &&
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSubmit(row.original.id)}
                    disabled={isPending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Soumettre</p>
                </TooltipContent>
              </Tooltip>
            }
          </div>
        )
      })
    ],
    [onDemandeClick, handleValidate, handleReject, handleSubmit, handleVerify, isPending, isRejecting, isValidating, isVerifying, mode, rejectDialogOpen, validateDialogOpen, verifyDialogOpen]
  );

  // Client-side global filter (simple)
  const filteredRows = useMemo(() => {
    if (!globalFilter) return demandes;
    const q = globalFilter.toLowerCase();
    return demandes.filter(d =>
      d.titre.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      `${d.demandeur?.name ?? ""} ${d.demandeur?.name ?? ""}`.toLowerCase().includes(q)
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
      demandeur: `${r.demandeur1?.prenom ?? ""} ${r.demandeur?.nom ?? ""}`,
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