import { SiteConfig } from "@/site-config";

export function VerificationEmailTemplate({
    name,
    verificationUrl,
    title = "Vérifiez votre adresse email",
    description,
    buttonLabel = "Vérifier mon email",
    ignoreText = "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
}) {
    const resolvedDescription =
        description ??
        "Pour confirmer votre adresse email sur " +
            SiteConfig.title +
            ", veuillez cliquer sur le lien ci-dessous :";

    return (
        <div>
            <h1>{title}</h1>
            <p>Bonjour {name ?? "Utilisateur"},</p>
            <p>{resolvedDescription}</p>
            <p>
                <a
                    href={verificationUrl}
                    style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "12px 24px",
                        textDecoration: "none",
                        borderRadius: "6px",
                        display: "inline-block",
                    }}
                >
                    {buttonLabel}
                </a>
            </p>
            <p>
                Ou copiez ce lien dans votre navigateur :
                <br />
                <a href={verificationUrl}>{verificationUrl}</a>
            </p>
            <p>Ce lien expirera dans 24 heures.</p>
            <p>{ignoreText}</p>
            <p>Cordialement,</p>
            <p>{SiteConfig.mail.signature}</p>
        </div>
    );
}
