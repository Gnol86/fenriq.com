import { ChecklistBuilderEditPage } from "@project/features/charroi/checklist-builder-page";

export default async function Page({ params }) {
    const { templateId } = await params;

    return <ChecklistBuilderEditPage templateId={templateId} />;
}
