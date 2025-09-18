import { ListeDemandes } from "@/components/request/ListeDemandes";

const RequestToVerify = () => {
  return (
    <ListeDemandes
      title="Demandes à vérifier"
      mode="as-verif"
      statusFilter="UNDER_VERIFICATION"
      hideFilters={true}
    />
  );
};

export default RequestToVerify;
