import { SiteConfig } from "@/site-config";

export default function manifest() {
    return {
        name: SiteConfig.title,
        short_name: SiteConfig.title,
        description: SiteConfig.description,
        start_url: "/",
        display: "standalone",
        background_color: "#fff",
        theme_color: SiteConfig.brand.primary,
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
        ],
    };
}
