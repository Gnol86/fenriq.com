// auth/organization-permissions.js
import { createAccessControl } from "better-auth/plugins/access";

export const ORG_RESOURCES = {
    organization: ["update", "delete"],
    member: ["create", "update", "delete", "read"],
    invitation: ["read", "create", "cancel"],
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
    member: ["update", "delete", "read"],
    invitation: ["read", "create", "cancel"],
    billing: ["read", "update"],
});

// ADMIN: presque tout, sauf delete org / changer owner
export const adminPermissions = ac.newRole({
    app: ["use"],
    member: ["update", "delete", "read"],
    invitation: ["read", "create", "cancel"],
    billing: ["read"],
});

// MEMBER: accès limité
export const memberPermissions = ac.newRole({ app: ["use"] });

export const roleMatrix = {
    owner: ownerPermissions,
    admin: adminPermissions,
    member: memberPermissions,
};
