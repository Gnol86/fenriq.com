# BUG #13 — Admin Plans : priceId invalide accepté en création

## Priority
haute

## Area
admin plans / stripe validation

## Page
/dashboard/admin/plans

## Summary
Un priceId Stripe invalide peut être créé en base avec un faux message de succès.

## Reproduction
- Créer un plan avec price_DOES_NOT_EXIST comme priceId.
- Soumettre le formulaire admin.

## Expected
Validation côté serveur et rejet du formulaire.

## Actual
Plan créé, toast succès, plan invisible ensuite côté user car filtré.

## Impact
Données cassées en base + admin trompé.

## Likely cause
Aucune validation Stripe du priceId dans createPlanAction.

## Files
- src/actions/plan.action.js

## Proposed fix
- Valider priceId via stripe.prices.retrieve avant insertion.
- Faire pareil pour annualDiscountPriceId.
