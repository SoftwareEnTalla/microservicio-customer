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


import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";

//Definición de entidades
import { CustomerOnboardingStatus } from "../entities/customer-onboarding-status.entity";

//Definición de comandos
import {
  CreateCustomerOnboardingStatusCommand,
  UpdateCustomerOnboardingStatusCommand,
  DeleteCustomerOnboardingStatusCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { CustomerOnboardingStatusQueryService } from "../services/customeronboardingstatusquery.service";


import { CustomerOnboardingStatusResponse, CustomerOnboardingStatussResponse } from "../types/customeronboardingstatus.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateCustomerOnboardingStatusDto, 
CreateOrUpdateCustomerOnboardingStatusDto, 
CustomerOnboardingStatusValueInput, 
CustomerOnboardingStatusDto, 
CreateCustomerOnboardingStatusDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => CustomerOnboardingStatus)
export class CustomerOnboardingStatusResolver {

   //Constructor del resolver de CustomerOnboardingStatus
  constructor(
    private readonly service: CustomerOnboardingStatusQueryService,
    private readonly commandBus: CommandBus
  ) {}

  @LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  // Mutaciones
  @Mutation(() => CustomerOnboardingStatusResponse<CustomerOnboardingStatus>)
  async createCustomerOnboardingStatus(
    @Args("input", { type: () => CreateCustomerOnboardingStatusDto }) input: CreateCustomerOnboardingStatusDto
  ): Promise<CustomerOnboardingStatusResponse<CustomerOnboardingStatus>> {
    return this.commandBus.execute(new CreateCustomerOnboardingStatusCommand(input));
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  @Mutation(() => CustomerOnboardingStatusResponse<CustomerOnboardingStatus>)
  async updateCustomerOnboardingStatus(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateCustomerOnboardingStatusDto
  ): Promise<CustomerOnboardingStatusResponse<CustomerOnboardingStatus>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateCustomerOnboardingStatusCommand(payLoad, {
        instance: payLoad,
        metadata: {
          initiatedBy: payLoad.createdBy || 'system',
          correlationId: payLoad.id,
        },
      })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  @Mutation(() => CustomerOnboardingStatusResponse<CustomerOnboardingStatus>)
  async createOrUpdateCustomerOnboardingStatus(
    @Args("data", { type: () => CreateOrUpdateCustomerOnboardingStatusDto })
    data: CreateOrUpdateCustomerOnboardingStatusDto
  ): Promise<CustomerOnboardingStatusResponse<CustomerOnboardingStatus>> {
    if (data.id) {
      const existingCustomerOnboardingStatus = await this.service.findById(data.id);
      if (existingCustomerOnboardingStatus) {
        return this.commandBus.execute(
          new UpdateCustomerOnboardingStatusCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateCustomerOnboardingStatusDto | UpdateCustomerOnboardingStatusDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateCustomerOnboardingStatusCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateCustomerOnboardingStatusDto | UpdateCustomerOnboardingStatusDto).createdBy ||
            'system',
          correlationId: data.id || uuidv4(),
        },
      })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteCustomerOnboardingStatus(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteCustomerOnboardingStatusCommand(id));
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  // Queries
  @Query(() => CustomerOnboardingStatussResponse<CustomerOnboardingStatus>)
  async customeronboardingstatuss(
    options?: FindManyOptions<CustomerOnboardingStatus>,
    paginationArgs?: PaginationArgs
  ): Promise<CustomerOnboardingStatussResponse<CustomerOnboardingStatus>> {
    return this.service.findAll(options, paginationArgs);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  @Query(() => CustomerOnboardingStatussResponse<CustomerOnboardingStatus>)
  async customeronboardingstatus(
    @Args("id", { type: () => String }) id: string
  ): Promise<CustomerOnboardingStatusResponse<CustomerOnboardingStatus>> {
    return this.service.findById(id);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  @Query(() => CustomerOnboardingStatussResponse<CustomerOnboardingStatus>)
  async customeronboardingstatussByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => CustomerOnboardingStatusValueInput }) value: CustomerOnboardingStatusValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<CustomerOnboardingStatussResponse<CustomerOnboardingStatus>> {
    return this.service.findByField(
      field,
      value,
      fromObject.call(PaginationArgs, { page: page, limit: limit })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  @Query(() => CustomerOnboardingStatussResponse<CustomerOnboardingStatus>)
  async customeronboardingstatussWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<CustomerOnboardingStatussResponse<CustomerOnboardingStatus>> {
    const paginationArgs = fromObject.call(PaginationArgs, {
      page: page,
      limit: limit,
    });
    return this.service.findWithPagination({}, paginationArgs);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  @Query(() => Number)
  async totalCustomerOnboardingStatuss(): Promise<number> {
    return this.service.count();
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  @Query(() => CustomerOnboardingStatussResponse<CustomerOnboardingStatus>)
  async searchCustomerOnboardingStatuss(
    @Args("where", { type: () => CustomerOnboardingStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<CustomerOnboardingStatussResponse<CustomerOnboardingStatus>> {
    const customeronboardingstatuss = await this.service.findAndCount(where);
    return customeronboardingstatuss;
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  @Query(() => CustomerOnboardingStatusResponse<CustomerOnboardingStatus>, { nullable: true })
  async findOneCustomerOnboardingStatus(
    @Args("where", { type: () => CustomerOnboardingStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<CustomerOnboardingStatusResponse<CustomerOnboardingStatus>> {
    return this.service.findOne(where);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(CustomerOnboardingStatusResolver.name)

      .get(CustomerOnboardingStatusResolver.name),
    })
  @Query(() => CustomerOnboardingStatusResponse<CustomerOnboardingStatus>)
  async findOneCustomerOnboardingStatusOrFail(
    @Args("where", { type: () => CustomerOnboardingStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<CustomerOnboardingStatusResponse<CustomerOnboardingStatus> | Error> {
    return this.service.findOneOrFail(where);
  }
}

