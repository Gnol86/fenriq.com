# BUG #14 — Admin Plans : annualDiscountPriceId invalide accepté en édition

## Priority
haute

## Area
admin plans / stripe validation

## Page
/dashboard/admin/plans

## Summary
Modifier un plan existant avec un annualDiscountPriceId invalide réussit et fait disparaître le plan côté user.

## Reproduction
- Éditer le plan Team dans l'admin.
- Remplacer annualDiscountPriceId par price_INVALID_ANNUAL.
- Sauvegarder.
- Ouvrir /dashboard/org/subscription côté user.

## Expected
L'édition doit être rejetée avec message clair.

## Actual
Plan updated successfully, puis le plan disparaît côté utilisateur.

## Impact
Un admin peut casser silencieusement un plan existant.

## Likely cause
Absence de validation Stripe dans updatePlanAction.

## Files
- src/actions/plan.action.js

## Proposed fix
- Valider priceId et annualDiscountPriceId en create et update.
