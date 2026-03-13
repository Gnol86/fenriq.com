import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
    cacheComponents: false, // Désactivé car incompatible avec headers() dans requireAuth
    experimental: {
        serverActions: {
            bodySizeLimit: "5mb",
        },
    },
    devIndicators: {
        position: "top-right",
    },
    images: {
        remotePatterns: [
            {
                protocol: process.env.AWS_S3_PROTOCOL,
                hostname: process.env.AWS_S3_HOSTNAME,
                pathname: `/${process.env.AWS_S3_BUCKET}/**`,
            },
        ],
    },
};

export default withNextIntl(nextConfig);
