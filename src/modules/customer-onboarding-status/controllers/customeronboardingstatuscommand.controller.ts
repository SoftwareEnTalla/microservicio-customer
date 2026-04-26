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


import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { CustomerOnboardingStatusCommandService } from "../services/customeronboardingstatuscommand.service";
import { CustomerOnboardingStatusAuthGuard } from "../guards/customeronboardingstatusauthguard.guard";

import { DeleteResult } from "typeorm";
import { Logger } from "@nestjs/common";
import { Helper } from "src/common/helpers/helpers";
import { CustomerOnboardingStatus } from "../entities/customer-onboarding-status.entity";
import { CustomerOnboardingStatusResponse, CustomerOnboardingStatussResponse } from "../types/customeronboardingstatus.types";
import { CreateCustomerOnboardingStatusDto, UpdateCustomerOnboardingStatusDto } from "../dtos/all-dto"; 

//Loggers
import { LoggerClient } from "src/common/logger/logger.client";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { logger } from '@core/logs/logger';

import { BadRequestException } from "@nestjs/common";

import { CommandBus } from "@nestjs/cqrs";
//import { CustomerOnboardingStatusCreatedEvent } from "../events/customeronboardingstatuscreated.event";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";

@ApiTags("CustomerOnboardingStatus Command")
@UseGuards(CustomerOnboardingStatusAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Autenticación requerida." })
@Controller("customeronboardingstatuss/command")
export class CustomerOnboardingStatusCommandController {

  #logger = new Logger(CustomerOnboardingStatusCommandController.name);

  //Constructor del controlador: CustomerOnboardingStatusCommandController
  constructor(
  private readonly service: CustomerOnboardingStatusCommandService,
  private readonly commandBus: CommandBus,
  private readonly eventStore: EventStoreService,
  private readonly eventPublisher: KafkaEventPublisher
  ) {
    //Coloca aquí la lógica que consideres necesaria para inicializar el controlador
  }

  @ApiOperation({ summary: "Create a new customeronboardingstatus" })
  @ApiBody({ type: CreateCustomerOnboardingStatusDto })
  @ApiResponse({ status: 201, type: CustomerOnboardingStatusResponse<CustomerOnboardingStatus> })
  @Post()
  @LogExecutionTime({
    layer: "controller",
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
      .registerClient(CustomerOnboardingStatusCommandController.name)
      .get(CustomerOnboardingStatusCommandController.name),
  })
  async create(
    @Body() createCustomerOnboardingStatusDtoInput: CreateCustomerOnboardingStatusDto
  ): Promise<CustomerOnboardingStatusResponse<CustomerOnboardingStatus>> {
    try {
      logger.info("Receiving in controller:", createCustomerOnboardingStatusDtoInput);
      const entity = await this.service.create(createCustomerOnboardingStatusDtoInput);
      logger.info("Entity created on controller:", entity);
      if (!entity) {
        throw new NotFoundException("Response customeronboardingstatus entity not found.");
      } else if (!entity.data) {
        throw new NotFoundException("CustomerOnboardingStatus entity not found on response.");
      } else if (!entity.data.id) {
        throw new NotFoundException("Id customeronboardingstatus is null on order instance.");
      }     

      return entity;
    } catch (error) {
      logger.info("Error creating entity on controller:", error);
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Create multiple customeronboardingstatuss" })
  @ApiBody({ type: [CreateCustomerOnboardingStatusDto] })
  @ApiResponse({ status: 201, type: CustomerOnboardingStatussResponse<CustomerOnboardingStatus> })
  @Post("bulk")
  @LogExecutionTime({
    layer: "controller",
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
      .registerClient(CustomerOnboardingStatusCommandController.name)
      .get(CustomerOnboardingStatusCommandController.name),
  })
  async bulkCreate(
    @Body() createCustomerOnboardingStatusDtosInput: CreateCustomerOnboardingStatusDto[]
  ): Promise<CustomerOnboardingStatussResponse<CustomerOnboardingStatus>> {
    try {
      const entities = await this.service.bulkCreate(createCustomerOnboardingStatusDtosInput);

      if (!entities) {
        throw new NotFoundException("CustomerOnboardingStatus entities not found.");
      }

      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Update an customeronboardingstatus" })
  @ApiParam({
    name: "id",
    description: "Identificador desde la url del endpoint",
  }) // ✅ Documentamos el ID de la URL
  @ApiBody({
    type: UpdateCustomerOnboardingStatusDto,
    description: "El Payload debe incluir el mismo ID de la URL",
  })
  @ApiResponse({ status: 200, type: CustomerOnboardingStatusResponse<CustomerOnboardingStatus> })
  @ApiResponse({
    status: 400,
    description:
      "EL ID en la URL no coincide con la instancia CustomerOnboardingStatus a actualizar.",
  }) // ✅ Nuevo status para el error de validación
  @Put(":id")
  @LogExecutionTime({
    layer: "controller",
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
      .registerClient(CustomerOnboardingStatusCommandController.name)
      .get(CustomerOnboardingStatusCommandController.name),
  })
  async update(
    @Param("id") id: string,
    @Body() body: any
  ): Promise<CustomerOnboardingStatusResponse<CustomerOnboardingStatus>> {
    try {
      // Permitir body plano o anidado en 'data'
      const partialEntity = body?.data ? body.data : body;
      // ✅ Validación de coincidencia de IDs (auto-asigna id de la URL si el body no lo trae)
      if (partialEntity?.id && id !== partialEntity.id) {
        throw new BadRequestException(
          "El ID en la URL no coincide con el ID en la instancia de CustomerOnboardingStatus a actualizar."
        );
      }
      if (partialEntity && !partialEntity.id) { partialEntity.id = id; }
      const entity = await this.service.update(id, partialEntity);

      if (!entity) {
        throw new NotFoundException("Instancia de CustomerOnboardingStatus no encontrada.");
      }

      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Update multiple customeronboardingstatuss" })
  @ApiBody({ type: [UpdateCustomerOnboardingStatusDto] })
  @ApiResponse({ status: 200, type: CustomerOnboardingStatussResponse<CustomerOnboardingStatus> })
  @Put("bulk")
  @LogExecutionTime({
    layer: "controller",
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
      .registerClient(CustomerOnboardingStatusCommandController.name)
      .get(CustomerOnboardingStatusCommandController.name),
  })
  async bulkUpdate(
    @Body() partialEntities: UpdateCustomerOnboardingStatusDto[]
  ): Promise<CustomerOnboardingStatussResponse<CustomerOnboardingStatus>> {
    try {
      const entities = await this.service.bulkUpdate(partialEntities);

      if (!entities) {
        throw new NotFoundException("CustomerOnboardingStatus entities not found.");
      }

      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Delete an customeronboardingstatus" })   
  @ApiResponse({ status: 200, type: CustomerOnboardingStatusResponse<CustomerOnboardingStatus>,description:
    "Instancia de CustomerOnboardingStatus eliminada satisfactoriamente.", })
  @ApiResponse({
    status: 400,
    description:
      "EL ID en la URL no coincide con la instancia CustomerOnboardingStatus a eliminar.",
  }) // ✅ Nuevo status para el error de validación
  @Delete(":id")
  @LogExecutionTime({
    layer: "controller",
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
      .registerClient(CustomerOnboardingStatusCommandController.name)
      .get(CustomerOnboardingStatusCommandController.name),
  })
  async delete(@Param("id") id: string): Promise<CustomerOnboardingStatusResponse<CustomerOnboardingStatus>> {
    try {
       
      const result = await this.service.delete(id);

      if (!result) {
        throw new NotFoundException("CustomerOnboardingStatus entity not found.");
      }

      return result;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Delete multiple customeronboardingstatuss" })
  @ApiResponse({ status: 200, type: DeleteResult })
  @Delete("bulk")
  @LogExecutionTime({
    layer: "controller",
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
      .registerClient(CustomerOnboardingStatusCommandController.name)
      .get(CustomerOnboardingStatusCommandController.name),
  })
  async bulkDelete(@Query("ids") ids: string[]): Promise<DeleteResult> {
    return await this.service.bulkDelete(ids);
  }
}

