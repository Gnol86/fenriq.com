import { describe, expect, test } from "bun:test";
import { buildOrganizationPermissions } from "./organization-permissions.helpers";

const baseStatements = {
    app: ["use"],
    member: ["create", "read"],
    billing: ["manage"],
};

const baseRoles = {
    owner: {
        app: ["use"],
        member: ["create", "read"],
        billing: ["manage"],
    },
    admin: {
        app: ["use"],
        member: ["read"],
    },
    member: {
        app: ["use"],
    },
};

describe("organization permissions helpers", () => {
    test("merges statements and roles additively", () => {
        const permissions = buildOrganizationPermissions({
            baseStatements,
            baseRoles,
            projectExtension: {
                statements: {
                    vehicle: ["read", "update"],
                    member: ["delete"],
                },
                roles: {
                    owner: {
                        vehicle: ["read", "update"],
                        member: ["delete"],
                    },
                    admin: {
                        vehicle: ["read"],
                    },
                    member: {
                        vehicle: ["read"],
                    },
                },
            },
        });

        expect(permissions.statements).toEqual({
            app: ["use"],
            member: ["create", "read", "delete"],
            billing: ["manage"],
            vehicle: ["read", "update"],
        });

        expect(permissions.roles.owner).toEqual({
            app: ["use"],
            member: ["create", "read", "delete"],
            billing: ["manage"],
            vehicle: ["read", "update"],
        });
        expect(permissions.roles.admin).toEqual({
            app: ["use"],
            member: ["read"],
            vehicle: ["read"],
        });
        expect(permissions.roles.member).toEqual({
            app: ["use"],
            vehicle: ["read"],
        });
    });

    test("preserves base permissions when the project extension is empty", () => {
        const permissions = buildOrganizationPermissions({
            baseStatements,
            baseRoles,
            projectExtension: {},
        });

        expect(permissions.statements).toEqual(baseStatements);
        expect(permissions.roles).toEqual(baseRoles);
    });

    test("rejects role resources that are missing from statements", () => {
        expect(() =>
            buildOrganizationPermissions({
                baseStatements,
                baseRoles,
                projectExtension: {
                    roles: {
                        owner: {
                            vehicle: ["read"],
                        },
                    },
                },
            })
        ).toThrow("roles.owner.vehicle references an unknown resource");
    });

    test("rejects role actions that are not declared in the resource", () => {
        expect(() =>
            buildOrganizationPermissions({
                baseStatements,
                baseRoles,
                projectExtension: {
                    statements: {
                        vehicle: ["read"],
                    },
                    roles: {
                        owner: {
                            vehicle: ["delete"],
                        },
                    },
                },
            })
        ).toThrow('roles.owner.vehicle uses unknown action "delete"');
    });
});
