// auth/organization-permissions.js
import { createAccessControl } from "better-auth/plugins/access";

export const ORG_RESOURCES = {
    organization: ["update", "delete"],
    member: ["list", "role_membre", "role_admin", "role_owner", "delete"],
    invitation: ["list", "create", "cancel"],
};

const CUSTOM_RESOURCES = {
    app: ["use"],
    billing: ["read", "update"],
};

export const statements = {
    ...ORG_RESOURCES,
    ...CUSTOM_RESOURCES,
};

export const ac = createAccessControl(statements);

export const ownerPermissions = ac.newRole({
    app: ["use"],
    organization: ["update", "delete"],
    member: ["list", "role_membre", "role_admin", "role_owner", "delete"],
    invitation: ["create", "cancel"],
    billing: ["read", "update"],
});

// ADMIN: presque tout, sauf delete org / changer owner
export const adminPermissions = ac.newRole({
    app: ["use"],
    member: ["list", "role_membre", "role_admin", "delete"],
    invitation: ["create", "cancel"],
    billing: ["read"],
});

// MEMBER: accès limité
export const memberPermissions = ac.newRole({ app: ["use"] });

export const roleMatrix = {
    owner: ownerPermissions,
    admin: adminPermissions,
    member: memberPermissions,
};
