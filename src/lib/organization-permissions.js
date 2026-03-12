// auth/organization-permissions.js
import { createAccessControl } from "better-auth/plugins/access";
import addOnOrganizationPermissions from "@/project/add-on-organization-permissions";
import { buildOrganizationPermissions } from "./organization-permissions.helpers";

export const ORG_RESOURCES = {
    organization: ["update", "delete"],
    member: ["create", "update", "delete", "read"],
    invitation: ["read", "create", "cancel"],
};

const BASE_CUSTOM_RESOURCES = {
    app: ["use"],
    billing: ["manage"],
};

const BASE_ROLE_STATEMENTS = {
    owner: {
        app: ["use"],
        organization: ["update", "delete"],
        member: ["update", "delete", "read"],
        invitation: ["read", "create", "cancel"],
        billing: ["manage"],
    },
    admin: {
        app: ["use"],
        member: ["update", "delete", "read"],
        invitation: ["read", "create", "cancel"],
    },
    member: {
        app: ["use"],
    },
};

const resolvedPermissions = buildOrganizationPermissions({
    baseStatements: {
        ...ORG_RESOURCES,
        ...BASE_CUSTOM_RESOURCES,
    },
    baseRoles: BASE_ROLE_STATEMENTS,
    projectExtension: addOnOrganizationPermissions,
});

export const statements = resolvedPermissions.statements;

export const ac = createAccessControl(statements);

export const ownerPermissions = ac.newRole(resolvedPermissions.roles.owner);

// ADMIN: presque tout, sauf delete org / changer owner
export const adminPermissions = ac.newRole(resolvedPermissions.roles.admin);

// MEMBER: accès limité
export const memberPermissions = ac.newRole(resolvedPermissions.roles.member);

export const roleMatrix = {
    owner: ownerPermissions,
    admin: adminPermissions,
    member: memberPermissions,
};
