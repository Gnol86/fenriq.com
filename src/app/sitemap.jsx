import { SiteConfig } from "@/site-config";

export default async function sitemap() {
    return [
        {
            url: SiteConfig.prodUrl,
            lastModified: new Date(),
            changeFrequency: "monthly",
        },
        {
            url: `${SiteConfig.prodUrl}/signup`,
            lastModified: new Date(),
            changeFrequency: "monthly",
        },
        {
            url: `${SiteConfig.prodUrl}/signin`,
            lastModified: new Date(),
            changeFrequency: "monthly",
        },
    ];
}
