"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function listUsersAction({
    searchValue = "",
    searchField = "name",
    searchOperator = "contains",
    limit = 10,
    offset = 0,
    sortBy = "createdAt",
    sortDirection = "desc",
    filterField = "",
    filterValue = "",
    filterOperator = "eq",
}) {
    const query = {
        searchValue,
        searchField,
        searchOperator,
        limit,
        offset,
        sortBy,
        sortDirection,
    };

    if (filterField && filterValue) {
        query.filterField = filterField;
        query.filterValue = filterValue;
        query.filterOperator = filterOperator;
    }

    return await auth.api.listUsers({
        query: { query },
        headers: await headers(),
    });
}

export async function createUserAction({
    email,
    password,
    name,
    role = "user",
}) {
    return await auth.api.createUser({
        body: {
            email,
            password,
            name,
            role,
        },
        headers: await headers(),
    });
}

export async function updateUserAction({ userId, data }) {
    return await auth.api.updateUser({
        body: {
            userId,
            data,
        },
        headers: await headers(),
    });
}

export async function setUserRoleAction({ userId, role }) {
    return await auth.api.setRole({
        body: {
            userId,
            role,
        },
        headers: await headers(),
    });
}

export async function setUserPasswordAction({ userId, newPassword }) {
    return await auth.api.setUserPassword({
        body: {
            userId,
            newPassword,
        },
        headers: await headers(),
    });
}

export async function banUserAction({ userId, banReason, banExpiresIn }) {
    const body = { userId };
    if (banReason) body.banReason = banReason;
    if (banExpiresIn) body.banExpiresIn = banExpiresIn;

    return await auth.api.banUser({
        body,
        headers: await headers(),
    });
}

export async function unbanUserAction({ userId }) {
    return await auth.api.unbanUser({
        body: { userId },
        headers: await headers(),
    });
}

export async function removeUserAction({ userId }) {
    return await auth.api.removeUser({
        body: { userId },
        headers: await headers(),
    });
}

export async function listUserSessionsAction({ userId }) {
    return await auth.api.listUserSessions({
        body: { userId },
        headers: await headers(),
    });
}

export async function revokeUserSessionAction({ userId, sessionId }) {
    return await auth.api.revokeUserSession({
        body: { userId, sessionId },
        headers: await headers(),
    });
}

export async function revokeUserSessionsAction({ userId }) {
    return await auth.api.revokeUserSessions({
        body: { userId },
        headers: await headers(),
    });
}

export async function impersonateUserAction({ userId }) {
    return await auth.api.impersonateUser({
        body: { userId },
        headers: await headers(),
    });
}
