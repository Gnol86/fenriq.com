// Toutes les routes HTTP Better-Auth désactivées pour sécurité
export const disabledPaths = [
    // Organization routes
    "/organization/create",
    "/organization/check-slug",
    "/organization/list",
    // "/organization/set-active",
    "/organization/get-full-organization",
    "/organization/update",
    "/update-organization",
    "/organization/delete",

    // Invitation routes
    "/organization/invite-member",
    // "/organization/accept-invitation",
    "/organization/cancel-invitation",
    // "/organization/reject-invitation",
    "/organization/get-invitation",
    "/organization/list-invitations",

    // Member routes
    "/organization/list-members",
    "/organization/remove-member",
    "/organization/update-member-role",
    "/organization/get-active-member",
    "/organization/get-active-member-role",
    "/organization/add-member",
    "/organization/leave",

    // Dynamic Access Control routes
    "/organization/create-role",
    "/organization/delete-role",
    "/organization/list-roles",
    "/organization/get-role",
    "/organization/update-role",

    // Team routes
    "/organization/create-team",
    "/organization/list-teams",
    "/organization/update-team",
    "/organization/remove-team",
    "/organization/set-active-team",
    "/organization/list-user-teams",
    "/organization/list-team-members",
    "/organization/add-team-member",
    "/organization/remove-team-member",

    // Admin routes
    "/admin/create-user",
    "/admin/list-users",
    "/admin/set-role",
    "/admin/set-user-password",
    "/admin/ban-user",
    "/admin/unban-user",
    "/admin/list-user-sessions",
    "/admin/revoke-user-session",
    "/admin/revoke-user-sessions",
    "/admin/impersonate-user",
    "/admin/stop-impersonating",
    "/admin/remove-user",
    "/admin/has-permission",
    "/admin/user-has-permission",
];
