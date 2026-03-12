import { Html } from "@react-email/components";
import { SiteConfig } from "@/site-config";

export function ChecklistDigestEmailTemplate({
    categoryName,
    digestLabel,
    deliveries,
    organizationName,
}) {
    return (
        <Html>
            <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
                <h1 style={{ fontSize: "20px", marginBottom: "16px" }}>
                    Digest checklist {digestLabel}
                </h1>
                <p style={{ marginBottom: "12px" }}>Bonjour,</p>
                <p style={{ marginBottom: "16px" }}>
                    Voici le récapitulatif des incidents de la catégorie
                    <strong> {categoryName}</strong> pour l&apos;organisation
                    <strong> {organizationName}</strong>.
                </p>
                {deliveries.map(delivery => (
                    <div
                        key={delivery.submission.id}
                        style={{
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            marginBottom: "16px",
                            padding: "12px 16px",
                        }}
                    >
                        <p style={{ marginBottom: "8px" }}>
                            <strong>{delivery.submission.checklistNameSnapshot}</strong>
                            <br />
                            {delivery.submission.vehicleNameSnapshot
                                ? `${delivery.submission.vehicleNameSnapshot} - `
                                : ""}
                            {delivery.submission.vehiclePlateNumberSnapshot}
                            <br />
                            Répondant: {delivery.submission.submitterName}
                            <br />
                            Soumise le: {delivery.submission.submittedAt}
                        </p>
                        <ul style={{ marginBottom: "12px", paddingLeft: "18px" }}>
                            {delivery.issues.map(issue => (
                                <li key={issue.id} style={{ marginBottom: "6px" }}>
                                    <strong>{issue.ruleTitle}</strong>
                                    {issue.description ? ` - ${issue.description}` : ""}
                                </li>
                            ))}
                        </ul>
                        <a href={delivery.submissionUrl}>{delivery.submissionUrl}</a>
                    </div>
                ))}
                <p style={{ marginBottom: "0" }}>
                    À bientôt,
                    <br />
                    {SiteConfig.mail.signature}
                </p>
            </div>
        </Html>
    );
}
