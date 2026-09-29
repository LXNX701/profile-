# MOONX7 Profile

Perfil público de Free Fire con frontend + API propia, caché y soporte multi-región.

## Regiones
BR, SAC, US, NA, LATAM, IND, BD, PK, ID, SG, TH, VN, TW, ME, RU, CIS, EU, EUROPE y MY.

## Endpoints
- GET /api/health
- GET /api/regions
- GET /api/profile?uid=UID&region=BR
- GET /api/account?uid=UID&region=BR
- GET /api/playerstats?uid=UID&region=BR
- GET /api/guild?guildID=ID&region=BR

## Deploy
1. Node.js 20+
2. npm install
3. npm start

Variables opcionales:
- PORT
- FF_UPSTREAM
- CACHE_TTL_MS

La capa de proveedor está separada para poder sustituir el upstream por una fuente propia cuando esté disponible.
