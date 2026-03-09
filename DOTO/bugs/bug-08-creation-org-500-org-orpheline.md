# BUG #8 — Création d'organisation : 500 intermittente + org orpheline

## Priority
critique

## Area
organization creation

## Page
/dashboard

## Summary
La création d'org peut renvoyer une erreur 500 après création DB, laissant une org invisible/orpheline.

## Reproduction
- Créer une nouvelle organisation depuis le dashboard sur un nouveau compte.
- Observer les cas où la création déclenche un Server Components render error.
- Vérifier ensuite que le slug existe déjà côté serveur mais que l'org n'apparaît pas côté user.

## Expected
Création atomique : org créée + activée + visible, ou rollback propre en cas d'échec.

## Actual
Org créée en base mais non activée/non visible suite à un crash de re-render.

## Impact
CRITIQUE : données orphelines et utilisateur bloqué.

## Likely cause
createOrganizationAction sans try/catch, setActiveOrganization / re-render cassent après la création DB.

## Files
- src/actions/organization.action.js

## Proposed fix
- Encadrer la flow dans try/catch.
- Gérer séparément création et activation.
- Ajouter rollback ou récupération si activation échoue.
