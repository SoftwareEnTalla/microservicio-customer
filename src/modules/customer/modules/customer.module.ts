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
import { CustomerCommandController } from "../controllers/customercommand.controller";
import { CustomerQueryController } from "../controllers/customerquery.controller";
import { CustomerCommandService } from "../services/customercommand.service";
import { CustomerQueryService } from "../services/customerquery.service";
import { CustomerCommandRepository } from "../repositories/customercommand.repository";
import { CustomerQueryRepository } from "../repositories/customerquery.repository";
import { CustomerRepository } from "../repositories/customer.repository";
import { CustomerResolver } from "../graphql/customer.resolver";
import { CustomerAuthGuard } from "../guards/customerauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "../entities/customer.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateCustomerHandler } from "../commands/handlers/createcustomer.handler";
import { UpdateCustomerHandler } from "../commands/handlers/updatecustomer.handler";
import { DeleteCustomerHandler } from "../commands/handlers/deletecustomer.handler";
import { GetCustomerByIdHandler } from "../queries/handlers/getcustomerbyid.handler";
import { GetCustomerByFieldHandler } from "../queries/handlers/getcustomerbyfield.handler";
import { GetAllCustomerHandler } from "../queries/handlers/getallcustomer.handler";
import { CustomerCrudSaga } from "../sagas/customer-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { CustomerInterceptor } from "../interceptors/customer.interceptor";
import { CustomerLoggingInterceptor } from "../interceptors/customer.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, Customer]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [CustomerCommandController, CustomerQueryController],
  providers: [
    //Services
    EventStoreService,
    CustomerQueryService,
    CustomerCommandService,
    //Repositories
    CustomerCommandRepository,
    CustomerQueryRepository,
    CustomerRepository,      
    //Resolvers
    CustomerResolver,
    //Guards
    CustomerAuthGuard,
    //Interceptors
    CustomerInterceptor,
    CustomerLoggingInterceptor,
    //CQRS Handlers
    CreateCustomerHandler,
    UpdateCustomerHandler,
    DeleteCustomerHandler,
    GetCustomerByIdHandler,
    GetCustomerByFieldHandler,
    GetAllCustomerHandler,
    CustomerCrudSaga,
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
    CustomerQueryService,
    CustomerCommandService,
    //Repositories
    CustomerCommandRepository,
    CustomerQueryRepository,
    CustomerRepository,      
    //Resolvers
    CustomerResolver,
    //Guards
    CustomerAuthGuard,
    //Interceptors
    CustomerInterceptor,
    CustomerLoggingInterceptor,
  ],
})
export class CustomerModule {}

