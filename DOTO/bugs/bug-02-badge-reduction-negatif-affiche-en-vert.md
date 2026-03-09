# BUG #2 — Badge de réduction négatif affiché en vert

## Priority
haute

## Area
subscription UI

## Page
/dashboard/org/subscription (tab Annuel)

## Summary
Le badge de réduction affiche -9% comme une économie alors que l'annuel est plus cher.

## Reproduction
- Aller sur /dashboard/org/subscription.
- Basculer sur Annuel.
- Observer le badge de réduction sur Vehicle license.

## Expected
Aucun badge vert si l'économie est négative.

## Actual
Un badge vert '-9%' est affiché alors que l'offre coûte plus cher.

## Impact
UX trompeuse et signal visuel mensonger.

## Likely cause
La fonction de calcul des économies retourne une valeur négative qui n'est pas filtrée avant affichage.

## Files
- src/app/dashboard/org/subscription/components/plan-card.jsx

## Proposed fix
- N'afficher le badge que si savings > 0.
- Sinon n'afficher rien ou un indicateur neutre/rouge.
