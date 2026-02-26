# Test Report — 2026-02-26

Testé sur https://omka.cloud (déploiement Dokploy, branche `main`).

---

## ✨ Features implémentées

### 1. Changement de mot de passe dans User Settings

**Status : ✅ Implémenté et déployé**

- Nouvelle card "Changer le mot de passe" ajoutée dans `/dashboard/user/settings`
- Formulaire avec 3 champs : mot de passe actuel, nouveau mot de passe, confirmation
- Validation avec Zod (longueur min 8, majuscule, minuscule, chiffre, correspondance)
- Indicateur de force du mot de passe (`PasswordStrengthInput`)
- Traduit en 4 langues (fr, en, nl, de)
- Server action `changePasswordAction` via `auth.api.changePassword`

**Fichiers créés/modifiés :**
- `src/features/user/change-password-form.jsx` — nouveau composant
- `src/actions/user.action.js` — nouvelle action `changePasswordAction`
- `src/app/dashboard/user/settings/page.js` — page mise à jour
- `src/messages/{fr-FR,en-US,nl-NL,de-DE}.json` — traductions ajoutées

---

### 2. Plans Stripe de démo/template

**Status : ✅ Implémenté et poussé**

- `prisma/seed.js` — script de seed avec 3 plans (Starter, Pro, Team)
- `src/lib/stripe-plans-config.js` — documentation et helper `getOrganizationSubscriptionLimits()`
- Plans configurés : Starter (3 membres, 5 projets), Pro (15 membres, illimité), Team (illimité)
- Tous les `priceId` sont clairement marqués `REPLACE_ME` pour les nouveaux projets

---

## 🔧 Bugs trouvés et corrigés

### Bug 1 : `useServerAction` — redirect/refresh même en cas d'erreur

**Status : ✅ Corrigé**

**Problème :** Le bloc `finally` dans `useServerAction.js` exécutait toujours `redirectOnSuccess` et `refreshOnSuccess`, même lorsque le server action échouait. Cela causait des redirections non désirées après une erreur.

**Fix :** Ajout d'un flag `actionSucceeded` dans `toast.promise`, le `finally` ne fait plus de redirect/refresh si l'action a échoué.

**Fichier :** `src/hooks/use-server-action.js`

---

### Bug 2 : `invitation.createdAt` manquant dans le schema Prisma

**Status : ✅ Corrigé**

**Root cause :** Better-Auth 1.4.18 passe `createdAt` lors de `prisma.invitation.create()`, mais le champ n'existait pas dans le modèle `Invitation` du schema Prisma. Erreur : `PrismaClientValidationError: Unknown argument 'createdAt'`.

**Découvert via :** Logs Docker sur le serveur de production.

**Fix :**
1. Ajout de `createdAt DateTime @default(now())` dans `prisma/schema/base.prisma`
2. Migration SQL `prisma/schema/migrations/20260226053000_add_created_at_to_invitation/migration.sql`
3. Migration appliquée directement en production via psql
4. Enregistrée dans `_prisma_migrations` pour éviter une double application

**Impact :** Le flow d'invitation était complètement cassé (500 sur toute tentative d'envoi d'invitation).

---

### Bug 3 : Upload de logo — S3 non configuré

**Status : ⚠️ Config manquante (non-code)**

**Problème :** `/api/upload` retourne 500 car les variables d'environnement S3 ne sont pas configurées dans Dokploy.

**Variables manquantes :**
```
AWS_S3_PROTOCOL
AWS_S3_HOSTNAME
AWS_S3_BUCKET
AWS_S3_REGION
AWS_S3_ACCESS_KEY_ID
AWS_S3_SECRET_ACCESS_KEY
```

**Action requise :** Configurer un provider S3 compatible (AWS S3, MinIO, Cloudflare R2, etc.) dans les variables d'environnement Dokploy du projet `omka-nextjs-zoddqz`.

---

## 🔍 Résultats des tests

### Test 3 : Flow d'invitation

| Étape | Status | Notes |
|-------|--------|-------|
| Ouverture dialog | ✅ OK | Dialog s'ouvre avec email + role selector |
| Soumission | ✅ OK (après fix) | Bug 2 corrigé, invitation créée en DB |
| Redirect vers /invitations | ✅ OK | Après fix Bug 1 (redirect uniquement en succès) |
| Affichage invitation | ✅ OK | `test.final@example.com` — "En attente" — 28 mars 2026 |
| Page d'acceptation | ✅ OK | `/invitations/[id]` — protection par email correcte |
| Acceptance email sent | ⚠️ Non testé | Resend peut ne pas envoyer vers example.com |

**Note :** Pour tester la réception et l'acceptation de l'email d'invitation, utiliser une vraie adresse email.

---

### Test 4 : Renommage organisation + upload logo

| Fonctionnalité | Status | Notes |
|----------------|--------|-------|
| Renommage | ✅ OK | Toast "Organisation mise à jour", sidebar se met à jour |
| Upload logo (dialog) | ✅ OK | Cropper s'ouvre, image preview visible |
| Sauvegarde logo | ❌ Échec | `/api/upload` → 500 (S3 non configuré — voir Bug 3) |

---

### Test 5 : Thème dark/light

| Fonctionnalité | Status | Notes |
|----------------|--------|-------|
| Toggle light → dark | ✅ OK | Animation CSS (view transition), toast "Thème sombre appliqué" |
| Toggle dark → light | ✅ OK | Toast "Thème clair appliqué" |
| Cohérence landing page | ✅ OK | Fond noir, texte blanc, footer adapté |
| Cohérence dashboard | ✅ OK | Sidebar, cards, breadcrumb — tous en dark mode |
| Cohérence settings | ✅ OK | Nouvelle card "Changer le mot de passe" en dark mode |
| Persistance thème | ✅ OK | Le thème est conservé entre les pages |

---

## 📋 Actions recommandées

1. **Configurer S3** dans Dokploy pour activer l'upload de logo (et profile images)
2. **Configurer Stripe** dans Dokploy + seeder les plans (`bun db:seed`)
3. **Tester l'email d'invitation** avec une vraie adresse email pour valider l'envoi Resend
4. **Tester le changement de mot de passe** avec les credentials de prod

---

## 🔀 Commits

```
feat: add change password form in user settings
feat: add Stripe demo plans seed & config template  
fix: useServerAction redirect/refresh only on success
fix: add createdAt to invitation model (Better-Auth 1.4.18 compat)
```
