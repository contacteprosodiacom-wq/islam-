# Intégration SasPay

Documentation de l'intégration de l'API SasPay (`https://api.saspay.me/api/v1`) dans **Islam avec Aboubakar**.

## 1. Variables d'environnement serveur

À configurer dans les secrets / variables d'environnement du serveur (sans jamais les commiter) :

- `SASPAY_API_KEY` : `sk_test_...` en développement, `sk_live_...` en production (`Authorization: Bearer ...` côté serveur uniquement).
- `SASPAY_WEBHOOK_SECRET` : secret HMAC-SHA256 affiché une seule fois lors de la création du webhook sur `app.saspay.me`.
- `APP_URL` : URL publique exacte de l'application (`https://...`, sans `/` final), utilisée pour `return_url` et l'affichage de l'URL webhook (`/api/saspay/webhook`).

## 2. Routes serveur implémentées

- `GET /api/saspay/status` : état de configuration non sensible (`configured`, `mode`, `webhookConfigured`, `webhookUrl`).
- `GET /api/saspay/reference` : pays actifs (`GET /countries/`), tarifs & prérequis OTP (`GET /pricing/my-rates/`), réseaux (`GET /networks/`), taux (`GET /exchange-rates/`).
- `POST /api/saspay/orders/softpay` : paiement direct (`POST /payments/softpay/` avec `Idempotency-Key` persisté par intention).
- `POST /api/saspay/orders/checkout` : session hébergée (`POST /checkout-sessions/` avec `return_url`).
- `POST /api/saspay/payments/:paymentId/confirm-otp` : confirmation OTP post-push (`POST /payments/{payment_id}/confirm-otp/`).
- `POST /api/saspay/payments/:paymentId/retry` : relance idempotente (`POST /payments/{payment_id}/retry/` avec `Idempotency-Key`).
- `GET /api/saspay/orders/:orderId/verify` : vérification active autoritaire (`GET /payments/{payment_id}/verify/` ou `GET /checkout-sessions/{id}/status/`).
- `POST /api/saspay/checkout-sessions/:sessionId/cancel` : annulation (`POST /checkout-sessions/{id}/cancel/`).
- `POST /api/saspay/orders/:orderId/deliver` : livraison unique côté base (`.saspay-data/store.json`) débloquée **uniquement** sur statut `SUCCESS`.
- `POST /api/saspay/webhook` : vérification `X-Webhook-Timestamp` (écart <= 300s) et `X-Webhook-Signature` (HMAC-SHA256 sur le corps brut reçu avec `crypto.timingSafeEqual`), réponse rapide 2xx et traitement idempotent en arrière-plan.
- `GET /api/saspay/admin/overview`, `POST /api/saspay/admin/payouts/initialize`, `GET /api/saspay/admin/payouts/:payoutId/verify`, `POST /api/saspay/admin/wallet-transfers` : protégés par vérification serveur du jeton Firebase Auth Administrateur.

## 3. Commande de vérification de configuration

```bash
npm run verify:saspay
```

## 4. État des tests

- **Vérifié** : `GET https://api.saspay.me/api/v1/countries/` (200 OK), formatage décimal strict, validation signature webhook HMAC-SHA256 sur corps brut + rejet > 300s, compilation TypeScript & build production Vite.
- **Non vérifié (requiert `SASPAY_API_KEY` `sk_test_...` et `SASPAY_WEBHOOK_SECRET` configurés dans les secrets)** : appel authentifié `GET /pricing/my-rates/`, paiement Softpay / Checkout de test jusqu'à `SUCCESS`, et réception réelle de l'événement `webhook.test` depuis `app.saspay.me`.
