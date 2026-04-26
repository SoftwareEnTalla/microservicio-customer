# CUSTOMER Microservice

**Creation Date**: 2026-04-22

**Author**: Ing. Persy Morell Guerra e Ing. Dailyn García Dominguez (SoftwarEnTalla CEO)

## Microservice Structure

```plaintext
.
|____common
| |____database
| |____dto
| | |____args
| | |____inputs
| |____helpers
| |____logger
| |____types
|____config
|____core
| |____adapters
| |____configs
| |____loaders
| |____logs
| |____services
| |____tda
|____database
|____docs
|____errors
|____filters
|____i18n
|____interfaces
|____migrations
|____modules
| |____catalog-client
| |____catalog-sync-log
| | |____aggregates
| | |____commands
| | | |____handlers
| | |____config
| | |____controllers
| | |____decorators
| | |____dtos
| | |____entities
| | |____events
| | |____graphql
| | |____guards
| | |____interceptors
| | |____modules
| | |____queries
| | | |____handlers
| | |____repositories
| | |____sagas
| | |____services
| | |____shared
| | | |____adapters
| | | |____decorators
| | | |____event-store
| | | |____messaging
| | |____types
| |____customer
| |____customer-gateway-onboarding
| | |____aggregates
| | |____commands
| | | |____handlers
| | |____config
| | |____controllers
| | |____decorators
| | |____dtos
| | |____entities
| | |____events
| | |____graphql
| | |____guards
| | |____interceptors
| | |____modules
| | |____queries
| | | |____handlers
| | |____repositories
| | |____sagas
| | |____services
| | |____shared
| | | |____adapters
| | | |____decorators
| | | |____event-store
| | | |____messaging
| | |____types
| | |____aggregates
| | |____commands
| | | |____handlers
| | |____config
| | |____controllers
| | |____decorators
| | |____dtos
| | |____entities
| | |____events
| | |____graphql
| | |____guards
| | |____interceptors
| | |____modules
| | |____queries
| | | |____handlers
| | |____repositories
| | |____sagas
| | |____services
| | |____shared
| | | |____adapters
| | | |____decorators
| | | |____event-store
| | | |____messaging
| | |____types
|____utils
```

<!-- nomencladores-propios:start -->

## Nomencladores propios

Este microservicio mantiene localmente los siguientes nomencladores (regla §4.9.6 de `docs/help.md` — entidad XML independiente con CRUD CQRS, FK desde agregados padres, seed SQL local idempotente).

| Nomenclador | Modelo DSL | Seed SQL |
|---|---|---|
| `customer-onboarding-status` | [../models/customer/customer-onboarding-status.xml](../models/customer/customer-onboarding-status.xml) | [./src/database/postgres-2-customer-onboarding-status.sql](./src/database/postgres-2-customer-onboarding-status.sql) |

Estos nomencladores se siembran automáticamente en cada arranque (`init-order.txt`). Si más adelante un segundo microservicio empieza a consumir alguno, se promueve a `catalog-service` según la regla.

<!-- nomencladores-propios:end -->
