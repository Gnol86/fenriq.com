import { SiteConfig } from "@/site-config";

export function ResetPasswordTemplate({ name, resetPasswordUrl }) {
    return (
        <div>
            <h1>Réinitialisez votre mot de passe</h1>
            <p>Bonjour {name ?? "Utilisateur"},</p>
            <p>
                Une demande de réinitialisation du mot de passe de votre compte {SiteConfig.title} a
                été effectuée.
            </p>
            <p>
                <a
                    href={resetPasswordUrl}
                    style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "12px 24px",
                        textDecoration: "none",
                        borderRadius: "6px",
                        display: "inline-block",
                    }}
                >
                    Réinitialiser mon mot de passe
                </a>
            </p>
            <p>
                Ou copiez ce lien dans votre navigateur :
                <br />
                <a href={resetPasswordUrl}>{resetPasswordUrl}</a>
            </p>
            <p>Ce lien expirera dans 1 heure.</p>
            <p>Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez cet email.</p>
            <p>Cordialement,</p>
            <p>{SiteConfig.mail.signature}</p>
        </div>
    );
}
