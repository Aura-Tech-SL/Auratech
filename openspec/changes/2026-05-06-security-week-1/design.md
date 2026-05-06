## Decisions tècniques i justificació

### 1. Rate limiter — BBDD en lloc de Redis

L'audit recomanava Redis. El projecte avui no té Redis i posar-lo implica:

- Un servei nou al `docker-compose.yml`.
- Un client Redis al runtime Node.
- Una capa més per fallar.

Per al volum actual (1 instància backend, ~poques desenes de logins/dia esperats),
l'overhead és injustificat. La taula `RateLimit` a Postgres té latències de ~1-2 ms per
crida amb un únic índex sobre `key`. Compatible amb múltiples instàncies si en algun
moment escalem horitzontalment.

Trade-off: Postgres ha de gestionar les escriptures. Per evitar cremar storage, una
neteja amb `cleanup-rate-limit.ts` (cron diari, futur) elimina entrades expirades amb
`resetAt < now() - 1 day`.

Quan superem ~10 logins/segon de pic sostingut, migrar a Redis. Avui no.

### 2. IDOR enforcement com a guard de servei, no middleware

Els 3 endpoints afectats (`projects/[id]`, `media/[id]`, `missatges`) tenen lògica
diferent (un compara `userId`, un altre `uploadedById`, l'altre `senderId|receiverId`).
Un middleware genèric tipus "verify ownership" requereix conèixer la columna a
comparar per cada model. La complexitat compensa quan tens 10+ endpoints amb el
mateix patró; aquí en tenim 3.

Decisió: fer els checks **inline** a cada handler, amb un helper compartit:

```ts
// src/lib/authz.ts
export const ADMIN_ROLES = ["SUPERADMIN", "ADMIN"] as const;
export function isAdmin(role: string | undefined) {
  return !!role && ADMIN_ROLES.includes(role as never);
}
export function ownsResource(
  resourceOwnerId: string | null,
  session: { user: { id: string; role: string } } | null,
) {
  if (!session) return false;
  if (isAdmin(session.user.role)) return true;
  return resourceOwnerId === session.user.id;
}
```

Aquesta utilitat és prou abstracta per a usar-la a tots els endpoints sense forçar
una abstracció prematura.

### 3. Magic-byte validation: `file-type` package

`file-type` (https://www.npmjs.com/package/file-type) detecta format real llegint els
primers bytes (magic numbers). Funciona amb totes les imatges/PDFs/vídeos de la
nostra whitelist. Versió ≥ 19 és ESM-only — funciona bé amb Next 14.

L'attack vector que tanquem: un atacant penja `shell.php` amb `Content-Type:
image/jpeg`. Sense magic bytes, només mirem `file.type` (controlat pel client). Amb
magic bytes, llegim els primers 4 KB i veiem que no comencen amb `FF D8 FF` (JPEG
SOI) — rebutgem.

### 4. SVG: fora de la whitelist

SVG és XML. Pot contenir `<script>` que s'executa quan el navegador renderitza el
fitxer com a imatge inline. La nostra app no necessita SVG-as-uploaded (els SVG del
disseny van al codi com a components React). Treiem `image/svg+xml` de la whitelist
per defecte.

Si en algun moment cal acceptar SVG (ex: un client penja un logo), afegim un pas de
sanitització amb DOMPurify (com fem ja al `rich-text-block`) i una nova whitelist
`ALLOWED_MIMES_WITH_SVG`.

### 5. `/api/projectes` vs `/api/projects` — neteja vs preservació

L'auditoria va trobar dos endpoints quasi idèntics. Abans d'afegir validació al
duplicat, hem de saber si s'usa.

- Si **no s'usa** al frontend (`grep -r "/api/projectes"` → cap match al `src/`),
  eliminem `src/app/api/projectes/`. Estalvia 80 línies i una superfície d'atac.
- Si **s'usa**, aplicar Zod i marcar com a deprecated amb un comentari + plan
  d'eliminació al següent canvi.

La tasca 5.2 fa el grep abans de decidir.

### 6. `notes` a `ContactSubmission` — no fa servir `Block` ni Markdown

`ContactSubmission.notes` és un camp `String? @db.Text` simple. Sense markdown
parser, sense rich text. És una nota interna per Sandra/Oscar (max 5000 chars,
text pla amb salts de línia preservats al render).

Justificació: introduir markdown rendering aquí afegeix DOMPurify + un parser
(remark/marked). Per a 1-2 línies de "Trucat el 7-maig, queda pendent enviar
proposta", text pla és suficient. Si en algun moment la nota necessita format,
migrem a markdown amb sanitització.

### 7. Disclaimer cleanup containers

`auratech-frontend-1` (Lovable SPA) i `auratech-prerender-1` (servei de pre-render
SEO) van quedar orfes a la consolidació del 2026-05-06 quan Nginx va passar a
apuntar tot a `backend:3000`. No reben tràfic des de fa 5 setmanes.

Decisió: `stop` + `rm` però NO eliminar les seccions del `docker-compose.yml`. Les
deixem **comentades amb un capçalera** per a:
1. Documentar la decisió i la data.
2. Fer reversible l'operació si descobríssim que algú confiava en aquests serveis
   (improbable, però el cost de mantenir 5 línies de YAML comentat és nul).

Eliminem el `Dockerfile.frontend` del servidor en un commit posterior, quan ens en
hàgim oblidat (proper change).

### 8. `.env` removal — gestió de secrets a producció

Avui `.env` està commitat amb `NEXTAUTH_SECRET="dev-secret-key-not-for-production-
use"`. Per definició, aquest secret no s'ha de fer servir mai a producció. Però
calc verificar que `/opt/auratech/.env` (al servidor) en té un altre.

Si producció en té un altre — bé, només cal `git rm --cached` i pujar al `.gitignore`.

Si producció en té el mateix — calt rotar-lo. La rotació invalida totes les sessions
actives via `NextAuth.js JWT` (els tokens existents van signats amb el secret antic
i no validaran). Tots els usuaris loguejats hauran de tornar a entrar. **Acceptable
durant la migració** perquè:

1. Estem en stage molt early (~3 usuaris loguejats: Oscar, Sandra, i tu si proves).
2. La rotació és una bona pràctica de seguretat periòdica.
3. Reemplaçar `client123` (el password seed antic d'Oscar) ja va invalidar la
   integritat del seed.

Procés:
1. SSH al servidor: `cat /opt/auratech/.env | grep NEXTAUTH_SECRET`.
2. Si és el de dev: `openssl rand -base64 32` per al nou.
3. `sed -i 's|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET="<new-secret>"|' /opt/auratech/.env`.
4. `docker compose up -d backend` (re-llegeix env).
5. `git rm --cached .env` al repo local + commit + push.

### 9. Per què cada tasca fa un commit separat

L'usuari ha demanat "a poc a poc, amb precisió". Granularity de commits ajuda a:

1. **Revertir** una sola tasca si trenca alguna cosa, sense desfer la resta.
2. **Revisar** el diff de cada decisió en isolament.
3. **Documentar** el raonament (commit message del tipus
   `fix(security): IDOR check on /api/projects/[id]` amb un cos explicant per què).

Penalti: més commits al log però el log existent ja segueix aquesta convenció amb
`fix(...):` i `feat(...):`. No és cost addicional.

Per facilitat operativa, **deploy a producció en una tirada al final** (no per
cada commit). Cada `docker compose build backend` són ~30-60 s.

## Risc i mitigacions

| Risc | Probabilitat | Mitigació |
|---|---|---|
| Rate limit massa agressiu bloqueja Sandra/Oscar | Baixa | 5 fallits / 15 min és generós; en cas extrem, manual unblock via `DELETE FROM RateLimit WHERE key LIKE 'login:%'` |
| Magic-byte check rebutja imatges legítimes | Baixa-Mitjana | Logs detallats al backend; whitelist conservadora; manual override possible |
| Rotació `NEXTAUTH_SECRET` invalida sessions | Mitjana | Comunicar a Sandra/Oscar abans; fer-ho fora d'horari; els usuaris només han de fer login de nou |
| Eliminar containers obsolets trenca alguna cosa | Molt baixa | Nginx no els hi envia tràfic des de fa 5 setmanes; verificat amb `nginx -T` |
| `notes` text pla és insuficient | Baixa | Migració trivial a markdown amb DOMPurify si calgués |
| `/api/projectes` legacy s'usa enlloc | Mitjana | El grep de tasca 5.2 ho determinarà abans de qualsevol canvi |
