# BUG #9 — Impossible de quitter une org active

## Priority
haute

## Area
organization membership UX

## Page
/dashboard

## Summary
Le bouton quitter est masqué quand l'org est active, rendant impossible le départ si l'utilisateur n'a qu'une seule org.

## Reproduction
- Se connecter avec un membre d'une seule org active.
- Ouvrir Dashboard > My Organizations.
- Chercher une action 'Quitter'.

## Expected
Pouvoir quitter une org même si elle est active, avec garde-fous éventuels.

## Actual
Aucun bouton visible pour quitter l'org active.

## Impact
Utilisateur coincé dans l'organisation.

## Likely cause
Guard `if (isActive) return null`.

## Files
- src/components/leave-organization-button.jsx

## Proposed fix
- Afficher le bouton même si active.
- Désactiver l'org active avant leave ou ajouter une page dédiée.
