import MembersManagerClient from "./members-manager-client";

export default function MembersManager({ organization, currentUserId }) {
    if (!organization) {
        return (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Aucune organisation active n&apos;a été trouvée.</p>
                <p>Sélectionnez une organisation pour gérer ses membres.</p>
            </div>
        );
    }

    return (
        <MembersManagerClient
            organizationId={organization.id}
            organizationName={organization.name}
            members={organization.members ?? []}
            invitations={organization.invitations ?? []}
            currentUserId={currentUserId}
        />
    );
}
