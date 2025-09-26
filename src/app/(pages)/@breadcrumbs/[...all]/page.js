import Breadcrumb from "@/components/breadcrumb";

const LABELS = {
    app: "Documents",
    dashboard: "Dashboard",
    org: "Organisation",
    orgs: "Organisations",
    new: "Créer une organisation",
    manage: "Gérer l’organisation",
    members: "Membres",
    "danger-zone": "Danger",
    user: "Utilisateur",
    invitations: "Invitations",
    users: "Utilisateurs",
    admin: "Administration",
};

export default async function BreadcrumbSlot({ params }) {
    const resolvedParams = await params;
    const segments = resolvedParams.all || [];

    let href = "";
    const items = segments.map(seg => {
        href += "/" + seg;
        return {
            name: LABELS[seg] ?? decodeURIComponent(seg),
            href: href,
        };
    });

    if (!items.length) return null;
    return <Breadcrumb items={[...items]} />;
}
