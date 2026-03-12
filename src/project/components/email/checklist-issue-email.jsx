import { Html } from "@react-email/components";
import { SiteConfig } from "@/site-config";

export function ChecklistIssueEmailTemplate({
    categoryName,
    checklistName,
    organizationName,
    submissionUrl,
    submitterName,
    submittedAt,
    vehicleLabel,
    issues,
}) {
    return (
        <Html>
            <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
                <h1 style={{ fontSize: "20px", marginBottom: "16px" }}>
                    Incident signalé sur une checklist
                </h1>
                <p style={{ marginBottom: "12px" }}>Bonjour,</p>
                <p style={{ marginBottom: "12px" }}>
                    Une checklist publique a remonté des problèmes dans la catégorie
                    <strong> {categoryName}</strong> pour l&apos;organisation
                    <strong> {organizationName}</strong>.
                </p>
                <p style={{ marginBottom: "12px" }}>
                    <strong>Checklist:</strong> {checklistName}
                    <br />
                    <strong>Véhicule:</strong> {vehicleLabel}
                    <br />
                    <strong>Répondant:</strong> {submitterName}
                    <br />
                    <strong>Soumise le:</strong> {submittedAt}
                </p>
                <ul style={{ marginBottom: "16px", paddingLeft: "18px" }}>
                    {issues.map(issue => (
                        <li key={issue.ruleId} style={{ marginBottom: "8px" }}>
                            <strong>{issue.ruleTitle}</strong>
                            {issue.description ? ` - ${issue.description}` : ""}
                        </li>
                    ))}
                </ul>
                <p style={{ marginBottom: "16px" }}>
                    <a
                        href={submissionUrl}
                        style={{
                            backgroundColor: "#111827",
                            borderRadius: "6px",
                            color: "#ffffff",
                            display: "inline-block",
                            fontSize: "14px",
                            padding: "12px 20px",
                            textDecoration: "none",
                        }}
                    >
                        Voir la soumission
                    </a>
                </p>
                <p style={{ marginBottom: "12px", color: "#6B7280" }}>
                    Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
                </p>
                <p style={{ marginBottom: "12px" }}>
                    <a href={submissionUrl}>{submissionUrl}</a>
                </p>
                <p style={{ marginBottom: "0" }}>
                    À bientôt,
                    <br />
                    {SiteConfig.mail.signature}
                </p>
            </div>
        </Html>
    );
}
