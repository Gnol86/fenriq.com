# M1 — Pas de 'Mot de passe oublié' / Reset password

## Type
manquement

## Area
auth / recovery

## Goal
Ajouter un flow de reset password dans l'UI.

## Context
Better Auth supporte forgetPassword mais rien n'est câblé en UI. L'utilisateur bloqué doit contacter un admin.

## Proposed next steps
- Ajouter un lien 'Mot de passe oublié ?' sur /signin
- Créer les écrans de demande/reset
- Tester email, token, expiration, retour de succès
