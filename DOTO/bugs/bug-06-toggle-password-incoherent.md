# BUG #6 — Toggle mot de passe incohérent entre composants

## Priority
moyenne

## Area
auth UI

## Page
/signup, /dashboard/user/settings

## Summary
Le toggle d'affichage du mot de passe n'a pas le même comportement selon le composant utilisé.

## Reproduction
- Comparer le champ mot de passe principal et confirmation sur signup/settings.
- Observer l'état disabled du toggle quand le champ est vide.

## Expected
Un comportement homogène sur tous les champs password.

## Actual
Certains toggles sont cliquables à vide, d'autres non.

## Impact
Incohérence UX.

## Likely cause
Deux composants avec règles différentes : PasswordInput vs PasswordStrengthInput.

## Files
- src/components/ui/password-input.jsx
- src/components/ui/password-strength-input.jsx

## Proposed fix
- Unifier la logique disabled/visible.
- Choisir une règle UX unique et l'appliquer partout.
