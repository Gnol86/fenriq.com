import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            new URL("https://my-store-id.public.blob.vercel-storage.com/**"),
        ],
    },
};

export default withNextIntl(nextConfig);
