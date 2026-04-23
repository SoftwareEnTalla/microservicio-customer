# Customer Microservice — Documentación Completa

> **Versión**: 0.0.1
> **Puerto**: 3009
> **Base URL**: `http://localhost:3009/api`
> **Swagger UI**: `http://localhost:3009/api-docs` (user: `admin`, pass: `admin123`)

---

## Tabla de Contenidos

1. [Historia de Usuario](#1-historia-de-usuario)
2. [Modelo DSL](#2-modelo-dsl)
3. [Arquitectura](#3-arquitectura)
4. [Módulos del Microservicio](#4-módulos-del-microservicio)
5. [Eventos Publicados](#5-eventos-publicados)
6. [Eventos Consumidos](#6-eventos-consumidos)
7. [API REST — Guía Completa Swagger](#7-api-rest--guía-completa-swagger)
8. [Guía para Desarrolladores](#8-guía-para-desarrolladores)
9. [Test E2E con curl](#9-test-e2e-con-curl)
10. [Análisis de Sagas y Eventos (E2E)](#10-análisis-de-sagas-y-eventos-e2e)

---

## 1. Historia de Usuario

### Bounded Context: Customer

El microservicio **customer** es dueño del **perfil comercial del cliente**: nivel de riesgo, referencias externas, métodos de pago aceptados y el ciclo de onboarding por pasarela. Referencia (no duplica) a `user` del bounded context security.

### Historias de Usuario Implementadas

| ID | Título | Módulo(s) |
|----|--------|-----------|
| UH-1 | Gestión del perfil Customer (riesgo, referencia externa, métodos de pago) | customer |
| UH-2 | Onboarding de cliente por pasarela de pago con ciclo REQUEST→APPROVE/REJECT/EXPIRE | customer-gateway-onboarding |
| UH-3 | Trazabilidad de sincronizaciones con catalog-service | catalog-sync-log |
| UH-4 | Integración con catalog-service (nomencladores CURRENCY, APPROVAL_STATUS, ...) | catalog-client |

### UH-2 — Customer Gateway Onboarding

**Como** cliente, **quiero** completar el onboarding con la pasarela seleccionada **para** que un merchant pueda cobrarme. El estado avanza `NOT_STARTED → IN_PROGRESS → APPROVED | REJECTED | EXPIRED | BLOCKED`. Cada transición emite un evento de dominio (`started`, `approved`, `rejected`, `expired`) que consumen payment-service y otros.

---

## 2. Modelo DSL

Los modelos están en `models/customer/`.

| Modelo XML | Versión | AggregateRoot | ModuleType | Descripción |
|------------|---------|:---:|---|---|
| `customer.xml` | 1.1.0 | ✓ | aggregate-root (extends user) | Perfil comercial del cliente |
| `customer-gateway-onboarding.xml` | 1.0.0 | ✗ | entity | Onboarding por pasarela |
| `catalog-sync-log.xml` | 1.0.0 | ✗ | entity | Trazabilidad de sync con catalog |

### Estructura de un modelo DSL

```xml
<domain-model name="customer" schemaVersion="2.0" version="1.1.0"
              boundedContext="customer" aggregateRoot="true" moduleType="aggregate-root"
              extends="user">
  <fields>
    <field name="userId" type="uuid" unique="true"/>
    <field name="riskLevel" type="enum" values="LOW,MEDIUM,HIGH" defaultValue="LOW"/>
    <field name="externalReference" type="string"/>
    <field name="paymentMethods" type="json"/>
  </fields>
  <domain-events>
    <event name="customer-created" version="1.0.0" maxRetries="3" replayable="true"/>
    <event name="customer-updated" version="1.0.0" maxRetries="3" replayable="true"/>
  </domain-events>
</domain-model>
```

---

## 3. Arquitectura

### 3.1 Patrones

| Patrón | Descripción |
|--------|-------------|
| **CQRS** | Command/query separados en controllers, services, repos, handlers. |
| **Event Sourcing** | Eventos inmutables persistidos en EventStore + Kafka. |
| **Event-Driven** | Onboarding cross-service con payment-service. |
| **Saga Pattern** | `CustomerGatewayOnboardingCrudSaga` orquesta 7 transiciones de estado. |
| **DDD** | Aggregates *Customer*, *CustomerGatewayOnboarding*. |
| **Hexagonal** | Controllers → services → repositories → adapters Kafka. |
| **Catalog-fallback** | CatalogClientService con breaker + cache stale para nomencladores. |

### 3.2 Arquitectura

```
┌────────────────────────────────────────────────────────────┐
│              CUSTOMER MICROSERVICE  (3009)                 │
├────────────────────────────────────────────────────────────┤
│  REST Command / REST Query / GraphQL                       │
│          │               │              │                  │
│  CommandBus            QueryBus     Resolvers              │
│          │               │                                 │
│  CommandService        QueryService                        │
│          │               │                                 │
│  CommandRepository  QueryRepository                        │
│          │                                                 │
│      PostgreSQL (customer-service DB · TypeORM)            │
│                                                            │
│  KafkaEventPublisher ─ EventStore ─ KafkaEventSubscriber   │
│                        │                                   │
│                  CatalogClient (breaker + cache)           │
└────────────────────────────────────────────────────────────┘
```

### 3.3 Estructura de Carpetas por Módulo

```
src/modules/<module>/
├── commands/ controllers/ decorators/ dtos/ entities/
├── events/ (base.event, <entity>*.event, event-registry.ts, exporting.event.ts)
├── graphql/ guards/ interceptors/ modules/ queries/
├── repositories/ sagas/ services/ shared/ types/
```

---

## 4. Módulos del Microservicio

### 4.1 Customer
- **Entidad**: `Customer` (extends User) — `userId` (unique), `riskLevel` (LOW/MEDIUM/HIGH), `externalReference`, `paymentMethods` (json), `metadata` (json).

### 4.2 CustomerGatewayOnboarding
- **Entidad**: `CustomerGatewayOnboarding` — `code` (unique), `customerId`, `gatewayId`, `status` (NOT_STARTED|IN_PROGRESS|APPROVED|REJECTED|EXPIRED|BLOCKED), `onboardingVersion`, `startedAt`, `completedAt`, `rejectedAt`, `expiresAt`, `rejectionReason`, `requiresRevalidation`, `externalSessionReference`, `metadata`.

### 4.3 CatalogSyncLog
- **Entidad**: `CatalogSyncLog` — `categoryCode`, `triggeredBy` (BOOTSTRAP/SCHEDULED/KAFKA_EVENT/MANUAL), `itemsAddedCount`, `itemsUpdatedCount`, `itemsRemovedCount`, `diffSnapshot` (json), `outcome` (SUCCESS/PARTIAL/SKIPPED_UP_TO_DATE/SKIPPED_CATALOG_DOWN/ERROR), `durationMs`, `syncedAt`.

### 4.4 CatalogClient
- **Servicios**: `CatalogClientService` (HTTP fetch + AbortController + breaker + cache TTL 5 min), `CatalogSyncService` (bootstrap 3 s + schedule 15 min), `CatalogKafkaConsumer` (topics `catalog.catalog-item-upserted|deprecated`), `CatalogSyncController` (health/status/run).

---

## 5. Eventos Publicados

| Módulo | Evento | Tópico Kafka | Versión | Replayable |
|--------|--------|--------------|---------|:---:|
| customer | `CustomerCreatedEvent` | `customer-created` | 1.0.0 | ✓ |
| customer | `CustomerUpdatedEvent` | `customer-updated` | 1.0.0 | ✓ |
| customer | `CustomerDeletedEvent` | `customer-deleted` | 1.0.0 | ✓ |
| customer-gateway-onboarding | `CustomerGatewayOnboardingCreatedEvent` | `customer-gateway-onboarding-created` | 1.0.0 | ✓ |
| customer-gateway-onboarding | `CustomerGatewayOnboardingUpdatedEvent` | `customer-gateway-onboarding-updated` | 1.0.0 | ✓ |
| customer-gateway-onboarding | `CustomerGatewayOnboardingDeletedEvent` | `customer-gateway-onboarding-deleted` | 1.0.0 | ✓ |
| customer-gateway-onboarding | `CustomerGatewayOnboardingStartedEvent` | `customer-gateway-onboarding-started` | 1.0.0 | ✓ |
| customer-gateway-onboarding | `CustomerGatewayOnboardingApprovedEvent` | `customer-gateway-onboarding-approved` | 1.0.0 | ✓ |
| customer-gateway-onboarding | `CustomerGatewayOnboardingRejectedEvent` | `customer-gateway-onboarding-rejected` | 1.0.0 | ✓ |
| customer-gateway-onboarding | `CustomerGatewayOnboardingExpiredEvent` | `customer-gateway-onboarding-expired` | 1.0.0 | ✓ |
| catalog-sync-log | `CatalogSyncLogCreatedEvent` | `catalog-sync-log-created` | 1.0.0 | ✓ |
| catalog-sync-log | `CatalogSyncLogUpdatedEvent` | `catalog-sync-log-updated` | 1.0.0 | ✓ |
| catalog-sync-log | `CatalogSyncLogDeletedEvent` | `catalog-sync-log-deleted` | 1.0.0 | ✓ |

Cada topic genera `<topic>-retry` y `<topic>-dlq`.

### Estructura de un evento publicado

```json
{
  "aggregateId": "uuid",
  "timestamp": "2026-04-21T10:00:00.000Z",
  "payload": {
    "instance": { /* Customer / CustomerGatewayOnboarding */ },
    "metadata": {
      "initiatedBy": "user-id",
      "correlationId": "uuid",
      "eventName": "CustomerGatewayOnboardingApprovedEvent",
      "eventVersion": "1.0.0",
      "sourceService": "customer-service",
      "retryCount": 0,
      "idempotencyKey": "uuid"
    }
  }
}
```

---

## 6. Eventos Consumidos

| Módulo | Evento | Origen | Acción |
|--------|--------|--------|--------|
| catalog-client | `catalog.catalog-item-upserted` | catalog-service | Invalida caché + `syncCategory(KAFKA_EVENT)` |
| catalog-client | `catalog.catalog-item-deprecated` | catalog-service | Invalida caché + `syncCategory(KAFKA_EVENT)` |
| * (sagas CRUD) | `Customer*Event`, `CustomerGatewayOnboarding*Event` | self (EventBus local) | Hook post-CRUD |

`KAFKA_TRUSTED_PRODUCERS` filtra productores confiables; `EventIdempotencyService` deduplica con TTL `KAFKA_IDEMPOTENCY_TTL_MS`.

---

## 7. API REST — Guía Completa Swagger

### 7.1 Command CRUD

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| POST | `/api/<entities>/command` | `CreateXxxDto` | Crear |
| POST | `/api/<entities>/command/bulk` | `CreateXxxDto[]` | Crear múltiples |
| PUT | `/api/<entities>/command/:id` | `UpdateXxxDto` | Actualizar |
| DELETE | `/api/<entities>/command/:id` | — | Eliminar |

### 7.2 Query CRUD

| Método | Ruta | Query Params |
|--------|------|--------------|
| GET | `/api/<entities>/query/list` | `page, size, sort, order, search, initDate, endDate` |
| GET | `/api/<entities>/query/:id` | — |
| GET | `/api/<entities>/query/field/:field` | `value, page, size` |
| GET | `/api/<entities>/query/pagination` | `page, size, sort, order` |

### 7.3 Endpoints especiales de CatalogClient

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/catalog-sync/health` | Probe del cliente catalog |
| GET | `/api/catalog-sync/status` | Estado + breaker + lastSync |
| POST | `/api/catalog-sync/run?categoryCode=CURRENCY&reason=MANUAL` | Disparar sync manual |

### 7.4 Prefijos por módulo

| Módulo | Prefijo Command | Prefijo Query | Auth |
|--------|-----------------|---------------|:---:|
| customer | `/api/customers/command` | `/api/customers/query` | Bearer |
| customer-gateway-onboarding | `/api/customergatewayonboardings/command` | `/api/customergatewayonboardings/query` | Bearer |
| catalog-sync-log | `/api/catalogsynclogs/command` | `/api/catalogsynclogs/query` | Bearer |
| catalog-client | `/api/catalog-sync` | — | — |

### 7.5 DTOs principales

```json
// CreateCustomerDto
{ "userId":"UUID", "riskLevel":"LOW", "externalReference":"CRM-123",
  "paymentMethods":["CARD","WALLET"], "metadata":{} }

// CreateCustomerGatewayOnboardingDto
{ "code":"ONB-001", "customerId":"UUID", "gatewayId":"UUID",
  "status":"NOT_STARTED", "onboardingVersion":"1.0",
  "expiresAt":"2026-05-01T00:00:00Z" }
```

---

## 8. Guía para Desarrolladores

### 8.1 Crear un Evento

```typescript
export class CustomerGatewayOnboardingApprovedEvent extends BaseEvent {
  constructor(public readonly aggregateId: string, public readonly payload: PayloadEvent<CustomerGatewayOnboarding>) { super(aggregateId); }
  static create(id: string, instance: CustomerGatewayOnboarding, userId: string, correlationId = uuidv4()) {
    return new CustomerGatewayOnboardingApprovedEvent(id, { instance, metadata: { initiatedBy: userId, correlationId } });
  }
}
```

Registrar en `event-registry.ts`:
```typescript
'customer-gateway-onboarding-approved': createEventDefinition(
  'customer-gateway-onboarding-approved', CustomerGatewayOnboardingApprovedEvent,
  { version:'1.0.0', maxRetries:3, replayable:true }),
```

Publicar (dual publish — requerido para sagas @Saga()):
```typescript
this.eventBus.publish(event as any);         // EventBus local → sagas
await this.eventPublisher.publish(event);    // Kafka → cross-service
```

### 8.2 Crear una Saga

```typescript
@Injectable()
export class CustomerGatewayOnboardingCrudSaga {
  @Saga()
  onApproved = ($e: Observable<CustomerGatewayOnboardingApprovedEvent>) => $e.pipe(
    ofType(CustomerGatewayOnboardingApprovedEvent),
    tap(e => this.logger.log(`Onboarding approved ${e.aggregateId}`)),
    map(() => null),
  );
}
```

---

## 9. Test E2E con curl

```bash
cd customer-service && env LOG_API_AUTH_TOKEN=valid-token node dist/main.js
bash customer-service/src/docs/e2e-test.sh
```

Cobertura objetivo 100% UH + Swagger + Kafka:

| Paso | Descripción | Cobertura |
|------|-------------|-----------|
| 0 | Pre-flight health + DB baseline | Infra |
| 1 | Crear customer (dispara `customer-created`) | `customer` |
| 2 | Update customer → `customer-updated` | `customer` |
| 3 | Query list + field + pagination | `customer` |
| 4 | Crear onboarding → `customer-gateway-onboarding-created` | `customer-gateway-onboarding` |
| 5 | Update status → `started` → `customer-gateway-onboarding-started` | Kafka produce |
| 6 | Approve → `customer-gateway-onboarding-approved` | Kafka produce |
| 7 | Reject (caso negativo) → `customer-gateway-onboarding-rejected` | Kafka produce |
| 8 | Expired → `customer-gateway-onboarding-expired` | Kafka produce |
| 9 | Catalog-sync health + status + run manual | `catalog-client` |
| 10 | GET catalog-sync-log → fila nueva | `catalog-sync-log` |
| 11 | `kcat -L` verifica topics `customer-gateway-onboarding-*` | Kafka probe |
| 12 | Limpieza | Todos |

Requisitos: customer-service ↑, PostgreSQL, `curl` + `jq`; `kcat` opcional. catalog-service en `:3001` opcional (con WARN si no).

---

## 10. Análisis de Sagas y Eventos (E2E)

### 10.1 Inventario de sagas

| Módulo | Saga | Handlers |
|--------|------|----------|
| customer | `CustomerCrudSaga` | onCreated, onUpdated, onDeleted |
| customer-gateway-onboarding | `CustomerGatewayOnboardingCrudSaga` | 7 handlers (Created/Updated/Deleted/Started/Approved/Rejected/Expired) |
| catalog-sync-log | `CatalogSyncLogCrudSaga` | onCreated, onUpdated, onDeleted |

### 10.2 Totales

- **Eventos registrados**: 13 (6 CRUD + 4 estado onboarding + 3 sync-log)
- **Topics Kafka**: 13 main + 13 retry + 13 DLQ = **39**

### 10.3 Dual publish

Las sagas CRUD requieren que el servicio publique al `EventBus` local **además** del `KafkaEventPublisher`. Si la saga no reacciona a un evento CRUD, revisar que el servicio use dual publish.

---

## 11. Variables de Entorno

| Variable | Uso | Default |
|----------|-----|---------|
| `APP_NAME` / `STAGE` / `PORT` | Metadata + puerto (3009) | required |
| `DB_HOST/PORT/USERNAME/PASSWORD/NAME` | PostgreSQL (customer-service) | required |
| `JWT_SECRET` / `API_KEY` / `SA_EMAIL` / `SA_PWD` | Auth | required |
| `KAFKA_ENABLED` / `KAFKA_BROKERS` / `KAFKA_CLIENT_ID` / `KAFKA_GROUP_ID` | Kafka | true / kafka:9092 / nestjs-client / nestjs-group |
| `KAFKA_IDEMPOTENCY_TTL_MS` | Idempotencia | 86400000 |
| `EVENT_SOURCING_ENABLED` / `EVENT_STORE_ENABLED` | Event sourcing | true / false |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_TTL` | Redis cache | required |
| `CATALOG_BASE_URL` | Endpoint catalog | http://localhost:3001 |
| `CATALOG_SYNC_INTERVAL_MS` | Intervalo sync (15 min) | 900000 |
| `CATALOG_REQUEST_TIMEOUT_MS` | Timeout HTTP | 500 |
| `CATALOG_BREAKER_ERROR_THRESHOLD` / `CATALOG_BREAKER_RESET_MS` | Breaker | 3 / 30000 |
| `SWAGGER_USER` / `SWAGGER_PWD` | Swagger basic auth | admin/admin123 |
| `MAIL_*`, `CLD_*` | Mail/Cloudinary (legacy) | required |
| `LOG_API_BASE_URL` / `LOG_EXECUTION_TIME` / `LOG_KAFKA_TOPIC` | Codetrace | — |

---

## 12. Build & Run

```bash
cd customer-service
npm install && npm run build
node dist/main.js
# o docker-compose up customer-service
```

---

## 13. Integración con catalog-service

Documentación canónica de `CatalogClientModule`: [docs/README-catalog-integration.md](../../../docs/README-catalog-integration.md).
