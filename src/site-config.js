export const SiteConfig = {
    title: "PolGPT",
    description: "Editeur booster par l'IA",
    prodUrl: "https://polgpt.be",
    appId: "polgpt",
    domain: "polgpt.be",
    appIcon: "/images/logo.png",
    company: {
        name: "PolGPT",
    },
    team: {
        website: "https://polgpt.be",
        name: "Arnaud Marchot",
        email: "info@polgpt.be",
    },
    mail: {
        from: "PolGPT <noreply@polgpt.be>",
        name: "PolGPT",
        email: "noreply@polgpt.be",
        replyTo: "info@polgpt.be",
        signature: "L'équipe de PolGPT",
    },
    brand: {
        primary: "#6366F1",
    },
    options: {
        organization: {
            allowUserToCreateOrganization: true,
            organizationLimit: 5,
            membershipLimit: 9999,
            invitationLimit: 9999,
            invitationExpiresIn: 60 * 60 * 24 * 30,
        },
    },
};
