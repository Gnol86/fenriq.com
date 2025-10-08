export const getServerUrl = () => {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    if (process.env.BETTER_AUTH_BASE_URL) {
        return process.env.BETTER_AUTH_BASE_URL;
    }

    return "http://localhost:3000";
};
