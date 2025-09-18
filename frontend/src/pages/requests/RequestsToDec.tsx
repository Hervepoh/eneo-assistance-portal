import { ListeDemandes } from "@/components/request/ListeDemandes";

const RequestToDec = () => {
  return (
    <ListeDemandes
      title="Demandes à valider (DEC)"
      mode="as-dec"
      statusFilter="PENDING_DELEGUE"
      hideFilters={true}
    />
  );
};

export default RequestToDec;
