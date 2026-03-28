import { SiteConfig } from "@/site-config";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isValidHexColor(value) {
    return hasText(value) && HEX_COLOR_PATTERN.test(value.trim());
}

function getStripeHeaderStyle(config) {
    return config?.brand?.stripeHeaderStyle === "logo" ? "logo" : "display_name";
}

export function resolveStripeBrandAssetUrl(assetPath, prodUrl = SiteConfig.prodUrl) {
    if (!hasText(assetPath) || !hasText(prodUrl)) {
        return null;
    }

    try {
        const resolvedUrl = new URL(assetPath, prodUrl);

        if (!["http:", "https:"].includes(resolvedUrl.protocol)) {
            return null;
        }

        return resolvedUrl.toString();
    } catch {
        return null;
    }
}

export function getStripeCheckoutBrandingSettings(config = SiteConfig) {
    const brandingSettings = {};
    const stripeHeaderStyle = getStripeHeaderStyle(config);

    if (hasText(config?.title)) {
        brandingSettings.display_name = config.title.trim();
    }

    if (isValidHexColor(config?.brand?.primary)) {
        brandingSettings.button_color = config.brand.primary.trim();
    }

    if (isValidHexColor(config?.brand?.stripeBackgroundColor)) {
        brandingSettings.background_color = config.brand.stripeBackgroundColor.trim();
    }

    const iconUrl = resolveStripeBrandAssetUrl(config?.brand?.stripeIconPath, config?.prodUrl);
    const logoUrl = resolveStripeBrandAssetUrl(config?.brand?.stripeLogoPath, config?.prodUrl);

    if (stripeHeaderStyle === "logo" && logoUrl) {
        brandingSettings.logo = {
            type: "url",
            url: logoUrl,
        };
    } else if (iconUrl) {
        brandingSettings.icon = {
            type: "url",
            url: iconUrl,
        };
    }

    return Object.keys(brandingSettings).length > 0 ? brandingSettings : undefined;
}
