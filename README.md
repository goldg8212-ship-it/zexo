# ZEXO — Minecraft Bedrock Marketplace

A responsive marketplace website for Minecraft Bedrock texture packs, add-ons and creator digital content. This repository is the **website**, not a launcher or Android app.

## Current implementation
- Responsive dark marketplace UI with desktop sidebar and mobile bottom navigation
- Home texture-pack collection and separate add-on catalog
- Search, category filters, version filter and sorting
- Account signup/signin API using PBKDF2 password hashing and hashed, HttpOnly session tokens
- Creator upload endpoint for .mcpack, .mcaddon and .zip files; submissions start in pending review
- D1 schema for users, sessions, published content, submissions, orders, coin ledger, screenshots and audit events
- Shop clearly marked unavailable until a payment provider is configured

The initial texture cards in the UI are presentation placeholders. Replace them with reviewed records in D1 before public launch.

## Cloudflare setup
1. Create a D1 database named `zexo-db`.
2. Apply `worker/schema.sql` using `wrangler d1 execute zexo-db --remote --file=worker/schema.sql`.
3. Create an R2 bucket named `zexo-files`.
4. Put the real D1 database ID in `wrangler.toml`.
5. Set `ALLOWED_ORIGIN` to the deployed site origin.
6. Configure a Cloudflare Pages/Workers deployment from this repository.
7. Set up a custom domain and HTTPS.
8. Set the first admin role manually in D1 only after verifying the account email: `UPDATE users SET role='admin' WHERE email='YOUR_VERIFIED_EMAIL';`.

## Local development
Install Node.js and Wrangler, then:
```sh
npm install
npx wrangler dev
```

## Important launch checklist
- Configure Turnstile and server-side rate limiting on auth and upload endpoints.
- Add email verification and password reset delivery before public signup.
- Add admin review APIs and a protected admin dashboard before accepting public submissions.
- Add signed/authorized download routes and malware/archive scanning before serving uploaded files.
- Configure a real payment provider and verified webhooks before enabling checkout or coin purchases. Never trust prices or balances from the browser.
- Configure backups, retention, abuse reporting and moderation policies.
- Review all Worker bindings and CORS settings before production.

Never commit secrets, API keys, payment credentials or user data to this repository.
