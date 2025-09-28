/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            new URL("https://my-store-id.public.blob.vercel-storage.com/**"),
        ],
    },
};

export default nextConfig;
