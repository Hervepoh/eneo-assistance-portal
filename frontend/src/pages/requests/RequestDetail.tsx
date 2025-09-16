// src/pages/requests/RequestDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRequestByReferenceQueryFn } from "@/lib/api";
import { DetailDemande } from "@/components/request/DetailDemande";

export default function RequestDetail() {
  const { reference } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["request", reference],
    queryFn: () => getRequestByReferenceQueryFn((reference as string).toUpperCase()),
    enabled: !!reference,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        Chargement en cours...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        Erreur lors du chargement de la demande.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        Aucune demande trouvée.
      </div>
    );
  }

  return (
    <DetailDemande
      demande={data.request}
      onBack={() => navigate(-1)} // Retour à la page précédente
    />
  );
}
