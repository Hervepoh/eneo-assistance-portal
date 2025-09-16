import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/login";
import SignUp from "./pages/auth/signup";
import ForgotPassword from "./pages/auth/forgot-password";
import ConfirmAccount from "./pages/auth/confirm-account";
import ResetPassword from "./pages/auth/reset-password";
import VerifyMfa from "./pages/auth/verify-mfa";
import Home from "./pages/home";
import Session from "./pages/sessions";
import Request from "./pages/requests";
import AppLayout from "./layout/AppLayout";
import BaseLayout from "./layout/BaseLayout";
import AuthRoute from "./routes/auth.route";
import PublicRoute from "./routes/public.route";
import MyRequest from "./pages/my-requests";
import RequestDetail from "./pages/requests/RequestDetail";
import RequestToSupH from "./pages/requests/RequestsToSuph";
import Security from "./pages/security";
import RequestToVerify from "./pages/requests/RequestsToVerify";
import RequestToDec from "./pages/requests/RequestsToDec";
import RequestToTreat from "./pages/requests/RequestsToTreat";
import RequestToBao from "./pages/requests/RequestsToBao";
import AdminLayout from "./layout/AdminLayout";
import UsersList from "./pages/admin/usersList";
import CreateUser from "./pages/admin/CreateUser";
import EditUser from "./pages/admin/EditUser";
import RolesList from "./pages/admin/RolesList";
import AdministrationDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<BaseLayout />}>
            <Route path="" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="confirm-account" element={<ConfirmAccount />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-mfa" element={<VerifyMfa />} />
          </Route>
        </Route>

        {/* Protected Route */}
        <Route element={<AuthRoute />}>
          <Route element={<AppLayout />}>
            <Route path="home" element={<Home />} />
            <Route path="requests" element={<Outlet />}>
              <Route path="new" element={<Request />} />

              <Route path="my" element={<Outlet />}>
                <Route path="" element={<MyRequest />} />
                <Route path=":reference" element={<RequestDetail />} />
              </Route>

              <Route path="validate/suph" element={<Outlet />}>
                <Route path="" element={<RequestToSupH />} />
                <Route path=":reference" element={<RequestDetail />} />
              </Route>

              <Route path="validate/verify" element={<Outlet />}>
                <Route path="" element={<RequestToVerify />} />
                <Route path=":reference" element={<RequestDetail />} />
              </Route>

              <Route path="validate/dec" element={<Outlet />}>
                <Route path="" element={<RequestToDec />} />
                <Route path=":reference" element={<RequestDetail />} />
              </Route>

              <Route path="validate/bao" element={<Outlet />}>
                <Route path="" element={<RequestToBao />} />
                <Route path=":reference" element={<RequestDetail />} />
              </Route>

              <Route path="in-process" element={<RequestToTreat />} />

            </Route>
            <Route path="sessions" element={<Session />} />
            <Route path="security" element={<Security />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route path="" element={<AdministrationDashboard />} />
              <Route path="users" element={<UsersList />} />
              <Route path="users/new" element={<CreateUser />} />
              <Route path="users/:id" element={<EditUser />} />
              <Route path="users/:id/edit" element={<EditUser />} />
              <Route path="roles" element={<RolesList />} />
              {/* <Route path="roles/new" element={<RoleForm />} />
              <Route path="permissions" element={<PermissionsList />} /> */}
            </Route>
          </Route>
        </Route>
        {/* Catch-all for undefined routes */}
        <Route path="*" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
