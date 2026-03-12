const SUPPORTED_ROLE_NAMES = ["owner", "admin", "member"];

function createConfigError(extensionName, message) {
    return new Error(
        `[organization-permissions] Invalid project permissions in "${extensionName}": ${message}`
    );
}

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function ensurePlainObject(value, extensionName, path) {
    if (!isPlainObject(value)) {
        throw createConfigError(extensionName, `"${path}" must be an object.`);
    }
}

function ensureActionList(value, extensionName, path) {
    if (
        !Array.isArray(value) ||
        value.some(action => typeof action !== "string" || action.trim().length === 0)
    ) {
        throw createConfigError(extensionName, `"${path}" must be an array of non-empty strings.`);
    }
}

function mergeUniqueActions(baseActions = [], extensionActions = []) {
    const mergedActions = [...baseActions];

    for (const action of extensionActions) {
        if (!mergedActions.includes(action)) {
            mergedActions.push(action);
        }
    }

    return mergedActions;
}

export function mergePermissionMap(baseMap = {}, extensionMap = {}) {
    const mergedMap = {};

    for (const [resource, actions] of Object.entries(baseMap)) {
        mergedMap[resource] = mergeUniqueActions(actions, extensionMap[resource] ?? []);
    }

    for (const [resource, actions] of Object.entries(extensionMap)) {
        if (!Object.hasOwn(mergedMap, resource)) {
            mergedMap[resource] = mergeUniqueActions([], actions);
        }
    }

    return mergedMap;
}

function normalizeExtension(projectExtension, extensionName) {
    const extension = projectExtension ?? {};
    ensurePlainObject(extension, extensionName, "default export");

    const allowedTopLevelKeys = new Set(["statements", "roles"]);
    for (const key of Object.keys(extension)) {
        if (!allowedTopLevelKeys.has(key)) {
            throw createConfigError(
                extensionName,
                `unsupported top-level key "${key}". Only "statements" and "roles" are allowed.`
            );
        }
    }

    const statements = extension.statements ?? {};
    ensurePlainObject(statements, extensionName, "statements");

    for (const [resource, actions] of Object.entries(statements)) {
        ensureActionList(actions, extensionName, `statements.${resource}`);
    }

    const roles = extension.roles ?? {};
    ensurePlainObject(roles, extensionName, "roles");

    for (const roleName of Object.keys(roles)) {
        if (!SUPPORTED_ROLE_NAMES.includes(roleName)) {
            throw createConfigError(
                extensionName,
                `unsupported role "${roleName}". Only ${SUPPORTED_ROLE_NAMES.join(", ")} are allowed.`
            );
        }
    }

    const normalizedRoles = {};
    for (const roleName of SUPPORTED_ROLE_NAMES) {
        const roleStatements = roles[roleName] ?? {};
        ensurePlainObject(roleStatements, extensionName, `roles.${roleName}`);

        for (const [resource, actions] of Object.entries(roleStatements)) {
            ensureActionList(actions, extensionName, `roles.${roleName}.${resource}`);
        }

        normalizedRoles[roleName] = roleStatements;
    }

    return {
        statements,
        roles: normalizedRoles,
    };
}

function validateProjectRoles(projectRoles, availableStatements, extensionName) {
    for (const roleName of SUPPORTED_ROLE_NAMES) {
        const roleStatements = projectRoles[roleName];

        for (const [resource, actions] of Object.entries(roleStatements)) {
            if (!Object.hasOwn(availableStatements, resource)) {
                throw createConfigError(
                    extensionName,
                    `roles.${roleName}.${resource} references an unknown resource. Declare it in "statements" first.`
                );
            }

            for (const action of actions) {
                if (!availableStatements[resource].includes(action)) {
                    throw createConfigError(
                        extensionName,
                        `roles.${roleName}.${resource} uses unknown action "${action}". Allowed actions are: ${availableStatements[resource].join(", ")}.`
                    );
                }
            }
        }
    }
}

export function buildOrganizationPermissions({
    baseStatements,
    baseRoles,
    projectExtension,
    extensionName = "@/project/add-on-organization-permissions",
}) {
    const normalizedExtension = normalizeExtension(projectExtension, extensionName);
    const statements = mergePermissionMap(baseStatements, normalizedExtension.statements);

    validateProjectRoles(normalizedExtension.roles, statements, extensionName);

    const roles = {};
    for (const roleName of SUPPORTED_ROLE_NAMES) {
        roles[roleName] = mergePermissionMap(
            baseRoles[roleName] ?? {},
            normalizedExtension.roles[roleName]
        );
    }

    return {
        statements,
        roles,
    };
}
