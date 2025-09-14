import { ListeDemandes } from "@/components/request/ListeDemandes";

const RequestToSupH = () => {
  return (
    <ListeDemandes
      title="Demandes à valider niveau N+1"
      mode="as-n1"
      statusFilter="SUBMITTED"
      hideFilters={true}
    />
  );
};

export default RequestToSupH;
