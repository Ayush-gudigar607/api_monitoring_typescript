export const ROLES = [
    "super_admin",
    "client_admin",
    "client_viewer",
] as const;

export const CLIENT_ROLES = [
    "client_admin",
    "client_viewer",
] as const;

export const APPLICATION_ROLES = {
    SUPER_ADMIN: "super_admin",
    CLIENT_VIEWER: "client_viewer",
    CLIENT_ADMIN: "client_admin",
} as const;

export const isValidateClientRole = (role: string): boolean => {
    return CLIENT_ROLES.includes(role as any);
};

export const isValidRole = (role: string): boolean => {
    return ROLES.includes(role as any);
};