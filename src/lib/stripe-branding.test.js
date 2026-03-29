import { describe, expect, test } from "bun:test";
import { getStripeCheckoutBrandingSettings } from "./stripe-branding";

describe("getStripeCheckoutBrandingSettings", () => {
    test("retourne le nom, la couleur et l'icône Stripe", () => {
        const result = getStripeCheckoutBrandingSettings({
            title: "PolGPT",
            prodUrl: "https://polgpt.be",
            brand: {
                primary: "#112233",
                stripeBackgroundColor: "#f5f5f5",
                stripeIconPath: "/images/icon.png",
            },
        });

        expect(result).toEqual({
            display_name: "PolGPT",
            button_color: "#112233",
            background_color: "#f5f5f5",
            icon: {
                type: "url",
                url: "https://polgpt.be/images/icon.png",
            },
        });
    });

    test("privilégie l'icône et le titre par défaut même si un logo est configuré", () => {
        const result = getStripeCheckoutBrandingSettings({
            title: "PolGPT",
            prodUrl: "https://polgpt.be",
            brand: {
                primary: "#112233",
                stripeBackgroundColor: "#f5f5f5",
                stripeIconPath: "/images/icon.png",
                stripeLogoPath: "/images/logo.png",
            },
        });

        expect(result).toEqual({
            display_name: "PolGPT",
            button_color: "#112233",
            background_color: "#f5f5f5",
            icon: {
                type: "url",
                url: "https://polgpt.be/images/icon.png",
            },
        });
    });

    test("ajoute le logo Stripe quand le mode d'en-tête est logo", () => {
        const result = getStripeCheckoutBrandingSettings({
            title: "PolGPT",
            prodUrl: "https://polgpt.be",
            brand: {
                primary: "#112233",
                stripeBackgroundColor: "#f5f5f5",
                stripeIconPath: "/images/icon.png",
                stripeLogoPath: "/images/logo.png",
                stripeHeaderStyle: "logo",
            },
        });

        expect(result).toEqual({
            display_name: "PolGPT",
            button_color: "#112233",
            background_color: "#f5f5f5",
            logo: {
                type: "url",
                url: "https://polgpt.be/images/logo.png",
            },
        });
    });

    test("omet les images si prodUrl est invalide", () => {
        const result = getStripeCheckoutBrandingSettings({
            title: "PolGPT",
            prodUrl: "not-a-valid-url",
            brand: {
                primary: "#112233",
                stripeBackgroundColor: "#f5f5f5",
                stripeIconPath: "/images/icon.png",
                stripeLogoPath: "/images/logo.png",
            },
        });

        expect(result).toEqual({
            display_name: "PolGPT",
            button_color: "#112233",
            background_color: "#f5f5f5",
        });
    });

    test("omet les images si un chemin est vide", () => {
        const result = getStripeCheckoutBrandingSettings({
            title: "PolGPT",
            prodUrl: "https://polgpt.be",
            brand: {
                primary: "#112233",
                stripeBackgroundColor: "#f5f5f5",
                stripeIconPath: "",
                stripeLogoPath: "   ",
            },
        });

        expect(result).toEqual({
            display_name: "PolGPT",
            button_color: "#112233",
            background_color: "#f5f5f5",
        });
    });
});
