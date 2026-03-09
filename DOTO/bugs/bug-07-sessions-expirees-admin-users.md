# BUG #7 — Sessions expirées encore affichées comme actives

## Priority
moyenne

## Area
admin users / sessions

## Page
/dashboard/admin/users

## Summary
Des sessions expirées restent listées comme actives dans l'UI admin.

## Reproduction
- Ouvrir /dashboard/admin/users.
- Déplier un utilisateur avec anciennes sessions.
- Comparer la date d'expiration au jour courant.

## Expected
Les sessions expirées ne doivent pas être comptées comme actives.

## Actual
Des sessions expirées apparaissent dans 'Sessions actives'.

## Impact
Confusion admin, mauvais diagnostic sécurité.

## Likely cause
Absence de filtre ou de marquage sur expiration.

## Files
- /dashboard/admin/users (server + UI)

## Proposed fix
- Filtrer côté serveur ou marquer explicitement 'expirée'.
