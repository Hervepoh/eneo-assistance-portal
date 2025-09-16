import { Outlet } from "react-router-dom";
import { useAuthContext } from "@/context/auth-provider";

const AdminLayout = () => {
  const { user } = useAuthContext();

  if (!user?.activePermissions?.includes("users:read")) {
    // return <div className="p-6 text-red-600">⛔ Accès interdit</div>;
  }

  return <Outlet />

};

export default AdminLayout;
