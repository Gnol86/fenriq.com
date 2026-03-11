import { SiteConfig } from "@/site-config";

export function ChangeEmailConfirmationTemplate({ name, newEmail, confirmationUrl }) {
    return (
        <div>
            <h1>Confirmez votre changement d&apos;adresse email</h1>
            <p>Bonjour {name ?? "Utilisateur"},</p>
            <p>
                Une demande de changement d&apos;adresse email a été initiée pour votre compte{" "}
                {SiteConfig.title}.
            </p>
            <p>
                Si vous souhaitez remplacer votre adresse actuelle par <strong>{newEmail}</strong>,
                confirmez cette demande en cliquant sur le lien ci-dessous. Un email de vérification
                sera ensuite envoyé à cette nouvelle adresse.
            </p>
            <p>
                <a
                    href={confirmationUrl}
                    style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "12px 24px",
                        textDecoration: "none",
                        borderRadius: "6px",
                        display: "inline-block",
                    }}
                >
                    Confirmer le changement d&apos;email
                </a>
            </p>
            <p>
                Ou copiez ce lien dans votre navigateur :
                <br />
                <a href={confirmationUrl}>{confirmationUrl}</a>
            </p>
            <p>Ce lien expirera dans 24 heures.</p>
            <p>
                Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez cet email et
                votre adresse actuelle restera inchangée.
            </p>
            <p>Cordialement,</p>
            <p>{SiteConfig.mail.signature}</p>
        </div>
    );
}
