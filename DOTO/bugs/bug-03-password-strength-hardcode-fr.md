# BUG #3 — PasswordStrengthInput hardcodé en français

## Priority
haute

## Area
i18n / auth

## Page
/signup

## Summary
Le composant de force du mot de passe reste en français quelle que soit la langue du site.

## Reproduction
- Aller sur /signup.
- Basculer l'interface en EN/DE/NL.
- Observer les labels du composant de force du mot de passe.

## Expected
Tous les labels du composant doivent suivre la locale active.

## Actual
Les textes restent en français.

## Impact
Rupture d'i18n visible dès l'inscription.

## Likely cause
Strings hardcodées dans le composant au lieu d'utiliser next-intl.

## Files
- src/components/ui/password-strength-input.jsx
- src/messages/*.json

## Proposed fix
- Injecter useTranslations() comme pour PasswordInput.
- Ajouter les clés dans FR/EN/DE/NL.
