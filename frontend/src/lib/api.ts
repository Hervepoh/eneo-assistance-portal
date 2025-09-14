import API from "./axios-client";
import {
  ID,
  loginType,
  mfaLoginType,
  mfaType,
  registerType,
  resetPasswordType,
  SessionResponseType,
  forgotPasswordType,
  verifyEmailType,
  verifyMFAType
} from "@/types";


export const loginMutationFn = async (data: loginType) =>
  await API.post(`/auth/login`, data);

export const registerMutationFn = async (data: registerType) =>
  await API.post(`/auth/register`, data);

export const verifyEmailMutationFn = async (data: verifyEmailType) =>
  await API.post(`/auth/verify/email`, data);

export const forgotPasswordMutationFn = async (data: forgotPasswordType) =>
  await API.post(`/auth/password/forgot`, data);

export const resetPasswordMutationFn = async (data: resetPasswordType) =>
  await API.post(`/auth/password/reset`, data);

export const verifyMFAMutationFn = async (data: verifyMFAType) =>
  await API.post(`/mfa/verify`, data);

export const verifyMFALoginMutationFn = async (data: mfaLoginType) =>
  await API.post(`/mfa/verify-login`, data);

export const logoutMutationFn = async () => 
  await API.post(`/auth/logout`);

export const mfaSetupQueryFn = async () => {
  const response = await API.get<mfaType>(`/mfa/setup`);
  return response.data;
};

export const revokeMFAMutationFn = async () =>
  await API.put(`/mfa/revoke`, {});

export const getUserSessionQueryFn = async () =>
  await API.get(`/session/`);

export const sessionsQueryFn = async () => {
  const response = await API.get<SessionResponseType>(`/session/all`);
  return response.data;
};

export const sessionDelMutationFn = async (id: string) =>
  await API.delete(`/session/${id}`);

export const getOrgReferenceQueryFn = async () =>
  await API.get(`/references/organizations`);

export const getAppReferenceQueryFn = async () =>
  await API.get(`/references/applications`);

export const getMyRequestsQueryFn = async (params: any) =>
  await API.get('/assistance/me', { params });

export const getRequestsToValidateN1QueryFn = async (params: any) =>
  await API.get('/assistance/validate/n1', { params });

export const getRequestByReferenceQueryFn = async (reference: string) => {
  const res = await API.get(`/assistance/${reference}`);
  return res.data;
};

export const createAssistanceMutationFn = async (data: any) =>
  await API.post(`/assistance`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const actionAssistanceMutationFn = async (id: string, data: any) =>
  await API.post(`/assistance/${id}/action`, data);

// USERS
export const getUsersQueryFn = async (params: any) =>
  await API.get(`/users`, { params });

export const getUserByIdQueryFn = async (id: string | number) =>
  await API.get(`/users/${id}`);

export const createUserMutationFn = async (payload: any) =>
  await API.post(`/users`, payload);

export const updateUserMutationFn = async (id: string | number, payload: any) =>
  await API.put(`/users/${id}`, payload);

export const deleteUserMutationFn = async (id: string | number) =>
  await API.delete(`/users/${id}`);

// ROLES
export const getRolesQueryFn = async (params: any) =>
  await API.get(`/roles`, { params });

export const getRoleByIdQueryFn = async (id: string | number) =>
  await API.get(`/roles/${id}`);

export const createRoleMutationFn = async (payload: any) =>
  await API.post(`/roles`, payload);

export const updateRoleMutationFn = async (id: string | number, payload: any) =>
  await API.put(`/roles/${id}`, payload);

export const deleteRoleMutationFn = async (id: string | number) =>
  await API.delete(`/roles/${id}`);

// PERMISSIONS
export const getPermissionsQueryFn = async (params: any) =>
  await API.get(`/permissions`, { params });

// RBAC
export const assignRolesToUserMutationFn = async (userId: ID, roleIds: ID[]) =>
  await API.post(`/users/${userId}/roles`, { roleIds });

export const setPermissionsToRoleMutationFn = async (roleId: ID, permissionIds: ID[]) =>
  await API.post(`/roles/${roleId}/permissions`, { permissionIds });