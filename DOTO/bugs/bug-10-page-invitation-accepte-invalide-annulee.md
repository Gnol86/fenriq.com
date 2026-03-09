# BUG #10 — Page d'invitation affiche encore Accept/Reject pour des invitations invalides

## Priority
haute

## Area
invitations

## Page
/invitations/[invitationId]

## Summary
Les invitations annulées ou invalide/non trouvées continuent d'afficher l'UI d'acceptation standard.

## Reproduction
- Ouvrir un lien d'invitation annulée.
- Ouvrir un lien d'invitation déjà invalide / non actionnable.
- Comparer avec le cas d'une org supprimée qui tombe bien en 404.

## Expected
Des états dédiés : annulée, expirée, déjà acceptée, invalide.

## Actual
L'UI standard Accept/Reject reste affichée dans plusieurs cas invalides.

## Impact
UX trompeuse et actions fantômes.

## Likely cause
La page se base sur Prisma brut sans valider le statut métier Better Auth.

## Files
- src/app/(auth)/invitations/[invitationId]/page.js

## Proposed fix
- Vérifier invitation.status === pending.
- Afficher des états dédiés pour canceled/accepted/rejected/expired.
