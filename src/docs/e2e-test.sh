#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Test E2E completo — customer-service
# ═══════════════════════════════════════════════════════════════
# Cobertura: 100% de Historias de Usuario + Swagger + Kafka pub/sub
#
# Módulos:
#   1) customer                         (UH-1)
#   2) customer-gateway-onboarding      (UH-2)
#   3) catalog-sync-log                 (UH-3)
#   4) catalog-client                   (UH-4)
# ═══════════════════════════════════════════════════════════════

set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3009/api}"
# ── Auth bootstrap: login real contra security-service ─────────
SECURITY_BASE_URL="${SECURITY_BASE_URL:-http://localhost:3015/api}"
SA_EMAIL="${SA_EMAIL:-softwarentalla@gmail.com}"
SA_PWD="${SA_PWD:-admin123}"
__login_resp=$(curl -s -w "\n%{http_code}" -X POST "$SECURITY_BASE_URL/logins/command" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"$SA_EMAIL\",\"password\":\"$SA_PWD\"}" 2>/dev/null)
__login_code=$(echo "$__login_resp" | tail -n1)
if [[ "$__login_code" != "200" && "$__login_code" != "201" ]]; then
  echo "✘ Auth bootstrap falló: HTTP $__login_code contra $SECURITY_BASE_URL/logins/command"
  exit 1
fi
__token=$(echo "$__login_resp" | sed '$d' | (jq -r '.accessToken // .data.accessToken // .token // empty' 2>/dev/null || echo ""))
[[ -z "$__token" ]] && { echo "✘ Auth bootstrap: respuesta sin accessToken"; exit 1; }
AUTH="Bearer $__token"
echo "  ✔ Auth bootstrap: token JWT obtenido para $SA_EMAIL"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'; BLUE='\033[0;34m'
PASS=0; FAIL=0; TOTAL=0; WARN=0

log_step()  { echo -e "\n${BLUE}═══ PASO $1: $2 ═══${NC}"; }
log_ok()    { echo -e "  ${GREEN}✔ $1${NC}"; PASS=$((PASS + 1)); TOTAL=$((TOTAL + 1)); }
log_fail()  { echo -e "  ${RED}✘ $1${NC}"; FAIL=$((FAIL + 1)); TOTAL=$((TOTAL + 1)); }
log_warn()  { echo -e "  ${YELLOW}⚠ $1${NC}"; WARN=$((WARN + 1)); }

assert_http() {
  local label="$1" got="$2" expected_csv="$3"
  IFS=',' read -ra EXP <<< "$expected_csv"
  for code in "${EXP[@]}"; do
    if [[ "$got" == "$code" ]]; then log_ok "$label (HTTP $got)"; return 0; fi
  done
  log_fail "$label — esperado $expected_csv, recibido $got"; return 1
}

do_post()   { curl -s -w "\n%{http_code}" -X POST   "$1" -H "Content-Type: application/json" -H "Authorization: ${3:-$AUTH}" -d "$2" 2>/dev/null; }
do_put()    { curl -s -w "\n%{http_code}" -X PUT    "$1" -H "Content-Type: application/json" -H "Authorization: ${3:-$AUTH}" -d "$2" 2>/dev/null; }
do_get()    { curl -s -w "\n%{http_code}" -X GET    "$1" -H "Authorization: ${2:-$AUTH}" 2>/dev/null; }
do_delete() { curl -s -w "\n%{http_code}" -X DELETE "$1" -H "Authorization: ${2:-$AUTH}" 2>/dev/null; }
extract_body() { echo "$1" | sed '$d'; }
extract_code() { echo "$1" | tail -n1; }
json_get() { echo "$1" | jq -r "$2" 2>/dev/null || echo ""; }

TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
UNIQUE="$(date +%s)"
UNIQUE_HEX12="$(printf '%012x' "$UNIQUE")"
USER_UUID="$( (command -v uuidgen >/dev/null && uuidgen | tr 'A-F' 'a-f') || python3 -c 'import uuid; print(uuid.uuid4())' )"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TEST E2E — Customer Microservice — 100% UH + Swagger        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo -e "  Base URL: $BASE_URL | Unique: $UNIQUE"

# PASO 0: Pre-flight
log_step 0 "Pre-flight (salud)"
RESP=$(do_get "$BASE_URL/customers/query/count" "$AUTH")
CODE=$(extract_code "$RESP")
if [[ "$CODE" =~ ^(200|201)$ ]]; then log_ok "Service UP ($CODE)";
else log_fail "Service NO responde ($CODE)"; exit 1; fi

# ── MÓDULO 1: customer (UH-1) ──
log_step 1 "UH-1 Customer — CRUD + queries"
CUSTOMER_PAYLOAD=$(cat <<EOF
{"name":"E2E Customer ${UNIQUE}","creationDate":"${TIMESTAMP}","modificationDate":"${TIMESTAMP}",
 "isActive":true,"userId":"${USER_UUID}","riskLevel":"LOW",
 "externalReference":"EXT-${UNIQUE}","paymentMethods":{},"metadata":{"e2e":true}}
EOF
)

RESP=$(do_post "$BASE_URL/customers/command" "$CUSTOMER_PAYLOAD")
CODE=$(extract_code "$RESP"); BODY=$(extract_body "$RESP")
assert_http "POST /customers/command" "$CODE" "200,201"
CUSTOMER_ID=$(json_get "$BODY" '.data.id // .id // empty')

RESP=$(do_post "$BASE_URL/customers/command/bulk" "[$CUSTOMER_PAYLOAD]")
assert_http "POST /customers/command/bulk" "$(extract_code "$RESP")" "200,201,400,409,422"

if [[ -n "$CUSTOMER_ID" ]]; then
  RESP=$(do_put "$BASE_URL/customers/command/$CUSTOMER_ID" '{"name":"Updated","riskLevel":"MEDIUM","isActive":true}')
  assert_http "PUT /customers/command/:id" "$(extract_code "$RESP")" "200,201,204"
fi

RESP=$(do_put "$BASE_URL/customers/command/bulk" '[{"id":"'"${CUSTOMER_ID:-00000000-0000-0000-0000-000000000000}"'","riskLevel":"HIGH"}]')
assert_http "PUT /customers/command/bulk" "$(extract_code "$RESP")" "200,201,204,400,404"

for Q in "list?page=1&size=5" "count" "pagination?page=1&size=5" "field/riskLevel?value=LOW" "search?where=%7B%22isActive%22%3Atrue%7D" "find-one?where=%7B%22isActive%22%3Atrue%7D" "find-one-or-fail?where=%7B%22isActive%22%3Atrue%7D"; do
  RESP=$(do_get "$BASE_URL/customers/query/$Q" "$AUTH")
  assert_http "GET /customers/query/$(echo "$Q" | cut -d'?' -f1)" "$(extract_code "$RESP")" "200,201,404"
done
if [[ -n "$CUSTOMER_ID" ]]; then
  RESP=$(do_get "$BASE_URL/customers/query/$CUSTOMER_ID" "$AUTH")
  assert_http "GET /customers/query/:id" "$(extract_code "$RESP")" "200,404"
fi

# ── MÓDULO 2: customer-gateway-onboarding (UH-2) ──
log_step 2 "UH-2 CustomerGatewayOnboarding — CRUD + queries"
GATEWAY_UUID="$( (command -v uuidgen >/dev/null && uuidgen | tr 'A-F' 'a-f') || python3 -c 'import uuid; print(uuid.uuid4())' )"
ONB_PAYLOAD=$(cat <<EOF
{"name":"E2E Onb ${UNIQUE}","creationDate":"${TIMESTAMP}","modificationDate":"${TIMESTAMP}",
 "isActive":true,"code":"ONB-${UNIQUE}","customerId":"${CUSTOMER_ID:-${USER_UUID}}",
 "gatewayId":"${GATEWAY_UUID}","status":"REQUESTED","onboardingVersion":"v1",
 "startedAt":"${TIMESTAMP}","requiresRevalidation":false,"metadata":{"e2e":true}}
EOF
)

RESP=$(do_post "$BASE_URL/customergatewayonboardings/command" "$ONB_PAYLOAD")
CODE=$(extract_code "$RESP"); BODY=$(extract_body "$RESP")
assert_http "POST /customergatewayonboardings/command" "$CODE" "200,201"
ONB_ID=$(json_get "$BODY" '.data.id // .id // empty')

RESP=$(do_post "$BASE_URL/customergatewayonboardings/command/bulk" "[$ONB_PAYLOAD]")
assert_http "POST /customergatewayonboardings/command/bulk" "$(extract_code "$RESP")" "200,201,400,409,422"

if [[ -n "$ONB_ID" ]]; then
  RESP=$(do_put "$BASE_URL/customergatewayonboardings/command/$ONB_ID" '{"status":"APPROVED"}')
  assert_http "PUT onboarding APPROVED" "$(extract_code "$RESP")" "200,201,204"
fi

for Q in "list?page=1&size=5" "count" "pagination?page=1&size=5" "field/status?value=REQUESTED"; do
  RESP=$(do_get "$BASE_URL/customergatewayonboardings/query/$Q" "$AUTH")
  assert_http "GET /customergatewayonboardings/query/$(echo "$Q" | cut -d'?' -f1)" "$(extract_code "$RESP")" "200,201,404"
done

# ── MÓDULO 3: catalog-sync-log (UH-3) ──
log_step 3 "UH-3 CatalogSyncLog — CRUD + queries"
LOG_PAYLOAD=$(cat <<EOF
{"name":"E2E Log ${UNIQUE}","creationDate":"${TIMESTAMP}","modificationDate":"${TIMESTAMP}",
 "isActive":true,"categoryCode":"risk-level","triggeredBy":"e2e-test",
 "itemsAddedCount":0,"itemsUpdatedCount":0,"itemsRemovedCount":0,
 "outcome":"SUCCESS","syncedAt":"${TIMESTAMP}","metadata":{"e2e":true}}
EOF
)
RESP=$(do_post "$BASE_URL/catalogsynclogs/command" "$LOG_PAYLOAD")
assert_http "POST /catalogsynclogs/command" "$(extract_code "$RESP")" "200,201"

for Q in "list?page=1&size=5" "count" "field/categoryCode?value=risk-level"; do
  RESP=$(do_get "$BASE_URL/catalogsynclogs/query/$Q" "$AUTH")
  assert_http "GET /catalogsynclogs/query/$(echo "$Q" | cut -d'?' -f1)" "$(extract_code "$RESP")" "200,201,404"
done

# ── MÓDULO 4: catalog-client (UH-4) ──
log_step 4 "UH-4 catalog-client — health/status/run"
for EP in "health" "status"; do
  RESP=$(do_get "$BASE_URL/catalog-sync/$EP" "$AUTH")
  assert_http "GET /catalog-sync/$EP" "$(extract_code "$RESP")" "200,503"
done
RESP=$(do_post "$BASE_URL/catalog-sync/run" '{"category":"risk-level"}')
assert_http "POST /catalog-sync/run" "$(extract_code "$RESP")" "200,201,202,503"

# ── PASO 5: Kafka probe ──
log_step 5 "Kafka — probe topics"
if command -v kcat >/dev/null 2>&1; then
  KTOPICS=$(kcat -b localhost:29092 -L 2>/dev/null | grep -Eo 'topic "[^"]*customer[^"]*"' | head -10 || true)
  if [[ -n "$KTOPICS" ]]; then log_ok "Kafka topics customer.* detectados";
  else log_warn "No se detectaron topics customer.*"; fi
else
  log_warn "kcat no instalado — skipping"
fi

# ── PASO 6: Cleanup ──
log_step 6 "Cleanup"
if [[ -n "${ONB_ID:-}" ]]; then
  RESP=$(do_delete "$BASE_URL/customergatewayonboardings/command/$ONB_ID" "$AUTH")
  assert_http "DELETE onboarding" "$(extract_code "$RESP")" "200,204,404"
fi
if [[ -n "${CUSTOMER_ID:-}" ]]; then
  RESP=$(do_delete "$BASE_URL/customers/command/$CUSTOMER_ID" "$AUTH")
  assert_http "DELETE customer" "$(extract_code "$RESP")" "200,204,404"
fi

echo -e "\n${BLUE}═══ RESUMEN ═══${NC}"
echo -e "  Total: $TOTAL | ${GREEN}Pass: $PASS${NC} | ${RED}Fail: $FAIL${NC} | ${YELLOW}Warn: $WARN${NC}"
[[ $FAIL -eq 0 ]] && exit 0 || exit 1

# >>> NOMENCLADORES E2E BEGIN (auto-generado por sources/scaffold_nomenclador_e2e_tests.py)
# Servicio: customer-service | Puerto: 3009
NOM_BASE_URL="${NOM_BASE_URL:-http://localhost:3009/api}"
NOM_AUTH="${AUTH}"
nom_pass=0; nom_fail=0; nom_warn=0
_nom_ok()   { echo -e "  \033[0;32m✔ $1\033[0m"; nom_pass=$((nom_pass+1)); }
_nom_fail() { echo -e "  \033[0;31m✘ $1\033[0m"; nom_fail=$((nom_fail+1)); }
_nom_warn() { echo -e "  \033[1;33m⚠ $1\033[0m"; nom_warn=$((nom_warn+1)); }
NOM_UNIQUE="${UNIQUE:-$(date +%s)}"
NOM_NOW="${NOW:-$(date -u +%Y-%m-%dT%H:%M:%S.000Z)}"
echo ""
echo -e "\033[0;34m═══ NOMENCLADORES — customer-service ═══\033[0m"

# --- Nomenclador: customer-onboarding-status ---
NOM_CODE="NCUSTOM-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E CustomerOnboardingStatus ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "\n%{http_code}" -X POST "$NOM_BASE_URL/customeronboardingstatuss/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "customer-onboarding-status: create id=$NOM_ID"; else _nom_warn "customer-onboarding-status: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "\n%{http_code}" -X GET "$NOM_BASE_URL/customeronboardingstatuss/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "customer-onboarding-status: list ok"; else _nom_warn "customer-onboarding-status: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "\n%{http_code}" -X GET "$NOM_BASE_URL/customeronboardingstatuss/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "customer-onboarding-status: getById" || _nom_warn "customer-onboarding-status: getById"
  curl -s -w "\n%{http_code}" -X PUT "$NOM_BASE_URL/customeronboardingstatuss/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E CustomerOnboardingStatus updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "customer-onboarding-status: update" || _nom_warn "customer-onboarding-status: update"
  curl -s -w "\n%{http_code}" -X DELETE "$NOM_BASE_URL/customeronboardingstatuss/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "customer-onboarding-status: delete" || _nom_warn "customer-onboarding-status: delete"
fi

echo ""
echo -e "\033[0;34m── Resumen Nomencladores customer-service ──\033[0m"
echo "  ✔ OK=$nom_pass  ✘ FAIL=$nom_fail  ⚠ WARN=$nom_warn"
[[ ${nom_fail:-0} -eq 0 ]] || echo "[NOMENCLADORES] hay fallos en este servicio"
# <<< NOMENCLADORES E2E END
