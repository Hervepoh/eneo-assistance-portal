import { ListeDemandes } from "@/components/request/ListeDemandes";

const RequestToBao = () => {
  return (
    <ListeDemandes
      title="Demandes à valider (BAO)"
      mode="all"
      statusFilter="PENDING_BUSINESS"
      hideFilters={true}
    />
  );
};

export default RequestToBao;
