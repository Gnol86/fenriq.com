// Legacy constants - use getRoleLabel(role, t) instead
export const defaultRoleLabels = {
    owner: "Propriétaire",
    admin: "Administrateur",
    member: "Membre",
    user: "Utilisateur",
};

export const organizationRoleLabels = {
    owner: "Propriétaire",
    admin: "Administrateur",
    member: "Membre",
};

export const invitationStatusLabels = {
    accepted: "Acceptée",
    pending: "En attente",
    canceled: "Annulée",
    rejected: "Refusée",
    outdated: "Périmée",
};

// Helper functions for i18n
export function getRoleLabel(role, t) {
    return t(`roles.${role}`);
}

export function getInvitationStatusLabel(status, t) {
    return t(`invitation_status.${status}`);
}
