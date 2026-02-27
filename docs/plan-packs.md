# 📦 Système de Quotas (Quantity-Based) — Plan d'implémentation v3

> v3 : Abandon du système de packs/add-ons au profit du **per-unit pricing**
> natif Stripe + champ `seats` existant dans Better Auth.
> Zéro nouvelle table. Un seul abonnement.

---

## Le concept

```
1 abonnement = prix unitaire × quantité choisie par l'utilisateur
```

### Exemple concret : Application Charroi

| Scénario | Quantité | Prix unitaire | Total |
|----------|----------|---------------|-------|
| Abonnement minimum | 10 véhicules | 2 €/véhicule | **20 €/mois** |
| Besoin de plus | 15 véhicules | 2 €/véhicule | **30 €/mois** |
| Grosse flotte | 50 véhicules | 2 €/véhicule | **100 €/mois** |

- **Minimum** : 10 unités (enforced côté app, pas Stripe)
- **Palier** : par 5 (optionnel, configurable)
- **Modifiable** à tout moment → Stripe proratise automatiquement

> "véhicules" est un exemple. Le boilerplate utilise `seats` — chaque projet
> décide ce que ça représente.

---

## Pourquoi c'est mieux que les packs

| Aspect | Packs (v2) | Quantity (v3) |
|--------|-----------|---------------|
| Tables DB | +2 nouvelles | **0 nouvelle** |
| Abonnements Stripe | Items multiples | **1 seul item** |
| Better Auth | Custom, contourne le plugin | **Natif (seats)** |
| Facture | Complexe (multi-lignes) | **1 ligne** |
| Code nouveau | ~8 fichiers | **~3 fichiers** |
| Admin UI | Nouvelle page CRUD | **Config dans le plan existant** |

---

## Comment ça fonctionne

### Côté Stripe

Un seul produit avec un prix **per-unit** :

```
Produit : "Starter"
Prix :    2,00 €/unité/mois  (billing_scheme: per_unit)
```

Quand l'utilisateur s'abonne avec 15 unités :
```
Abonnement Stripe
└── Item : Starter × 15 = 30,00 €/mois
```

Il passe à 25 unités :
```
stripe.subscriptionItems.update(itemId, { quantity: 25 })
→ Stripe proratise automatiquement
→ Prochaine facture : 50,00 €/mois
```

### Côté Better Auth (déjà implémenté !)

Le champ `seats` dans la table `subscription` = `quantity` Stripe.

```js
// À la souscription (DÉJÀ FONCTIONNEL dans le boilerplate)
auth.api.upgradeSubscription({
    plan: "starter",
    seats: 15,           // ← quantity envoyée à Stripe
    referenceId: org.id,
    // ...
});

// En DB : subscription.seats = 15
// Stripe : subscription_item.quantity = 15
```

### Côté App (ce qu'on ajoute)

```js
// Vérifier le quota avant d'ajouter une ressource
import { getOrganizationQuota } from "@/lib/quota";

const quota = await getOrganizationQuota(org.id, countVehicles);
// → { limit: 15, used: 12, remaining: 3, canAdd: true }

if (!quota.canAdd) {
    throw new Error("Limite atteinte. Augmentez votre abonnement.");
}
```

---

## Architecture

### Schéma de données : AUCUN CHANGEMENT

La table `subscription` a déjà tout ce qu'il faut :

```prisma
model Subscription {
    // ... champs existants ...
    seats  Int?  @default(1)  // ← C'EST NOTRE QUANTITÉ
}
```

Le champ `seats` est déjà :
- ✅ Écrit lors du checkout (`upgradeSubscription`)
- ✅ Syncé par le webhook Stripe (`checkout.session.completed`)
- ✅ Passé à Stripe comme `quantity` sur le subscription item

### Configuration dans `site-config.js`

```js
export const SiteConfig = {
    // ... existant ...

    // ========== QUOTA CONFIGURATION ==========
    quota: {
        enabled: true,            // Activer le système de quota
        unitLabel: "units",       // Clé générique (le projet renomme en UI)
        minimum: 10,              // Quantité minimum par abonnement
        step: 5,                  // Palier d'ajout (5 par 5)
        // Le max est défini par plan dans limits: {"units": -1} = illimité
    },
};
```

### Nouveau fichier : `src/lib/quota.js`

```js
/**
 * Calcule le quota d'une organisation.
 *
 * - limit = subscription.seats (quantité payée)
 * - used = compté par la fonction passée en paramètre
 *
 * @param {string} organizationId
 * @param {function} usageCountFn - (orgId) => Promise<number>
 * @returns {Promise<{limit, used, remaining, canAdd, percentage}>}
 */
export async function getOrganizationQuota(organizationId, usageCountFn) {
    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organizationId,
            status: { in: ["active", "trialing"] },
        },
    });

    const limit = subscription?.seats ?? 0;
    const used = await usageCountFn(organizationId);
    const remaining = Math.max(0, limit - used);

    return {
        limit,
        used,
        remaining,
        canAdd: used < limit,
        percentage: limit > 0 ? Math.round((used / limit) * 100) : 0,
    };
}
```

**C'est tout.** Une seule fonction, 20 lignes.

### Nouveau fichier : `src/actions/quota.action.js`

```js
/**
 * Met à jour la quantité (seats) d'un abonnement existant.
 * Appelle Stripe directement pour modifier le subscription item.
 */
export async function updateSubscriptionQuantityAction({ quantity }) {
    const { organization } = await requirePermission({
        permissions: { billing: ["manage"] },
    });

    // Validation minimum et palier depuis SiteConfig
    if (quantity < SiteConfig.quota.minimum) {
        throw new Error(`Minimum ${SiteConfig.quota.minimum} unités`);
    }
    if (quantity % SiteConfig.quota.step !== 0) {
        throw new Error(`La quantité doit être un multiple de ${SiteConfig.quota.step}`);
    }

    // Récupérer l'abonnement actif
    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organization.id,
            status: { in: ["active", "trialing"] },
        },
    });

    if (!subscription?.stripeSubscriptionId) {
        throw new Error("Aucun abonnement actif");
    }

    // Récupérer le subscription item Stripe
    const stripeSub = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
    );
    const itemId = stripeSub.items.data[0].id;

    // Mettre à jour la quantité sur Stripe
    await stripe.subscriptionItems.update(itemId, {
        quantity,
        proration_behavior: "create_prorations",
    });

    // Mettre à jour seats en DB
    await prisma.subscription.update({
        where: { id: subscription.id },
        data: { seats: quantity },
    });

    revalidatePath("/dashboard/org/subscription");
    return { success: true, seats: quantity };
}
```

### Composant UI : Sélecteur de quantité

Ajouté dans `manage-plan.jsx` — un simple sélecteur avec +/- :

```
┌─────────────────────────────────────────────┐
│  Utilisation                                 │
│                                              │
│  ████████████░░░░░░░░  12/15 unités (80%)   │
│                                              │
│  Modifier la quantité                        │
│  [ - ]  15  [ + ]     (palier de 5)         │
│                                              │
│  Nouveau montant : 30,00 €/mois              │
│  [Mettre à jour]                             │
└─────────────────────────────────────────────┘
```

---

## Fichiers impactés

### Nouveaux fichiers (3)

| Fichier | Rôle | Lignes estimées |
|---------|------|-----------------|
| `src/lib/quota.js` | `getOrganizationQuota()` — 1 fonction | ~25 |
| `src/actions/quota.action.js` | `updateSubscriptionQuantityAction()` | ~50 |
| `src/app/dashboard/org/subscription/components/quantity-selector.jsx` | UI +/- avec preview prix | ~80 |

### Fichiers modifiés (3)

| Fichier | Modification |
|---------|-------------|
| `src/site-config.js` | Ajouter section `quota` |
| `src/app/dashboard/org/subscription/components/manage-plan.jsx` | Ajouter section utilisation + sélecteur quantité |
| `src/app/dashboard/org/subscription/components/plan-card.jsx` | Ajouter sélecteur quantité au checkout initial |

### Fichiers NON modifiés (tout réutilisé tel quel)

- `src/lib/stripe.js` — client Stripe
- `src/lib/stripe-plans-config.js` — pas touché
- `src/lib/auth.js` — pas touché (seats déjà géré par Better Auth)
- `prisma/schema/base.prisma` — pas touché (seats existe déjà)
- `src/hooks/use-server-action.js` — même pattern
- `src/components/ui/progress.jsx` — barre de quota

---

## Flow complet

### 1. Souscription initiale

```
Page Abonnement → Plan Starter (2€/unité)
│
│  Choisissez votre quantité :
│  [ - ]  10  [ + ]     min: 10, palier: 5
│  Total : 20,00 €/mois
│  [S'abonner]
│
└→ upgradeSubscription({ plan: "starter", seats: 10 })
   └→ Stripe Checkout : Starter × 10 = 20€/mois
      └→ Webhook → DB : subscription.seats = 10
```

### 2. Augmentation

```
Page Abonnement → Gérer
│
│  12/10 unités utilisées ← rouge, presque plein
│  [ - ]  15  [ + ]
│  Nouveau montant : 30,00 €/mois (+10€)
│  [Mettre à jour]
│
└→ updateSubscriptionQuantityAction({ quantity: 15 })
   └→ stripe.subscriptionItems.update(itemId, { quantity: 15 })
      └→ Prorata automatique
      └→ DB : subscription.seats = 15
```

### 3. Vérification dans le code projet

```js
// Une seule ligne dans n'importe quelle action :
const quota = await getOrganizationQuota(org.id, countVehicles);
if (!quota.canAdd) throw new Error("Limite atteinte");
```

---

## Ce que ça ne fait PAS

- ❌ Pas de tiered pricing (prix dégressif) — juste per-unit, prix fixe
- ❌ Pas de dépassement autorisé — plein = plein
- ❌ Pas de diminution en dessous de l'usage actuel (ex: 12 véhicules → impossible de descendre à 10)
- ❌ Pas de nouvelle page admin — la config est dans `site-config.js`

---

## Estimation

| Tâche | Complexité | Temps |
|-------|-----------|-------|
| `quota.js` | Trivial | 5 min |
| `quota.action.js` | Simple | 15 min |
| `quantity-selector.jsx` | Moyen | 30 min |
| Modifier `manage-plan.jsx` | Moyen | 20 min |
| Modifier `plan-card.jsx` (checkout initial) | Simple | 15 min |
| `site-config.js` | Trivial | 2 min |
| Traductions | Simple | 15 min |
| **Total** | | **~1h30 avec Ada** |
