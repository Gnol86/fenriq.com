# BUG #12 — Admin Plans : doublon de nom => Server Components render error

## Priority
haute

## Area
admin plans

## Page
/dashboard/admin/plans

## Summary
Créer un plan avec un nom déjà existant provoque une erreur générique au lieu d'une validation claire.

## Reproduction
- Aller dans l'admin plans.
- Créer un plan nommé 'Team' alors que 'Team' existe déjà.

## Expected
Erreur métier lisible : nom déjà pris.

## Actual
Server Components render error générique.

## Impact
Mauvaise UX admin, diagnostic difficile.

## Likely cause
Erreur Prisma unique non catchée dans createPlanAction.

## Files
- src/actions/plan.action.js

## Proposed fix
- Catcher l'erreur d'unicité Prisma et afficher un toast/message clair.
