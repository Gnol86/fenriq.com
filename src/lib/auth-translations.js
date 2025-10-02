// Traductions pour Better-Auth (Organization & Admin plugins)
export const translations = {
    "en-US": {
        // ----------------------------
        // ORGANIZATION (plugin core)
        // ----------------------------
        ORGANIZATION_NOT_FOUND: "Organization not found.",
        ORGANIZATION_ALREADY_EXISTS:
            "An organization with these parameters already exists.",
        ORGANIZATION_NAME_REQUIRED: "Organization name is required.",
        ORGANIZATION_SLUG_REQUIRED: "Organization slug is required.",
        ORGANIZATION_SLUG_INVALID: "Organization slug is invalid.",
        ORGANIZATION_SLUG_TAKEN: "This slug is already taken.",
        ORGANIZATION_UPDATE_FORBIDDEN:
            "You do not have permission to update this organization.",
        ORGANIZATION_DELETE_FORBIDDEN:
            "You do not have permission to delete this organization.",
        CANNOT_DELETE_ORGANIZATION_OWNER:
            "Cannot delete the organization owner.",
        CANNOT_LEAVE_AS_SOLE_OWNER:
            "You are the sole owner, you cannot leave the organization.",
        ACTIVE_ORGANIZATION_REQUIRED: "No active organization found.",
        USER_NOT_ALLOWED_TO_CREATE_ORGANIZATION:
            "You are not allowed to create an organization.",
        CHECK_SLUG_REQUIRED: "Slug is required for verification.",

        // Invitations
        INVITATION_NOT_FOUND: "Invitation not found.",
        INVITATION_ALREADY_ACCEPTED: "This invitation has already been accepted.",
        INVITATION_ALREADY_CANCELLED: "This invitation has already been cancelled.",
        INVITATION_EXPIRED: "The invitation has expired.",
        INVITATION_EMAIL_REQUIRED: "Email is required for invitation.",
        INVITATION_CREATE_FORBIDDEN:
            "You do not have permission to invite members.",
        INVITATION_CANCEL_FORBIDDEN:
            "You do not have permission to cancel this invitation.",
        INVITATION_ACCEPT_FORBIDDEN:
            "You do not have permission to accept this invitation.",
        INVITATION_REJECT_FORBIDDEN:
            "You do not have permission to reject this invitation.",

        // Members
        MEMBER_NOT_FOUND: "Member not found.",
        MEMBER_ALREADY_EXISTS:
            "This user is already a member of the organization.",
        MEMBER_ADD_FORBIDDEN:
            "You do not have permission to add members.",
        MEMBER_REMOVE_FORBIDDEN:
            "You do not have permission to remove members.",
        MEMBER_UPDATE_ROLE_FORBIDDEN:
            "You do not have permission to update this member's role.",
        MEMBER_CANNOT_UPDATE_OWNER: "Cannot update the role of an owner.",
        MEMBER_CANNOT_REMOVE_OWNER:
            "Cannot remove an owner from the organization.",
        NOT_ORGANIZATION_MEMBER:
            "You are not a member of this organization.",
        NOT_ORGANIZATION_ADMIN:
            "You must be an organization administrator.",
        NOT_ORGANIZATION_OWNER: "Action reserved for organization owner.",

        // Roles & permissions
        ROLE_NOT_FOUND: "Role not found.",
        ROLE_ALREADY_EXISTS: "A role with this name already exists.",
        ROLE_NAME_REQUIRED: "Role name is required.",
        ROLE_PERMISSION_INVALID: "Role permission format is invalid.",
        ROLE_CREATE_FORBIDDEN:
            "You do not have permission to create roles.",
        ROLE_UPDATE_FORBIDDEN:
            "You do not have permission to update this role.",
        ROLE_DELETE_FORBIDDEN:
            "You do not have permission to delete this role.",
        ROLE_DELETE_PROTECTED:
            "This role is protected and cannot be deleted.",
        PERMISSION_DENIED: "Permission denied for this action.",
        ACCESS_CONTROL_RESOURCE_UNKNOWN:
            "Unknown access control resource.",
        ACCESS_CONTROL_ACTION_FORBIDDEN:
            "Action forbidden by permission policy.",

        // Teams
        TEAM_NOT_FOUND: "Team not found.",
        TEAM_ALREADY_EXISTS: "A team with this name already exists.",
        TEAM_NAME_REQUIRED: "Team name is required.",
        TEAM_CREATE_FORBIDDEN:
            "You do not have permission to create teams.",
        TEAM_UPDATE_FORBIDDEN:
            "You do not have permission to update this team.",
        TEAM_DELETE_FORBIDDEN:
            "You do not have permission to delete this team.",
        TEAM_MEMBER_NOT_FOUND: "Team member not found.",
        TEAM_MEMBER_ALREADY_EXISTS:
            "This user is already a team member.",
        TEAM_MEMBER_ADD_FORBIDDEN:
            "You do not have permission to add team members.",
        TEAM_MEMBER_REMOVE_FORBIDDEN:
            "You do not have permission to remove team members.",

        // Active organization
        ACTIVE_MEMBER_ROLE_NOT_FOUND: "Active member role not found.",
        ACTIVE_ORGANIZATION_SWITCH_FORBIDDEN:
            "You do not have permission to switch active organization.",

        // ----------------------------
        // ADMIN (plugin core)
        // ----------------------------
        ADMIN_FORBIDDEN: "Action reserved for administrators.",
        ADMIN_USER_CREATE_FAILED: "Failed to create user.",
        ADMIN_USER_UPDATE_FAILED: "Failed to update user.",
        ADMIN_USER_DELETE_FAILED: "Failed to delete user.",
        ADMIN_USER_NOT_FOUND: "User not found.",
        ADMIN_EMAIL_ALREADY_IN_USE: "This email address is already in use.",
        ADMIN_INVALID_ROLE: "Invalid admin role.",
        ADMIN_INVALID_STATUS: "Invalid admin status.",
        ADMIN_PASSWORD_REQUIRED:
            "A password is required for this operation.",
        ADMIN_PASSWORD_TOO_WEAK:
            "Password does not meet security policy.",

        // Sessions & ban
        SESSION_NOT_FOUND: "Session not found.",
        SESSION_REVOKE_FORBIDDEN:
            "You do not have permission to revoke this session.",
        BAN_ALREADY_ACTIVE: "User is already banned.",
        BAN_NOT_ACTIVE: "This user is not banned.",
        BAN_APPLY_FAILED: "Unable to apply ban.",
        BAN_REVOKE_FAILED: "Unable to revoke ban.",

        // Impersonation
        IMPERSONATION_FORBIDDEN:
            "You do not have permission to impersonate a user.",
        IMPERSONATION_FAILED: "Unable to impersonate this user.",
        CANNOT_IMPERSONATE_SELF: "You cannot impersonate yourself.",
        CANNOT_IMPERSONATE_OWNER:
            "Cannot impersonate an organization owner.",

        // Admin misc
        ADMIN_OPERATION_INVALID_PAYLOAD:
            "Invalid payload for admin operation.",
        ADMIN_OPERATION_RATE_LIMITED:
            "Too many attempts. Please try again later.",

        // ----------------------------
        // UI keys (Organization) [UI]
        // ----------------------------
        SLUG_DOES_NOT_MATCH: "Slug does not match.",
        SLUG_REQUIRED: "Organization slug is required.",
        DELETE_ORGANIZATION_INSTRUCTIONS:
            "Enter the organization slug to confirm:",
        DELETE_ORGANIZATION_SUCCESS: "Organization deleted successfully.",
    },
    "nl-NL": {
        // ----------------------------
        // ORGANIZATION (plugin core)
        // ----------------------------
        ORGANIZATION_NOT_FOUND: "Organisatie niet gevonden.",
        ORGANIZATION_ALREADY_EXISTS:
            "Een organisatie met deze parameters bestaat al.",
        ORGANIZATION_NAME_REQUIRED: "Organisatienaam is verplicht.",
        ORGANIZATION_SLUG_REQUIRED: "Organisatie-slug is verplicht.",
        ORGANIZATION_SLUG_INVALID: "Organisatie-slug is ongeldig.",
        ORGANIZATION_SLUG_TAKEN: "Deze slug is al in gebruik.",
        ORGANIZATION_UPDATE_FORBIDDEN:
            "U heeft geen toestemming om deze organisatie te wijzigen.",
        ORGANIZATION_DELETE_FORBIDDEN:
            "U heeft geen toestemming om deze organisatie te verwijderen.",
        CANNOT_DELETE_ORGANIZATION_OWNER:
            "Kan de eigenaar van de organisatie niet verwijderen.",
        CANNOT_LEAVE_AS_SOLE_OWNER:
            "U bent de enige eigenaar, u kunt de organisatie niet verlaten.",
        ACTIVE_ORGANIZATION_REQUIRED: "Geen actieve organisatie gevonden.",
        USER_NOT_ALLOWED_TO_CREATE_ORGANIZATION:
            "U bent niet gemachtigd om een organisatie aan te maken.",
        CHECK_SLUG_REQUIRED: "Slug is vereist voor verificatie.",

        // Invitations
        INVITATION_NOT_FOUND: "Uitnodiging niet gevonden.",
        INVITATION_ALREADY_ACCEPTED: "Deze uitnodiging is al geaccepteerd.",
        INVITATION_ALREADY_CANCELLED: "Deze uitnodiging is al geannuleerd.",
        INVITATION_EXPIRED: "De uitnodiging is verlopen.",
        INVITATION_EMAIL_REQUIRED: "E-mail is verplicht voor uitnodiging.",
        INVITATION_CREATE_FORBIDDEN:
            "U heeft geen toestemming om leden uit te nodigen.",
        INVITATION_CANCEL_FORBIDDEN:
            "U heeft geen toestemming om deze uitnodiging te annuleren.",
        INVITATION_ACCEPT_FORBIDDEN:
            "U heeft geen toestemming om deze uitnodiging te accepteren.",
        INVITATION_REJECT_FORBIDDEN:
            "U heeft geen toestemming om deze uitnodiging af te wijzen.",

        // Members
        MEMBER_NOT_FOUND: "Lid niet gevonden.",
        MEMBER_ALREADY_EXISTS:
            "Deze gebruiker is al lid van de organisatie.",
        MEMBER_ADD_FORBIDDEN:
            "U heeft geen toestemming om leden toe te voegen.",
        MEMBER_REMOVE_FORBIDDEN:
            "U heeft geen toestemming om leden te verwijderen.",
        MEMBER_UPDATE_ROLE_FORBIDDEN:
            "U heeft geen toestemming om de rol van dit lid te wijzigen.",
        MEMBER_CANNOT_UPDATE_OWNER:
            "Kan de rol van een eigenaar niet wijzigen.",
        MEMBER_CANNOT_REMOVE_OWNER:
            "Kan een eigenaar niet uit de organisatie verwijderen.",
        NOT_ORGANIZATION_MEMBER:
            "U bent geen lid van deze organisatie.",
        NOT_ORGANIZATION_ADMIN:
            "U moet beheerder van de organisatie zijn.",
        NOT_ORGANIZATION_OWNER:
            "Actie gereserveerd voor organisatie-eigenaar.",

        // Roles & permissions
        ROLE_NOT_FOUND: "Rol niet gevonden.",
        ROLE_ALREADY_EXISTS: "Een rol met deze naam bestaat al.",
        ROLE_NAME_REQUIRED: "Rolnaam is verplicht.",
        ROLE_PERMISSION_INVALID: "Rolrechten formaat is ongeldig.",
        ROLE_CREATE_FORBIDDEN:
            "U heeft geen toestemming om rollen aan te maken.",
        ROLE_UPDATE_FORBIDDEN:
            "U heeft geen toestemming om deze rol te wijzigen.",
        ROLE_DELETE_FORBIDDEN:
            "U heeft geen toestemming om deze rol te verwijderen.",
        ROLE_DELETE_PROTECTED:
            "Deze rol is beschermd en kan niet worden verwijderd.",
        PERMISSION_DENIED: "Toestemming geweigerd voor deze actie.",
        ACCESS_CONTROL_RESOURCE_UNKNOWN:
            "Onbekende toegangscontrolebron.",
        ACCESS_CONTROL_ACTION_FORBIDDEN:
            "Actie verboden door rechtenbeleid.",

        // Teams
        TEAM_NOT_FOUND: "Team niet gevonden.",
        TEAM_ALREADY_EXISTS: "Een team met deze naam bestaat al.",
        TEAM_NAME_REQUIRED: "Teamnaam is verplicht.",
        TEAM_CREATE_FORBIDDEN:
            "U heeft geen toestemming om teams aan te maken.",
        TEAM_UPDATE_FORBIDDEN:
            "U heeft geen toestemming om dit team te wijzigen.",
        TEAM_DELETE_FORBIDDEN:
            "U heeft geen toestemming om dit team te verwijderen.",
        TEAM_MEMBER_NOT_FOUND: "Teamlid niet gevonden.",
        TEAM_MEMBER_ALREADY_EXISTS:
            "Deze gebruiker is al lid van het team.",
        TEAM_MEMBER_ADD_FORBIDDEN:
            "U heeft geen toestemming om teamleden toe te voegen.",
        TEAM_MEMBER_REMOVE_FORBIDDEN:
            "U heeft geen toestemming om teamleden te verwijderen.",

        // Active organization
        ACTIVE_MEMBER_ROLE_NOT_FOUND: "Actieve lidrol niet gevonden.",
        ACTIVE_ORGANIZATION_SWITCH_FORBIDDEN:
            "U heeft geen toestemming om van actieve organisatie te wisselen.",

        // ----------------------------
        // ADMIN (plugin core)
        // ----------------------------
        ADMIN_FORBIDDEN: "Actie gereserveerd voor beheerders.",
        ADMIN_USER_CREATE_FAILED: "Aanmaken gebruiker mislukt.",
        ADMIN_USER_UPDATE_FAILED: "Bijwerken gebruiker mislukt.",
        ADMIN_USER_DELETE_FAILED: "Verwijderen gebruiker mislukt.",
        ADMIN_USER_NOT_FOUND: "Gebruiker niet gevonden.",
        ADMIN_EMAIL_ALREADY_IN_USE: "Dit e-mailadres is al in gebruik.",
        ADMIN_INVALID_ROLE: "Ongeldige beheerdersrol.",
        ADMIN_INVALID_STATUS: "Ongeldige beheerdersstatus.",
        ADMIN_PASSWORD_REQUIRED:
            "Een wachtwoord is vereist voor deze bewerking.",
        ADMIN_PASSWORD_TOO_WEAK:
            "Wachtwoord voldoet niet aan beveiligingsbeleid.",

        // Sessions & ban
        SESSION_NOT_FOUND: "Sessie niet gevonden.",
        SESSION_REVOKE_FORBIDDEN:
            "U heeft geen toestemming om deze sessie in te trekken.",
        BAN_ALREADY_ACTIVE: "Gebruiker is al verbannen.",
        BAN_NOT_ACTIVE: "Deze gebruiker is niet verbannen.",
        BAN_APPLY_FAILED: "Kan ban niet toepassen.",
        BAN_REVOKE_FAILED: "Kan ban niet intrekken.",

        // Impersonation
        IMPERSONATION_FORBIDDEN:
            "U heeft geen toestemming om een gebruiker te imiteren.",
        IMPERSONATION_FAILED: "Kan deze gebruiker niet imiteren.",
        CANNOT_IMPERSONATE_SELF: "U kunt uzelf niet imiteren.",
        CANNOT_IMPERSONATE_OWNER:
            "Kan een organisatie-eigenaar niet imiteren.",

        // Admin misc
        ADMIN_OPERATION_INVALID_PAYLOAD:
            "Ongeldige payload voor beheerbewerking.",
        ADMIN_OPERATION_RATE_LIMITED:
            "Te veel pogingen. Probeer het later opnieuw.",

        // ----------------------------
        // UI keys (Organization) [UI]
        // ----------------------------
        SLUG_DOES_NOT_MATCH: "Slug komt niet overeen.",
        SLUG_REQUIRED: "Organisatie-slug is verplicht.",
        DELETE_ORGANIZATION_INSTRUCTIONS:
            "Voer de organisatie-slug in om te bevestigen:",
        DELETE_ORGANIZATION_SUCCESS: "Organisatie succesvol verwijderd.",
    },
    "de-DE": {
        // ----------------------------
        // ORGANIZATION (plugin core)
        // ----------------------------
        ORGANIZATION_NOT_FOUND: "Organisation nicht gefunden.",
        ORGANIZATION_ALREADY_EXISTS:
            "Eine Organisation mit diesen Parametern existiert bereits.",
        ORGANIZATION_NAME_REQUIRED: "Organisationsname ist erforderlich.",
        ORGANIZATION_SLUG_REQUIRED: "Organisations-Slug ist erforderlich.",
        ORGANIZATION_SLUG_INVALID: "Organisations-Slug ist ungültig.",
        ORGANIZATION_SLUG_TAKEN: "Dieser Slug ist bereits vergeben.",
        ORGANIZATION_UPDATE_FORBIDDEN:
            "Sie haben keine Berechtigung, diese Organisation zu ändern.",
        ORGANIZATION_DELETE_FORBIDDEN:
            "Sie haben keine Berechtigung, diese Organisation zu löschen.",
        CANNOT_DELETE_ORGANIZATION_OWNER:
            "Der Organisationsinhaber kann nicht gelöscht werden.",
        CANNOT_LEAVE_AS_SOLE_OWNER:
            "Sie sind der einzige Inhaber, Sie können die Organisation nicht verlassen.",
        ACTIVE_ORGANIZATION_REQUIRED: "Keine aktive Organisation gefunden.",
        USER_NOT_ALLOWED_TO_CREATE_ORGANIZATION:
            "Sie sind nicht berechtigt, eine Organisation zu erstellen.",
        CHECK_SLUG_REQUIRED: "Slug ist für die Überprüfung erforderlich.",

        // Invitations
        INVITATION_NOT_FOUND: "Einladung nicht gefunden.",
        INVITATION_ALREADY_ACCEPTED: "Diese Einladung wurde bereits angenommen.",
        INVITATION_ALREADY_CANCELLED: "Diese Einladung wurde bereits storniert.",
        INVITATION_EXPIRED: "Die Einladung ist abgelaufen.",
        INVITATION_EMAIL_REQUIRED: "E-Mail ist für die Einladung erforderlich.",
        INVITATION_CREATE_FORBIDDEN:
            "Sie haben keine Berechtigung, Mitglieder einzuladen.",
        INVITATION_CANCEL_FORBIDDEN:
            "Sie haben keine Berechtigung, diese Einladung zu stornieren.",
        INVITATION_ACCEPT_FORBIDDEN:
            "Sie haben keine Berechtigung, diese Einladung anzunehmen.",
        INVITATION_REJECT_FORBIDDEN:
            "Sie haben keine Berechtigung, diese Einladung abzulehnen.",

        // Members
        MEMBER_NOT_FOUND: "Mitglied nicht gefunden.",
        MEMBER_ALREADY_EXISTS:
            "Dieser Benutzer ist bereits Mitglied der Organisation.",
        MEMBER_ADD_FORBIDDEN:
            "Sie haben keine Berechtigung, Mitglieder hinzuzufügen.",
        MEMBER_REMOVE_FORBIDDEN:
            "Sie haben keine Berechtigung, Mitglieder zu entfernen.",
        MEMBER_UPDATE_ROLE_FORBIDDEN:
            "Sie haben keine Berechtigung, die Rolle dieses Mitglieds zu ändern.",
        MEMBER_CANNOT_UPDATE_OWNER:
            "Die Rolle eines Inhabers kann nicht geändert werden.",
        MEMBER_CANNOT_REMOVE_OWNER:
            "Ein Inhaber kann nicht aus der Organisation entfernt werden.",
        NOT_ORGANIZATION_MEMBER:
            "Sie sind kein Mitglied dieser Organisation.",
        NOT_ORGANIZATION_ADMIN:
            "Sie müssen Organisationsadministrator sein.",
        NOT_ORGANIZATION_OWNER:
            "Aktion für Organisationsinhaber reserviert.",

        // Roles & permissions
        ROLE_NOT_FOUND: "Rolle nicht gefunden.",
        ROLE_ALREADY_EXISTS: "Eine Rolle mit diesem Namen existiert bereits.",
        ROLE_NAME_REQUIRED: "Rollenname ist erforderlich.",
        ROLE_PERMISSION_INVALID: "Rollenberechtigungsformat ist ungültig.",
        ROLE_CREATE_FORBIDDEN:
            "Sie haben keine Berechtigung, Rollen zu erstellen.",
        ROLE_UPDATE_FORBIDDEN:
            "Sie haben keine Berechtigung, diese Rolle zu ändern.",
        ROLE_DELETE_FORBIDDEN:
            "Sie haben keine Berechtigung, diese Rolle zu löschen.",
        ROLE_DELETE_PROTECTED:
            "Diese Rolle ist geschützt und kann nicht gelöscht werden.",
        PERMISSION_DENIED: "Berechtigung für diese Aktion verweigert.",
        ACCESS_CONTROL_RESOURCE_UNKNOWN:
            "Unbekannte Zugriffskontrollressource.",
        ACCESS_CONTROL_ACTION_FORBIDDEN:
            "Aktion durch Berechtigungsrichtlinie verboten.",

        // Teams
        TEAM_NOT_FOUND: "Team nicht gefunden.",
        TEAM_ALREADY_EXISTS: "Ein Team mit diesem Namen existiert bereits.",
        TEAM_NAME_REQUIRED: "Teamname ist erforderlich.",
        TEAM_CREATE_FORBIDDEN:
            "Sie haben keine Berechtigung, Teams zu erstellen.",
        TEAM_UPDATE_FORBIDDEN:
            "Sie haben keine Berechtigung, dieses Team zu ändern.",
        TEAM_DELETE_FORBIDDEN:
            "Sie haben keine Berechtigung, dieses Team zu löschen.",
        TEAM_MEMBER_NOT_FOUND: "Teammitglied nicht gefunden.",
        TEAM_MEMBER_ALREADY_EXISTS:
            "Dieser Benutzer ist bereits Teammitglied.",
        TEAM_MEMBER_ADD_FORBIDDEN:
            "Sie haben keine Berechtigung, Teammitglieder hinzuzufügen.",
        TEAM_MEMBER_REMOVE_FORBIDDEN:
            "Sie haben keine Berechtigung, Teammitglieder zu entfernen.",

        // Active organization
        ACTIVE_MEMBER_ROLE_NOT_FOUND: "Aktive Mitgliedsrolle nicht gefunden.",
        ACTIVE_ORGANIZATION_SWITCH_FORBIDDEN:
            "Sie haben keine Berechtigung, die aktive Organisation zu wechseln.",

        // ----------------------------
        // ADMIN (plugin core)
        // ----------------------------
        ADMIN_FORBIDDEN: "Aktion für Administratoren reserviert.",
        ADMIN_USER_CREATE_FAILED: "Benutzer konnte nicht erstellt werden.",
        ADMIN_USER_UPDATE_FAILED: "Benutzer konnte nicht aktualisiert werden.",
        ADMIN_USER_DELETE_FAILED: "Benutzer konnte nicht gelöscht werden.",
        ADMIN_USER_NOT_FOUND: "Benutzer nicht gefunden.",
        ADMIN_EMAIL_ALREADY_IN_USE: "Diese E-Mail-Adresse wird bereits verwendet.",
        ADMIN_INVALID_ROLE: "Ungültige Administratorrolle.",
        ADMIN_INVALID_STATUS: "Ungültiger Administratorstatus.",
        ADMIN_PASSWORD_REQUIRED:
            "Ein Passwort ist für diese Operation erforderlich.",
        ADMIN_PASSWORD_TOO_WEAK:
            "Passwort erfüllt nicht die Sicherheitsrichtlinien.",

        // Sessions & ban
        SESSION_NOT_FOUND: "Sitzung nicht gefunden.",
        SESSION_REVOKE_FORBIDDEN:
            "Sie haben keine Berechtigung, diese Sitzung zu widerrufen.",
        BAN_ALREADY_ACTIVE: "Benutzer ist bereits gesperrt.",
        BAN_NOT_ACTIVE: "Dieser Benutzer ist nicht gesperrt.",
        BAN_APPLY_FAILED: "Sperrung konnte nicht angewendet werden.",
        BAN_REVOKE_FAILED: "Sperrung konnte nicht aufgehoben werden.",

        // Impersonation
        IMPERSONATION_FORBIDDEN:
            "Sie haben keine Berechtigung, einen Benutzer zu imitieren.",
        IMPERSONATION_FAILED: "Dieser Benutzer kann nicht imitiert werden.",
        CANNOT_IMPERSONATE_SELF: "Sie können sich nicht selbst imitieren.",
        CANNOT_IMPERSONATE_OWNER:
            "Organisationsinhaber können nicht imitiert werden.",

        // Admin misc
        ADMIN_OPERATION_INVALID_PAYLOAD:
            "Ungültige Nutzlast für Admin-Operation.",
        ADMIN_OPERATION_RATE_LIMITED:
            "Zu viele Versuche. Bitte versuchen Sie es später erneut.",

        // ----------------------------
        // UI keys (Organization) [UI]
        // ----------------------------
        SLUG_DOES_NOT_MATCH: "Slug stimmt nicht überein.",
        SLUG_REQUIRED: "Organisations-Slug ist erforderlich.",
        DELETE_ORGANIZATION_INSTRUCTIONS:
            "Geben Sie den Organisations-Slug zur Bestätigung ein:",
        DELETE_ORGANIZATION_SUCCESS: "Organisation erfolgreich gelöscht.",
    },
    "fr-FR": {
        // ----------------------------
        // ORGANIZATION (plugin core)
        // ----------------------------
        ORGANIZATION_NOT_FOUND: "Organisation introuvable.",
        ORGANIZATION_ALREADY_EXISTS:
            "Une organisation avec ces paramètres existe déjà.",
        ORGANIZATION_NAME_REQUIRED: "Le nom de l'organisation est obligatoire.",
        ORGANIZATION_SLUG_REQUIRED:
            "Le slug de l'organisation est obligatoire.",
        ORGANIZATION_SLUG_INVALID: "Le slug de l'organisation est invalide.",
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
        CHECK_SLUG_REQUIRED: "Le slug est requis pour la vérification.",

        // Invitations
        INVITATION_NOT_FOUND: "Invitation introuvable.",
        INVITATION_ALREADY_ACCEPTED: "Cette invitation a déjà été acceptée.",
        INVITATION_ALREADY_CANCELLED: "Cette invitation a déjà été annulée.",
        INVITATION_EXPIRED: "L'invitation a expiré.",
        INVITATION_EMAIL_REQUIRED: "L'email est obligatoire pour l'invitation.",
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
        ACTIVE_MEMBER_ROLE_NOT_FOUND: "Rôle du membre actif introuvable.",
        ACTIVE_ORGANIZATION_SWITCH_FORBIDDEN:
            "Vous n'avez pas l'autorisation de changer d'organisation active.",

        // ----------------------------
        // ADMIN (plugin core)
        // ----------------------------
        ADMIN_FORBIDDEN: "Action réservée aux administrateurs.",
        ADMIN_USER_CREATE_FAILED: "Échec de la création de l'utilisateur.",
        ADMIN_USER_UPDATE_FAILED: "Échec de la mise à jour de l'utilisateur.",
        ADMIN_USER_DELETE_FAILED: "Échec de la suppression de l'utilisateur.",
        ADMIN_USER_NOT_FOUND: "Utilisateur introuvable.",
        ADMIN_EMAIL_ALREADY_IN_USE: "Cette adresse e-mail est déjà utilisée.",
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
        IMPERSONATION_FAILED: "Impossible d'usurper cet utilisateur.",
        CANNOT_IMPERSONATE_SELF: "Vous ne pouvez pas vous usurper vous-même.",
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
        DELETE_ORGANIZATION_SUCCESS: "Organisation supprimée avec succès.", // [UI]
    },
};
