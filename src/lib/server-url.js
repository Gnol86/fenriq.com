export const getServerUrl = () => {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    if (process.env.BETTER_AUTH_BASE_URL) {
        return process.env.BETTER_AUTH_BASE_URL;
    }

    return "http://localhost:3000";
};
