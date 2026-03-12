import CharroiSubmissionDetailPage from "@project/features/charroi/submission-detail-page";

export default async function Page({ params }) {
    const { submissionId } = await params;

    return <CharroiSubmissionDetailPage submissionId={submissionId} />;
}
