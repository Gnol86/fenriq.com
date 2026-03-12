// auth/organization-permissions.js
import { createAccessControl } from "better-auth/plugins/access";

export const ORG_RESOURCES = {
    organization: ["update", "delete"],
    member: ["create", "update", "delete", "read"],
    invitation: ["read", "create", "cancel"],
};

const CUSTOM_RESOURCES = {
    app: ["use"],
    billing: ["manage"],
    vehicle: ["create", "update", "delete", "read"],
    checklist: ["create", "update", "delete", "read"],
    checklistCategory: ["create", "update", "delete", "read"],
    checklistAssignment: ["create", "update", "delete", "read"],
    checklistSubmission: ["read"],
    checklistSubscription: ["read", "update"],
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
    billing: ["manage"],
    vehicle: ["create", "update", "delete", "read"],
    checklist: ["create", "update", "delete", "read"],
    checklistCategory: ["create", "update", "delete", "read"],
    checklistAssignment: ["create", "update", "delete", "read"],
    checklistSubmission: ["read"],
    checklistSubscription: ["read", "update"],
});

// ADMIN: presque tout, sauf delete org / changer owner
export const adminPermissions = ac.newRole({
    app: ["use"],
    member: ["update", "delete", "read"],
    invitation: ["read", "create", "cancel"],
    vehicle: ["create", "update", "delete", "read"],
    checklist: ["create", "update", "delete", "read"],
    checklistCategory: ["create", "update", "delete", "read"],
    checklistAssignment: ["create", "update", "delete", "read"],
    checklistSubmission: ["read"],
    checklistSubscription: ["read", "update"],
});

// MEMBER: accès limité
export const memberPermissions = ac.newRole({
    app: ["use"],
    vehicle: ["read"],
    checklist: ["read"],
    checklistCategory: ["read"],
    checklistAssignment: ["read"],
    checklistSubmission: ["read"],
    checklistSubscription: ["read", "update"],
});

export const roleMatrix = {
    owner: ownerPermissions,
    admin: adminPermissions,
    member: memberPermissions,
};
