import PublicChecklistPage from "@project/features/charroi/public-checklist-page";

export default async function Page({ params }) {
    const { token } = await params;

    return <PublicChecklistPage token={token} />;
}
