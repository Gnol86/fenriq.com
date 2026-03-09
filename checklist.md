# 🧪 Checklist de Test - Boilerplate (BLP)

**Date :** 2026-03-09
**Testeur :** GLaDOS 🤖
**URL :** https://omka.cloud
**Compte admin :** arnaud.marchot@icloud.com
**Comptes test :** glados.openclaw+blpA/B@gmail.com, glados.openclaw+uia088253/uib088253@gmail.com (comptes de test créés pour les flows, certains supprimés)
**Note :** Les bugs, manquements et suggestions ont été déplacés dans `DOTO/`.

---

## 📋 Légende
- ✅ OK — testé et fonctionnel dans le scénario exécuté
- ⚠️ WARN — comportement observé / à clarifier
- 🚫 SKIP — non testé ou bloqué, raison notée

---

## 1. Landing Page (/)
- ✅ Chargement de page
- ✅ Boutons Sign In / Sign Up / Sign Out / Aller à l'application selon état connecté
- ✅ Sélecteur de langue FR/EN/DE/NL
- ✅ Theme toggler
- ✅ Footer

## 2. Auth — Sign Up (/signup)
- ✅ Page et champs d'inscription
- ✅ Password strength indicator
- ✅ Lien vers Sign In
- ✅ Bouton Annuler
- ✅ Inscription complète testée
- ✅ Redirection vers /verify-email
- ✅ Réception email de vérification
- ✅ Lien de vérification
- ✅ Page /email-verified
- ✅ Connexion après vérification

## 3. Auth — Sign In (/signin)
- ✅ Page et champs de connexion
- ✅ Validation champs vides
- ✅ Connexion avec bons identifiants
- ✅ Lien vers Sign Up
- ✅ Bouton Cancel
- 🚫 Mauvais identifiants non testés volontairement (éviter lockout)
- ✅ Reconnexion après sign out

## 4. Auth — Email Verification (/verify-email)
- ✅ Email pré-rempli
- ✅ Bouton renvoi
- ✅ Liens retour / signin
- ⚠️ Le wording de la page semble orienté OTP alors que le flow réel utilise un lien email

## 5. Auth — Email Verified (/email-verified)
- ✅ Affichage post-vérification
- ✅ Bouton Accéder à l'application

## 6. Dashboard Principal (/dashboard)
- ✅ Accès authentifié
- ✅ Message de bienvenue
- ✅ Card organisation active
- ✅ Card mes organisations
- ✅ Personnes de contact
- ✅ Sidebar
- ✅ Breadcrumb

## 7. App Page (/app)
- ✅ Documentation affichée
- ✅ Navigation spécifique documentation
- ✅ Exemples de code visibles

## 8. User Settings (/dashboard/user/settings)
- ✅ Avatar modifiable
- ✅ Nom modifiable
- ✅ Changement de mot de passe

## 9. User Invitations (/dashboard/user/invitations)
- ✅ Page accessible
- ✅ Empty state sans invitation

## 10. User Danger Zone (/dashboard/user/danger-zone)
- ✅ Page accessible
- ✅ Suppression de compte testée avec confirmation

## 11. Organisation — Members (/dashboard/org/members)
- ✅ Liste membres
- ✅ Bouton Inviter
- ✅ Recherche
- ✅ Actions de rôle visibles

## 12. Organisation — Invitations (/dashboard/org/invitations)
- ✅ Page accessible
- ✅ Dialog d'invitation
- ✅ Choix de rôle
- ✅ Recherche par email
- ✅ Toggle de vue
- ✅ Envoi d'invitation
- ✅ Actions renvoyer / annuler visibles sur invitation en attente

## 13. Organisation — Subscription (/dashboard/org/subscription)
- ✅ Tabs Mensuel / Annuel
- ✅ Affichage des plans et prix
- ✅ Quantity selector
- ✅ Calcul des totaux dans l'UI
- ✅ Redirection vers Stripe Checkout
- ✅ Retour depuis Stripe Checkout (annulation)
- ✅ Moyens de paiement visibles (Carte, PayPal)
- ✅ Code promo visible
- ✅ Création et test d'un plan Team de test
- ✅ Team : total dynamique pour 1 membre / 2 membres dans l'UI
- 🚫 Paiement complet non automatisé (hCaptcha / checkout headless Stripe)

## 14. Organisation — Manage (/dashboard/org/manage)
- ✅ Logo modifiable
- ✅ Nom modifiable

## 15. Organisation — Danger Zone (/dashboard/org/danger-zone)
- ✅ Avertissement destructif
- ✅ Bouton supprimer l'organisation
- ✅ Dialog de confirmation visible
- ✅ Suppression d'organisation testée dans au moins un flow

## 16. Admin — Dashboard (/dashboard/admin)
- ✅ Redirection vers /dashboard/admin/users

## 17. Admin — Users (/dashboard/admin/users)
- ✅ Liste utilisateurs
- ✅ Recherche
- ✅ Détails expandables
- ✅ Sessions visibles
- ✅ Actions bannir / usurper / supprimer / révoquer

## 18. Admin — Organizations (/dashboard/admin/orgs)
- ✅ Liste organisations
- ✅ Recherche
- ✅ Liens vers détails
- ✅ Affichage statut / membres / création

## 19. Admin — Plans (/dashboard/admin/plans)
- ✅ Liste plans
- ✅ Création de plan via UI admin
- ✅ Édition de plan via UI admin
- ✅ Suppression de plan via UI admin
- ✅ Flag `Show on pricing page` testé (masquage/réaffichage côté user)

## 20. Admin — Feedbacks (/dashboard/admin/feedbacks)
- ✅ Stats résumé
- ✅ Toggle feedbacks traités

## 21. Sidebar & Navigation
- ✅ Toggle Sidebar
- ✅ Liens de navigation
- ✅ Sélecteur d'organisation
- ✅ Création d'organisation depuis sidebar
- ✅ Menu utilisateur
- ✅ Dialog feedback
- ✅ Breadcrumbs

## 22. i18n (Internationalisation)
- ✅ Switch FR ↔ EN
- ✅ 4 langues disponibles
- ✅ Toast de confirmation
- ✅ Parité de clés de traduction vérifiée globalement

## 23. Composants UI
- ✅ Toasts
- ✅ Modales / dialogs
- ✅ Password visibility toggle
- ✅ ChangeInput
- ✅ ComboBox
- ✅ Quantity selector
- ✅ Tabs
- ✅ Collapsible admin users

## 24. Sécurité
- ✅ Redirection vers /signin sans auth pour dashboard/admin
- ✅ Sign out

## 25. Pages spéciales
- ✅ 404
- ✅ Error page affichée

## 26. Invitation Flow (End-to-End avec 2 comptes)
- ✅ Création User A
- ✅ Création User B
- ✅ Vérification email A/B
- ✅ Création d'organisation par User A
- ✅ Invitation User B
- ✅ Réception email d'invitation
- ✅ Acceptation invitation
- ✅ User B devient membre
- ✅ Restriction membre sur pages admin org (404 sur /dashboard/org/members)

## 27. Flows complets testés
- ✅ Compte unique : signup → verify → connexion → création org → invitation → checkout → annulation → suppression org → suppression compte
- ✅ Multi-comptes : signup A/B → verify → org → invitation → acceptation → permissions membre → cleanup partiel
