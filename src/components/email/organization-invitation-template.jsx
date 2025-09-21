import { SiteConfig } from "@/site-config";
import { Html } from "@react-email/components";

export function OrganizationInvitationTemplate({
    organizationName,
    inviterName,
    invitationUrl,
    expiresAt,
}) {
    return (
        <Html>
            <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
                <h1 style={{ fontSize: "20px", marginBottom: "16px" }}>
                    Invitation à rejoindre {organizationName}
                </h1>
                <p style={{ marginBottom: "12px" }}>Bonjour,</p>
                <p style={{ marginBottom: "12px" }}>
                    {inviterName} vous invite à rejoindre l&apos;organisation
                    <strong> {organizationName}</strong> sur {SiteConfig.title}.
                </p>
                <p style={{ marginBottom: "12px" }}>
                    Cliquez sur le bouton ci-dessous pour accepter
                    l&apos;invitation et accéder à l&apos;espace partagé.
                </p>
                <p style={{ marginBottom: "16px" }}>
                    <a
                        href={invitationUrl}
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
                        Rejoindre l&apos;organisation
                    </a>
                </p>
                <p style={{ marginBottom: "12px", color: "#374151" }}>
                    Ce lien expirera le {expiresAt}.
                </p>
                <p style={{ marginBottom: "12px", color: "#6B7280" }}>
                    Si le bouton ne fonctionne pas, copiez et collez le lien
                    suivant dans votre navigateur :
                </p>
                <p style={{ marginBottom: "12px" }}>
                    <a href={invitationUrl}>{invitationUrl}</a>
                </p>
                <p style={{ marginBottom: "0" }}>
                    À très vite,
                    <br />
                    {SiteConfig.mail.signature}
                </p>
            </div>
        </Html>
    );
}
