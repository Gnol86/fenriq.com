import stripe from "@/lib/stripe";
import { calculateTieredPrice } from "@/lib/utils";

const STRIPE_PRICE_EXPAND = ["product", "tiers"];

export class StripePlanValidationError extends Error {
    constructor(code, details = {}) {
        super(code);
        this.name = "StripePlanValidationError";
        this.code = code;
        this.details = details;
    }
}

const getExpandedProduct = price => {
    if (!price.product || typeof price.product === "string" || price.product.deleted) {
        throw new StripePlanValidationError("price_lookup_failed", {
            priceId: price.id,
        });
    }

    return price.product;
};

const mapTiers = tiers =>
    tiers?.map(tier => ({
        up_to: tier.up_to,
        unit_amount: tier.unit_amount,
        flat_amount: tier.flat_amount,
    })) ?? null;

const getTieredMinimum = tiers => tiers?.[0]?.up_to ?? 1;

export function getSerializedPriceBaseAmount(price) {
    if (!price.tiersMode) {
        return price.amount ?? 0;
    }

    return calculateTieredPrice(price.tiers, getTieredMinimum(price.tiers), price.tiersMode);
}

export function serializeStripePrice(price) {
    const product = getExpandedProduct(price);

    return {
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        billingScheme: price.billing_scheme,
        tiersMode: price.tiers_mode ?? null,
        tiers: mapTiers(price.tiers),
        product: {
            id: product.id,
            name: product.name,
            description: product.description,
            metadata: product.metadata ?? {},
        },
    };
}

const buildAnnualComparison = (monthlyPrice, annualPrice) => {
    const monthlyBaseAmount = getSerializedPriceBaseAmount(monthlyPrice);
    const annualAmount = getSerializedPriceBaseAmount(annualPrice);
    const monthlyYearlyAmount = monthlyBaseAmount * 12;
    const savingsPercentage =
        monthlyYearlyAmount === 0
            ? null
            : Math.round(((monthlyYearlyAmount - annualAmount) / monthlyYearlyAmount) * 100);

    return {
        monthlyBaseAmount,
        monthlyYearlyAmount,
        annualAmount,
        savingsPercentage,
        isDiscounted: annualAmount < monthlyYearlyAmount,
        isMoreExpensive: annualAmount > monthlyYearlyAmount,
    };
};

const normalizeValidationError = (error, priceId = null) => {
    if (error instanceof StripePlanValidationError) {
        return error;
    }

    if (error?.type === "StripeInvalidRequestError") {
        return new StripePlanValidationError("price_not_found", {
            priceId,
        });
    }

    return new StripePlanValidationError("price_lookup_failed", {
        priceId,
    });
};

async function retrieveStripePrice(priceId) {
    try {
        return await stripe.prices.retrieve(priceId, {
            expand: STRIPE_PRICE_EXPAND,
        });
    } catch (error) {
        throw normalizeValidationError(error, priceId);
    }
}

function validateRecurringPrice(price, expectedInterval) {
    if (!price.active) {
        throw new StripePlanValidationError("price_inactive", {
            priceId: price.id,
        });
    }

    if (price.type !== "recurring" || !price.recurring) {
        throw new StripePlanValidationError("price_not_recurring", {
            priceId: price.id,
        });
    }

    if (price.recurring.interval !== expectedInterval || price.recurring.interval_count !== 1) {
        throw new StripePlanValidationError(
            expectedInterval === "month" ? "monthly_interval_invalid" : "annual_interval_invalid",
            {
                priceId: price.id,
            }
        );
    }

    getExpandedProduct(price);
}

function validateComparablePrices(monthlyPrice, annualPrice) {
    const monthlyProduct = getExpandedProduct(monthlyPrice);
    const annualProduct = getExpandedProduct(annualPrice);

    if (monthlyProduct.id !== annualProduct.id) {
        throw new StripePlanValidationError("product_mismatch", {
            monthlyPriceId: monthlyPrice.id,
            annualPriceId: annualPrice.id,
        });
    }

    if (monthlyPrice.currency !== annualPrice.currency) {
        throw new StripePlanValidationError("currency_mismatch", {
            monthlyPriceId: monthlyPrice.id,
            annualPriceId: annualPrice.id,
        });
    }

    if (monthlyPrice.billing_scheme !== annualPrice.billing_scheme) {
        throw new StripePlanValidationError("billing_scheme_mismatch", {
            monthlyPriceId: monthlyPrice.id,
            annualPriceId: annualPrice.id,
        });
    }

    if ((monthlyPrice.tiers_mode ?? null) !== (annualPrice.tiers_mode ?? null)) {
        throw new StripePlanValidationError("tiers_mode_mismatch", {
            monthlyPriceId: monthlyPrice.id,
            annualPriceId: annualPrice.id,
        });
    }
}

export async function getValidatedPlanStripePricing({
    priceId,
    annualDiscountPriceId = null,
    allowInvalidAnnual = false,
}) {
    const monthlyRawPrice = await retrieveStripePrice(priceId);
    validateRecurringPrice(monthlyRawPrice, "month");

    const monthlyPrice = serializeStripePrice(monthlyRawPrice);
    let annualPrice = null;
    let annualComparison = null;
    let annualValidationError = null;

    if (annualDiscountPriceId) {
        try {
            const annualRawPrice = await retrieveStripePrice(annualDiscountPriceId);
            validateRecurringPrice(annualRawPrice, "year");
            validateComparablePrices(monthlyRawPrice, annualRawPrice);

            annualPrice = serializeStripePrice(annualRawPrice);
            annualComparison = buildAnnualComparison(monthlyPrice, annualPrice);
        } catch (error) {
            const normalizedError = normalizeValidationError(error, annualDiscountPriceId);

            if (!allowInvalidAnnual) {
                throw normalizedError;
            }

            annualValidationError = normalizedError;
        }
    }

    return {
        monthlyPrice,
        annualPrice,
        annualComparison,
        annualValidationError,
    };
}
