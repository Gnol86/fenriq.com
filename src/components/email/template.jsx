export function EmailTemplate({ name, message, url }) {
    return (
        <div>
            <h1>Bonjour {name},</h1>
            <p>
                {message}
                <br />
                <a href={url}>{url}</a>
            </p>
            <p>Cordialement,</p>
            <p>L'équipe PolGPT</p>
        </div>
    );
}
