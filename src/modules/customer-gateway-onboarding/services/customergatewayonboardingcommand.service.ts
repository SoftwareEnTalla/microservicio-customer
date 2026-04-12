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


import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { DeleteResult, UpdateResult } from "typeorm";
import { CustomerGatewayOnboarding } from "../entities/customer-gateway-onboarding.entity";
import { CreateCustomerGatewayOnboardingDto, UpdateCustomerGatewayOnboardingDto, DeleteCustomerGatewayOnboardingDto } from "../dtos/all-dto";
 
import { generateCacheKey } from "src/utils/functions";
import { CustomerGatewayOnboardingCommandRepository } from "../repositories/customergatewayonboardingcommand.repository";
import { CustomerGatewayOnboardingQueryRepository } from "../repositories/customergatewayonboardingquery.repository";
import { Cacheable } from "../decorators/cache.decorator";
import { CustomerGatewayOnboardingResponse, CustomerGatewayOnboardingsResponse } from "../types/customergatewayonboarding.types";
import { Helper } from "src/common/helpers/helpers";
//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { CommandBus } from "@nestjs/cqrs";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";
import { ModuleRef } from "@nestjs/core";
import { CustomerGatewayOnboardingQueryService } from "./customergatewayonboardingquery.service";
import { BaseEvent } from "../events/base.event";
import { CustomerGatewayOnboardingStartedEvent } from '../events/customergatewayonboardingstarted.event';
import { CustomerGatewayOnboardingApprovedEvent } from '../events/customergatewayonboardingapproved.event';
import { CustomerGatewayOnboardingRejectedEvent } from '../events/customergatewayonboardingrejected.event';
import { CustomerGatewayOnboardingExpiredEvent } from '../events/customergatewayonboardingexpired.event';

@Injectable()
export class CustomerGatewayOnboardingCommandService implements OnModuleInit {
  // Private properties
  readonly #logger = new Logger(CustomerGatewayOnboardingCommandService.name);
  //Constructo del servicio CustomerGatewayOnboardingCommandService
  constructor(
    private readonly repository: CustomerGatewayOnboardingCommandRepository,
    private readonly queryRepository: CustomerGatewayOnboardingQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
    private moduleRef: ModuleRef
  ) {
    //Inicialice aquí propiedades o atributos
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(CustomerGatewayOnboardingQueryService.name)
      .get(CustomerGatewayOnboardingQueryService.name),
  })
  onModuleInit() {
    //Se ejecuta en la inicialización del módulo
  }

  private dslValue(entityData: Record<string, any>, currentData: Record<string, any>, inputData: Record<string, any>, field: string): any {
    return entityData?.[field] ?? currentData?.[field] ?? inputData?.[field];
  }

  private async publishDslDomainEvents(events: BaseEvent[]): Promise<void> {
    for (const event of events) {
      await this.eventPublisher.publish(event as any);
      if (process.env.EVENT_STORE_ENABLED === "true") {
        await this.eventStore.appendEvent('customer-gateway-onboarding-' + event.aggregateId, event);
      }
    }
  }

  private async applyDslServiceRules(
    operation: "create" | "update" | "delete",
    inputData: Record<string, any>,
    entity?: CustomerGatewayOnboarding | null,
    current?: CustomerGatewayOnboarding | null,
    publishEvents: boolean = true,
  ): Promise<void> {
    const entityData = ((entity ?? {}) as Record<string, any>);
    const currentData = ((current ?? {}) as Record<string, any>);
    const pendingEvents: BaseEvent[] = [];
    if (operation === 'update') {
      // Regla de servicio: approved-onboarding-requires-completion-date
      // Un onboarding aprobado debe registrar fecha de finalización.
      if (!(this.dslValue(entityData, currentData, inputData, 'status') === 'APPROVED' && !(this.dslValue(entityData, currentData, inputData, 'completedAt') === undefined || this.dslValue(entityData, currentData, inputData, 'completedAt') === null || (typeof this.dslValue(entityData, currentData, inputData, 'completedAt') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'completedAt')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'completedAt')) && this.dslValue(entityData, currentData, inputData, 'completedAt').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'completedAt') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'completedAt')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'completedAt')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'completedAt'))).length === 0)))) {
        logger.warn('CUST_ONBOARDING_001: Un onboarding aprobado debe tener fecha de finalización');
      }

      // Regla de servicio: started-onboarding-emits-domain-event
      // Cuando un onboarding entra en progreso debe emitirse un evento para que payment pueda pausar el checkout y esperar acción del cliente.
      if (this.dslValue(entityData, currentData, inputData, 'status') === 'IN_PROGRESS') {
        pendingEvents.push(CustomerGatewayOnboardingStartedEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'customer-gateway-onboarding-update'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'customer-gateway-onboarding-update')
        ));
      }

      // Regla de servicio: approved-onboarding-emits-domain-event
      // Cuando un onboarding sea aprobado debe emitirse un evento para reanudar el flujo de pago.
      if (this.dslValue(entityData, currentData, inputData, 'status') === 'APPROVED') {
        pendingEvents.push(CustomerGatewayOnboardingApprovedEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'customer-gateway-onboarding-update'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'customer-gateway-onboarding-update')
        ));
      }

      // Regla de servicio: rejected-onboarding-emits-domain-event
      // Cuando un onboarding sea rechazado debe emitirse un evento de dominio.
      if (this.dslValue(entityData, currentData, inputData, 'status') === 'REJECTED') {
        pendingEvents.push(CustomerGatewayOnboardingRejectedEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'customer-gateway-onboarding-update'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'customer-gateway-onboarding-update')
        ));
      }

      // Regla de servicio: expired-onboarding-emits-domain-event
      // Cuando un onboarding expira debe emitirse un evento para cerrar pagos dependientes del flujo.
      if (this.dslValue(entityData, currentData, inputData, 'status') === 'EXPIRED') {
        pendingEvents.push(CustomerGatewayOnboardingExpiredEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'customer-gateway-onboarding-update'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'customer-gateway-onboarding-update')
        ));
      }

    }
    if (publishEvents) {
      await this.publishDslDomainEvents(pendingEvents);
    }
  }

  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(CustomerGatewayOnboardingCommandService.name)
      .get(CustomerGatewayOnboardingCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CreateCustomerGatewayOnboardingDto>("createCustomerGatewayOnboarding", args[0], args[1]),
    ttl: 60,
  })
  async create(
    createCustomerGatewayOnboardingDtoInput: CreateCustomerGatewayOnboardingDto
  ): Promise<CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>> {
    try {
      logger.info("Receiving in service:", createCustomerGatewayOnboardingDtoInput);
      const candidate = CustomerGatewayOnboarding.fromDto(createCustomerGatewayOnboardingDtoInput);
      await this.applyDslServiceRules("create", createCustomerGatewayOnboardingDtoInput as Record<string, any>, candidate, null, false);
      const entity = await this.repository.create(candidate);
      await this.applyDslServiceRules("create", createCustomerGatewayOnboardingDtoInput as Record<string, any>, entity, null, true);
      logger.info("Entity created on service:", entity);
      // Respuesta si el customergatewayonboarding no existe
      if (!entity)
        throw new NotFoundException("Entidad CustomerGatewayOnboarding no encontrada.");
      // Devolver customergatewayonboarding
      return {
        ok: true,
        message: "CustomerGatewayOnboarding obtenido con éxito.",
        data: entity,
      };
    } catch (error) {
      logger.info("Error creating entity on service:", error);
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(CustomerGatewayOnboardingCommandService.name)
      .get(CustomerGatewayOnboardingCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CustomerGatewayOnboarding>("createCustomerGatewayOnboardings", args[0], args[1]),
    ttl: 60,
  })
  async bulkCreate(
    createCustomerGatewayOnboardingDtosInput: CreateCustomerGatewayOnboardingDto[]
  ): Promise<CustomerGatewayOnboardingsResponse<CustomerGatewayOnboarding>> {
    try {
      const entities = await this.repository.bulkCreate(
        createCustomerGatewayOnboardingDtosInput.map((entity) => CustomerGatewayOnboarding.fromDto(entity))
      );

      // Respuesta si el customergatewayonboarding no existe
      if (!entities)
        throw new NotFoundException("Entidades CustomerGatewayOnboardings no encontradas.");
      // Devolver customergatewayonboarding
      return {
        ok: true,
        message: "CustomerGatewayOnboardings creados con éxito.",
        data: entities,
        count: entities.length,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(CustomerGatewayOnboardingCommandService.name)
      .get(CustomerGatewayOnboardingCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateCustomerGatewayOnboardingDto>("updateCustomerGatewayOnboarding", args[0], args[1]),
    ttl: 60,
  })
  async update(
    id: string,
    partialEntity: UpdateCustomerGatewayOnboardingDto
  ): Promise<CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>> {
    try {
      const currentEntity = await this.queryRepository.findById(id);
      const candidate = Object.assign(new CustomerGatewayOnboarding(), currentEntity ?? {}, partialEntity);
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, candidate, currentEntity, false);
      const entity = await this.repository.update(
        id,
        candidate
      );
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, entity, currentEntity, true);
      // Respuesta si el customergatewayonboarding no existe
      if (!entity)
        throw new NotFoundException("Entidades CustomerGatewayOnboardings no encontradas.");
      // Devolver customergatewayonboarding
      return {
        ok: true,
        message: "CustomerGatewayOnboarding actualizada con éxito.",
        data: entity,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(CustomerGatewayOnboardingCommandService.name)
      .get(CustomerGatewayOnboardingCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateCustomerGatewayOnboardingDto>("updateCustomerGatewayOnboardings", args[0]),
    ttl: 60,
  })
  async bulkUpdate(
    partialEntity: UpdateCustomerGatewayOnboardingDto[]
  ): Promise<CustomerGatewayOnboardingsResponse<CustomerGatewayOnboarding>> {
    try {
      const entities = await this.repository.bulkUpdate(
        partialEntity.map((entity) => CustomerGatewayOnboarding.fromDto(entity))
      );
      // Respuesta si el customergatewayonboarding no existe
      if (!entities)
        throw new NotFoundException("Entidades CustomerGatewayOnboardings no encontradas.");
      // Devolver customergatewayonboarding
      return {
        ok: true,
        message: "CustomerGatewayOnboardings actualizadas con éxito.",
        data: entities,
        count: entities.length,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }

   @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(CustomerGatewayOnboardingCommandService.name)
      .get(CustomerGatewayOnboardingCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<DeleteCustomerGatewayOnboardingDto>("deleteCustomerGatewayOnboarding", args[0], args[1]),
    ttl: 60,
  })
  async delete(id: string): Promise<CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>> {
    try {
      const entity = await this.queryRepository.findById(id);
      // Respuesta si el customergatewayonboarding no existe
      if (!entity)
        throw new NotFoundException("Instancias de CustomerGatewayOnboarding no encontradas.");

      await this.applyDslServiceRules("delete", { id }, entity, entity, false);

      const result = await this.repository.delete(id);
      await this.applyDslServiceRules("delete", { id }, entity, entity, true);
      // Devolver customergatewayonboarding
      return {
        ok: true,
        message: "Instancia de CustomerGatewayOnboarding eliminada con éxito.",
        data: entity,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }

  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(CustomerGatewayOnboardingCommandService.name)
      .get(CustomerGatewayOnboardingCommandService.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<string[]>("deleteCustomerGatewayOnboardings", args[0]),
    ttl: 60,
  })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    return await this.repository.bulkDelete(ids);
  }
}

