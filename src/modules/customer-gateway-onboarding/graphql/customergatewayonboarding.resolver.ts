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
import { CustomerGatewayOnboarding } from "../entities/customer-gateway-onboarding.entity";

//Definición de comandos
import {
  CreateCustomerGatewayOnboardingCommand,
  UpdateCustomerGatewayOnboardingCommand,
  DeleteCustomerGatewayOnboardingCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { CustomerGatewayOnboardingQueryService } from "../services/customergatewayonboardingquery.service";


import { CustomerGatewayOnboardingResponse, CustomerGatewayOnboardingsResponse } from "../types/customergatewayonboarding.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateCustomerGatewayOnboardingDto, 
CreateOrUpdateCustomerGatewayOnboardingDto, 
CustomerGatewayOnboardingValueInput, 
CustomerGatewayOnboardingDto, 
CreateCustomerGatewayOnboardingDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => CustomerGatewayOnboarding)
export class CustomerGatewayOnboardingResolver {

   //Constructor del resolver de CustomerGatewayOnboarding
  constructor(
    private readonly service: CustomerGatewayOnboardingQueryService,
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  // Mutaciones
  @Mutation(() => CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>)
  async createCustomerGatewayOnboarding(
    @Args("input", { type: () => CreateCustomerGatewayOnboardingDto }) input: CreateCustomerGatewayOnboardingDto
  ): Promise<CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>> {
    return this.commandBus.execute(new CreateCustomerGatewayOnboardingCommand(input));
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  @Mutation(() => CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>)
  async updateCustomerGatewayOnboarding(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateCustomerGatewayOnboardingDto
  ): Promise<CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateCustomerGatewayOnboardingCommand(payLoad, {
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  @Mutation(() => CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>)
  async createOrUpdateCustomerGatewayOnboarding(
    @Args("data", { type: () => CreateOrUpdateCustomerGatewayOnboardingDto })
    data: CreateOrUpdateCustomerGatewayOnboardingDto
  ): Promise<CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>> {
    if (data.id) {
      const existingCustomerGatewayOnboarding = await this.service.findById(data.id);
      if (existingCustomerGatewayOnboarding) {
        return this.commandBus.execute(
          new UpdateCustomerGatewayOnboardingCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateCustomerGatewayOnboardingDto | UpdateCustomerGatewayOnboardingDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateCustomerGatewayOnboardingCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateCustomerGatewayOnboardingDto | UpdateCustomerGatewayOnboardingDto).createdBy ||
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteCustomerGatewayOnboarding(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteCustomerGatewayOnboardingCommand(id));
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  // Queries
  @Query(() => CustomerGatewayOnboardingsResponse<CustomerGatewayOnboarding>)
  async customergatewayonboardings(
    options?: FindManyOptions<CustomerGatewayOnboarding>,
    paginationArgs?: PaginationArgs
  ): Promise<CustomerGatewayOnboardingsResponse<CustomerGatewayOnboarding>> {
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  @Query(() => CustomerGatewayOnboardingsResponse<CustomerGatewayOnboarding>)
  async customergatewayonboarding(
    @Args("id", { type: () => String }) id: string
  ): Promise<CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>> {
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  @Query(() => CustomerGatewayOnboardingsResponse<CustomerGatewayOnboarding>)
  async customergatewayonboardingsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => CustomerGatewayOnboardingValueInput }) value: CustomerGatewayOnboardingValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<CustomerGatewayOnboardingsResponse<CustomerGatewayOnboarding>> {
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  @Query(() => CustomerGatewayOnboardingsResponse<CustomerGatewayOnboarding>)
  async customergatewayonboardingsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<CustomerGatewayOnboardingsResponse<CustomerGatewayOnboarding>> {
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  @Query(() => Number)
  async totalCustomerGatewayOnboardings(): Promise<number> {
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  @Query(() => CustomerGatewayOnboardingsResponse<CustomerGatewayOnboarding>)
  async searchCustomerGatewayOnboardings(
    @Args("where", { type: () => CustomerGatewayOnboardingDto, nullable: false })
    where: Record<string, any>
  ): Promise<CustomerGatewayOnboardingsResponse<CustomerGatewayOnboarding>> {
    const customergatewayonboardings = await this.service.findAndCount(where);
    return customergatewayonboardings;
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  @Query(() => CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>, { nullable: true })
  async findOneCustomerGatewayOnboarding(
    @Args("where", { type: () => CustomerGatewayOnboardingDto, nullable: false })
    where: Record<string, any>
  ): Promise<CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>> {
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
      .registerClient(CustomerGatewayOnboardingResolver.name)

      .get(CustomerGatewayOnboardingResolver.name),
    })
  @Query(() => CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding>)
  async findOneCustomerGatewayOnboardingOrFail(
    @Args("where", { type: () => CustomerGatewayOnboardingDto, nullable: false })
    where: Record<string, any>
  ): Promise<CustomerGatewayOnboardingResponse<CustomerGatewayOnboarding> | Error> {
    return this.service.findOneOrFail(where);
  }
}

