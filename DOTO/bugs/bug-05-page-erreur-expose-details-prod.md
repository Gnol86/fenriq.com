# BUG #5 — Page d'erreur expose des détails en production

## Priority
critique

## Area
security / error handling

## Page
/error

## Summary
La page d'erreur se base sur VERCEL_ENV, inexistant sur Dokploy, donc les détails d'erreur sont visibles en prod.

## Reproduction
- Déclencher une erreur serveur en prod.
- Observer le contenu de la page d'erreur.

## Expected
Aucun détail sensible ne doit être affiché en production.

## Actual
Message/digest/stack peuvent être visibles.

## Impact
Fuite d'informations sensibles sur l'infra et les erreurs internes.

## Likely cause
Condition process.env.VERCEL_ENV !== 'production' inadaptée hors Vercel.

## Files
- src/app/error.js

## Proposed fix
- Utiliser NODE_ENV pour le mode prod.
- Garder les détails seulement en dev.
