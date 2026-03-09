# BUG #1 — Prix annuel plus cher que mensuel × 12

## Priority
haute

## Area
subscription / pricing

## Page
/dashboard/org/subscription (tab Annuel)

## Summary
Le plan Vehicle license affiche un prix annuel supérieur à 12× le prix mensuel.

## Reproduction
- Se connecter avec un compte ayant accès à /dashboard/org/subscription.
- Ouvrir la page Abonnement.
- Basculer sur l'onglet Annuel.
- Comparer le prix mensuel Vehicle license (2,99€/mois => 35,88€/an) au prix annuel affiché (39,00€).

## Expected
Le prix annuel doit être inférieur ou égal à 12× le mensuel, ou au minimum cohérent avec la stratégie tarifaire affichée.

## Actual
Le prix annuel affiché (39,00€) est plus cher que 35,88€.

## Impact
UX trompeuse et risque commercial : un utilisateur peut payer plus en annuel qu'en mensuel.

## Likely cause
Prix Stripe annuel mal configuré ou absence de validation de cohérence côté app.

## Files
- Stripe dashboard / plan Vehicle license
- src/app/dashboard/org/subscription/components/plan-card.jsx

## Proposed fix
- Vérifier le prix annuel Stripe du produit Vehicle license.
- Ajouter un contrôle de cohérence lors de l'affichage/admin pour signaler un annual >= monthly*12.
