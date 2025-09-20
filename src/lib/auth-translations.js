// Traductions françaises pour Better-Auth
export const translations = {
    "fr-FR": {
        // ----------------------------
        // ORGANIZATION (plugin core)
        // ----------------------------
        ORGANIZATION_NOT_FOUND: "Organisation introuvable.",
        ORGANIZATION_ALREADY_EXISTS:
            "Une organisation avec ces paramètres existe déjà.",
        ORGANIZATION_NAME_REQUIRED:
            "Le nom de l'organisation est obligatoire.",
        ORGANIZATION_SLUG_REQUIRED:
            "Le slug de l'organisation est obligatoire.",
        ORGANIZATION_SLUG_INVALID:
            "Le slug de l'organisation est invalide.",
        ORGANIZATION_SLUG_TAKEN: "Ce slug est déjà utilisé.",
        ORGANIZATION_UPDATE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de modifier cette organisation.",
        ORGANIZATION_DELETE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de supprimer cette organisation.",
        CANNOT_DELETE_ORGANIZATION_OWNER:
            "Impossible de supprimer le propriétaire de l'organisation.",
        CANNOT_LEAVE_AS_SOLE_OWNER:
            "Vous êtes le seul propriétaire, vous ne pouvez pas quitter l'organisation.",
        ACTIVE_ORGANIZATION_REQUIRED:
            "Aucune organisation active n'a été trouvée.",
        USER_NOT_ALLOWED_TO_CREATE_ORGANIZATION:
            "Vous n'êtes pas autorisé à créer une organisation.",
        CHECK_SLUG_REQUIRED:
            "Le slug est requis pour la vérification.",

        // Invitations
        INVITATION_NOT_FOUND: "Invitation introuvable.",
        INVITATION_ALREADY_ACCEPTED:
            "Cette invitation a déjà été acceptée.",
        INVITATION_ALREADY_CANCELLED:
            "Cette invitation a déjà été annulée.",
        INVITATION_EXPIRED: "L'invitation a expiré.",
        INVITATION_EMAIL_REQUIRED:
            "L'email est obligatoire pour l'invitation.",
        INVITATION_CREATE_FORBIDDEN:
            "Vous n'avez pas l'autorisation d'inviter des membres.",
        INVITATION_CANCEL_FORBIDDEN:
            "Vous n'avez pas l'autorisation d'annuler cette invitation.",
        INVITATION_ACCEPT_FORBIDDEN:
            "Vous n'avez pas l'autorisation d'accepter cette invitation.",
        INVITATION_REJECT_FORBIDDEN:
            "Vous n'avez pas l'autorisation de rejeter cette invitation.",

        // Membres
        MEMBER_NOT_FOUND: "Membre introuvable.",
        MEMBER_ALREADY_EXISTS:
            "Cet utilisateur est déjà membre de l'organisation.",
        MEMBER_ADD_FORBIDDEN:
            "Vous n'avez pas l'autorisation d'ajouter des membres.",
        MEMBER_REMOVE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de retirer des membres.",
        MEMBER_UPDATE_ROLE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de modifier le rôle de ce membre.",
        MEMBER_CANNOT_UPDATE_OWNER:
            "Impossible de modifier le rôle d'un propriétaire.",
        MEMBER_CANNOT_REMOVE_OWNER:
            "Impossible de retirer un propriétaire de l'organisation.",
        NOT_ORGANIZATION_MEMBER:
            "Vous n'êtes pas membre de cette organisation.",
        NOT_ORGANIZATION_ADMIN:
            "Vous devez être administrateur de l'organisation.",
        NOT_ORGANIZATION_OWNER:
            "Action réservée au propriétaire de l'organisation.",

        // Rôles & permissions
        ROLE_NOT_FOUND: "Rôle introuvable.",
        ROLE_ALREADY_EXISTS: "Un rôle avec ce nom existe déjà.",
        ROLE_NAME_REQUIRED: "Le nom du rôle est obligatoire.",
        ROLE_PERMISSION_INVALID:
            "Le format des permissions du rôle est invalide.",
        ROLE_CREATE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de créer des rôles.",
        ROLE_UPDATE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de modifier ce rôle.",
        ROLE_DELETE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de supprimer ce rôle.",
        ROLE_DELETE_PROTECTED:
            "Ce rôle est protégé et ne peut pas être supprimé.",
        PERMISSION_DENIED: "Permission refusée pour cette action.",
        ACCESS_CONTROL_RESOURCE_UNKNOWN:
            "Ressource de contrôle d'accès inconnue.",
        ACCESS_CONTROL_ACTION_FORBIDDEN:
            "Action interdite par la politique de permissions.",

        // Équipes (teams) si activé
        TEAM_NOT_FOUND: "Équipe introuvable.",
        TEAM_ALREADY_EXISTS: "Une équipe avec ce nom existe déjà.",
        TEAM_NAME_REQUIRED: "Le nom de l'équipe est obligatoire.",
        TEAM_CREATE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de créer des équipes.",
        TEAM_UPDATE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de modifier cette équipe.",
        TEAM_DELETE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de supprimer cette équipe.",
        TEAM_MEMBER_NOT_FOUND: "Membre d'équipe introuvable.",
        TEAM_MEMBER_ALREADY_EXISTS:
            "Cet utilisateur est déjà membre de l'équipe.",
        TEAM_MEMBER_ADD_FORBIDDEN:
            "Vous n'avez pas l'autorisation d'ajouter des membres à l'équipe.",
        TEAM_MEMBER_REMOVE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de retirer des membres de l'équipe.",

        // Activité/orga active
        ACTIVE_MEMBER_ROLE_NOT_FOUND:
            "Rôle du membre actif introuvable.",
        ACTIVE_ORGANIZATION_SWITCH_FORBIDDEN:
            "Vous n'avez pas l'autorisation de changer d'organisation active.",

        // ----------------------------
        // ADMIN (plugin core)
        // ----------------------------
        ADMIN_FORBIDDEN: "Action réservée aux administrateurs.",
        ADMIN_USER_CREATE_FAILED:
            "Échec de la création de l'utilisateur.",
        ADMIN_USER_UPDATE_FAILED:
            "Échec de la mise à jour de l'utilisateur.",
        ADMIN_USER_DELETE_FAILED:
            "Échec de la suppression de l'utilisateur.",
        ADMIN_USER_NOT_FOUND: "Utilisateur introuvable.",
        ADMIN_EMAIL_ALREADY_IN_USE:
            "Cette adresse e-mail est déjà utilisée.",
        ADMIN_INVALID_ROLE: "Rôle administrateur invalide.",
        ADMIN_INVALID_STATUS: "Statut administrateur invalide.",
        ADMIN_PASSWORD_REQUIRED:
            "Un mot de passe est requis pour cette opération.",
        ADMIN_PASSWORD_TOO_WEAK:
            "Le mot de passe ne respecte pas la politique de sécurité.",

        // Sessions & ban
        SESSION_NOT_FOUND: "Session introuvable.",
        SESSION_REVOKE_FORBIDDEN:
            "Vous n'avez pas l'autorisation de révoquer cette session.",
        BAN_ALREADY_ACTIVE: "L'utilisateur est déjà banni.",
        BAN_NOT_ACTIVE: "Cet utilisateur n'est pas banni.",
        BAN_APPLY_FAILED: "Impossible d'appliquer le bannissement.",
        BAN_REVOKE_FAILED: "Impossible de lever le bannissement.",

        // Impersonation
        IMPERSONATION_FORBIDDEN:
            "Vous n'avez pas l'autorisation d'usurper un utilisateur.",
        IMPERSONATION_FAILED:
            "Impossible d'usurper cet utilisateur.",
        CANNOT_IMPERSONATE_SELF:
            "Vous ne pouvez pas vous usurper vous-même.",
        CANNOT_IMPERSONATE_OWNER:
            "Impossible d'usurper le propriétaire d'une organisation.",

        // Divers admin
        ADMIN_OPERATION_INVALID_PAYLOAD:
            "Payload invalide pour l'opération d'administration.",
        ADMIN_OPERATION_RATE_LIMITED:
            "Trop de tentatives. Veuillez réessayer plus tard.",

        // ----------------------------
        // CLÉS UI connues (Organization) [UI]
        // ----------------------------
        SLUG_DOES_NOT_MATCH: "Le slug ne correspond pas.", // [UI]
        SLUG_REQUIRED: "Le slug de l'organisation est requis.", // [UI]
        DELETE_ORGANIZATION_INSTRUCTIONS:
            "Saisissez le slug de l'organisation pour confirmer :", // [UI]
        DELETE_ORGANIZATION_SUCCESS:
            "Organisation supprimée avec succès.", // [UI]
    },
};