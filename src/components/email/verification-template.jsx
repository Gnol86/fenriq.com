export function VerificationEmailTemplate({ name, verificationUrl }) {
    return (
        <div>
            <h1>Vérifiez votre adresse email</h1>
            <p>Bonjour {name ?? "Utilisateur"},</p>
            <p>
                Pour terminer la création de votre compte PolGPT, veuillez
                vérifier votre adresse email en cliquant sur le lien ci-dessous
                :
            </p>
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
                    Vérifier mon email
                </a>
            </p>
            <p>
                Ou copiez ce lien dans votre navigateur :
                <br />
                <a href={verificationUrl}>{verificationUrl}</a>
            </p>
            <p>Ce lien expirera dans 24 heures.</p>
            <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
            <p>Cordialement,</p>
            <p>L'équipe PolGPT</p>
        </div>
    );
}
