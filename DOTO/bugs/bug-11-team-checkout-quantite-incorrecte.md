# BUG #11 — Plan Team : Stripe Checkout facture 1 siège au lieu du total affiché

## Priority
critique

## Area
stripe / team billing

## Page
/dashboard/org/subscription + Stripe Checkout

## Summary
L'UI Team calcule bien le total selon le nombre de membres, mais le checkout Stripe part avec quantity=1.

## Reproduction
- Créer/configurer un plan Team avec Price IDs Stripe valides.
- Se connecter sur une org à 2 membres (ex: UI State Org).
- Ouvrir /dashboard/org/subscription.
- Constater 30€/mois et 300€/an affichés sur la carte Team.
- Cliquer Subscribe et observer Stripe Checkout à 15€/mois ou 150€/an.

## Expected
Le total Stripe Checkout doit correspondre au total UI pour le même nombre de membres.

## Actual
Checkout facture 1 siège.

## Impact
CRITIQUE : sous-facturation réelle des plans Team/per-seat.

## Likely cause
Comparaison sensible à la casse : plan.name === 'team' alors que le plan s'appelle 'Team', donc seats n'est pas transmis.

## Files
- src/actions/subscription.action.js

## Proposed fix
- Utiliser plan.name.toLowerCase() === 'team'.
- Mieux : ajouter un champ explicite de type de plan et ne pas déduire depuis le nom.
- Ajouter un test e2e UI->Checkout pour 1 et 2+ membres.
