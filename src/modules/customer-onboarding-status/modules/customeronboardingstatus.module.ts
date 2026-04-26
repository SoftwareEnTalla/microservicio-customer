/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 * CEOs: 
 *       Persy Morell Guerra      Email: pmorellpersi@gmail.com  Phone : +53-5336-4654 Linkedin: https://www.linkedin.com/in/persy-morell-guerra-288943357/
 *       Dailyn García Domínguez  Email: dailyngd@gmail.com      Phone : +53-5432-0312 Linkedin: https://www.linkedin.com/in/dailyn-dominguez-3150799b/
 *
 * CTO: Persy Morell Guerra
 * COO: Dailyn García Domínguez and Persy Morell Guerra
 * CFO: Dailyn García Domínguez and Persy Morell Guerra
 *
 * Repositories: 
 *               https://github.com/SoftwareEnTalla 
 *
 *               https://github.com/apokaliptolesamale?tab=repositories
 *
 *
 * Social Networks:
 *
 *              https://x.com/SoftwarEnTalla
 *
 *              https://www.facebook.com/profile.php?id=61572625716568
 *
 *              https://www.instagram.com/softwarentalla/
 *              
 *
 *
 */


import { Module } from "@nestjs/common";
import { CustomerOnboardingStatusCommandController } from "../controllers/customeronboardingstatuscommand.controller";
import { CustomerOnboardingStatusQueryController } from "../controllers/customeronboardingstatusquery.controller";
import { CustomerOnboardingStatusCommandService } from "../services/customeronboardingstatuscommand.service";
import { CustomerOnboardingStatusQueryService } from "../services/customeronboardingstatusquery.service";

import { CustomerOnboardingStatusCommandRepository } from "../repositories/customeronboardingstatuscommand.repository";
import { CustomerOnboardingStatusQueryRepository } from "../repositories/customeronboardingstatusquery.repository";
import { CustomerOnboardingStatusRepository } from "../repositories/customeronboardingstatus.repository";
import { CustomerOnboardingStatusResolver } from "../graphql/customeronboardingstatus.resolver";
import { CustomerOnboardingStatusAuthGuard } from "../guards/customeronboardingstatusauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerOnboardingStatus } from "../entities/customer-onboarding-status.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateCustomerOnboardingStatusHandler } from "../commands/handlers/createcustomeronboardingstatus.handler";
import { UpdateCustomerOnboardingStatusHandler } from "../commands/handlers/updatecustomeronboardingstatus.handler";
import { DeleteCustomerOnboardingStatusHandler } from "../commands/handlers/deletecustomeronboardingstatus.handler";
import { GetCustomerOnboardingStatusByIdHandler } from "../queries/handlers/getcustomeronboardingstatusbyid.handler";
import { GetCustomerOnboardingStatusByFieldHandler } from "../queries/handlers/getcustomeronboardingstatusbyfield.handler";
import { GetAllCustomerOnboardingStatusHandler } from "../queries/handlers/getallcustomeronboardingstatus.handler";
import { CustomerOnboardingStatusCrudSaga } from "../sagas/customeronboardingstatus-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { CustomerOnboardingStatusInterceptor } from "../interceptors/customeronboardingstatus.interceptor";
import { CustomerOnboardingStatusLoggingInterceptor } from "../interceptors/customeronboardingstatus.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, CustomerOnboardingStatus]), // Incluir BaseEntity para herencia
    CacheModule.registerAsync({
      useFactory: async () => {
        try {
          const store = await redisStore({
            socket: { host: process.env.REDIS_HOST || "data-center-redis", port: parseInt(process.env.REDIS_PORT || "6379", 10) },
            ttl: parseInt(process.env.REDIS_TTL || "60", 10),
          });
          return { store: store as any, isGlobal: true };
        } catch {
          return { isGlobal: true }; // fallback in-memory
        }
      },
    }),
  ],
  controllers: [CustomerOnboardingStatusCommandController, CustomerOnboardingStatusQueryController],
  providers: [
    //Services
    EventStoreService,
    CustomerOnboardingStatusQueryService,
    CustomerOnboardingStatusCommandService,
  
    //Repositories
    CustomerOnboardingStatusCommandRepository,
    CustomerOnboardingStatusQueryRepository,
    CustomerOnboardingStatusRepository,      
    //Resolvers
    CustomerOnboardingStatusResolver,
    //Guards
    CustomerOnboardingStatusAuthGuard,
    //Interceptors
    CustomerOnboardingStatusInterceptor,
    CustomerOnboardingStatusLoggingInterceptor,
    //CQRS Handlers
    CreateCustomerOnboardingStatusHandler,
    UpdateCustomerOnboardingStatusHandler,
    DeleteCustomerOnboardingStatusHandler,
    GetCustomerOnboardingStatusByIdHandler,
    GetCustomerOnboardingStatusByFieldHandler,
    GetAllCustomerOnboardingStatusHandler,
    CustomerOnboardingStatusCrudSaga,
    //Configurations
    {
      provide: 'EVENT_SOURCING_CONFIG',
      useFactory: () => ({
        enabled: process.env.EVENT_SOURCING_ENABLED !== 'false',
        kafkaEnabled: process.env.KAFKA_ENABLED !== 'false',
        eventStoreEnabled: process.env.EVENT_STORE_ENABLED === 'true',
        publishEvents: true,
        useProjections: true,
        topics: EVENT_TOPICS
      })
    },
  ],
  exports: [
    CqrsModule,
    KafkaModule,
    //Services
    EventStoreService,
    CustomerOnboardingStatusQueryService,
    CustomerOnboardingStatusCommandService,
  
    //Repositories
    CustomerOnboardingStatusCommandRepository,
    CustomerOnboardingStatusQueryRepository,
    CustomerOnboardingStatusRepository,      
    //Resolvers
    CustomerOnboardingStatusResolver,
    //Guards
    CustomerOnboardingStatusAuthGuard,
    //Interceptors
    CustomerOnboardingStatusInterceptor,
    CustomerOnboardingStatusLoggingInterceptor,
  ],
})
export class CustomerOnboardingStatusModule {}

