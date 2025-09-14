import { ListeDemandes } from "@/components/request/ListeDemandes";

const RequestToTreat = () => {
  return (
    <ListeDemandes
      title="Demandes à traiter"
      mode="all"
      statusFilter="TO_PROCESS"
      hideFilters={true}
    />
  );
};

export default RequestToTreat;
