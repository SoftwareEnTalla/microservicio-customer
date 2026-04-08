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
import { CustomerGatewayOnboardingCommandController } from "../controllers/customergatewayonboardingcommand.controller";
import { CustomerGatewayOnboardingQueryController } from "../controllers/customergatewayonboardingquery.controller";
import { CustomerGatewayOnboardingCommandService } from "../services/customergatewayonboardingcommand.service";
import { CustomerGatewayOnboardingQueryService } from "../services/customergatewayonboardingquery.service";
import { CustomerGatewayOnboardingCommandRepository } from "../repositories/customergatewayonboardingcommand.repository";
import { CustomerGatewayOnboardingQueryRepository } from "../repositories/customergatewayonboardingquery.repository";
import { CustomerGatewayOnboardingRepository } from "../repositories/customergatewayonboarding.repository";
import { CustomerGatewayOnboardingResolver } from "../graphql/customergatewayonboarding.resolver";
import { CustomerGatewayOnboardingAuthGuard } from "../guards/customergatewayonboardingauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerGatewayOnboarding } from "../entities/customer-gateway-onboarding.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateCustomerGatewayOnboardingHandler } from "../commands/handlers/createcustomergatewayonboarding.handler";
import { UpdateCustomerGatewayOnboardingHandler } from "../commands/handlers/updatecustomergatewayonboarding.handler";
import { DeleteCustomerGatewayOnboardingHandler } from "../commands/handlers/deletecustomergatewayonboarding.handler";
import { GetCustomerGatewayOnboardingByIdHandler } from "../queries/handlers/getcustomergatewayonboardingbyid.handler";
import { GetCustomerGatewayOnboardingByFieldHandler } from "../queries/handlers/getcustomergatewayonboardingbyfield.handler";
import { GetAllCustomerGatewayOnboardingHandler } from "../queries/handlers/getallcustomergatewayonboarding.handler";
import { CustomerGatewayOnboardingCrudSaga } from "../sagas/customergatewayonboarding-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { CustomerGatewayOnboardingInterceptor } from "../interceptors/customergatewayonboarding.interceptor";
import { CustomerGatewayOnboardingLoggingInterceptor } from "../interceptors/customergatewayonboarding.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, CustomerGatewayOnboarding]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [CustomerGatewayOnboardingCommandController, CustomerGatewayOnboardingQueryController],
  providers: [
    //Services
    EventStoreService,
    CustomerGatewayOnboardingQueryService,
    CustomerGatewayOnboardingCommandService,
    //Repositories
    CustomerGatewayOnboardingCommandRepository,
    CustomerGatewayOnboardingQueryRepository,
    CustomerGatewayOnboardingRepository,      
    //Resolvers
    CustomerGatewayOnboardingResolver,
    //Guards
    CustomerGatewayOnboardingAuthGuard,
    //Interceptors
    CustomerGatewayOnboardingInterceptor,
    CustomerGatewayOnboardingLoggingInterceptor,
    //CQRS Handlers
    CreateCustomerGatewayOnboardingHandler,
    UpdateCustomerGatewayOnboardingHandler,
    DeleteCustomerGatewayOnboardingHandler,
    GetCustomerGatewayOnboardingByIdHandler,
    GetCustomerGatewayOnboardingByFieldHandler,
    GetAllCustomerGatewayOnboardingHandler,
    CustomerGatewayOnboardingCrudSaga,
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
    CustomerGatewayOnboardingQueryService,
    CustomerGatewayOnboardingCommandService,
    //Repositories
    CustomerGatewayOnboardingCommandRepository,
    CustomerGatewayOnboardingQueryRepository,
    CustomerGatewayOnboardingRepository,      
    //Resolvers
    CustomerGatewayOnboardingResolver,
    //Guards
    CustomerGatewayOnboardingAuthGuard,
    //Interceptors
    CustomerGatewayOnboardingInterceptor,
    CustomerGatewayOnboardingLoggingInterceptor,
  ],
})
export class CustomerGatewayOnboardingModule {}

