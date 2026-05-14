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
import { FindManyOptions, In } from "typeorm";
import { Customer } from "../entities/customer.entity";
import { BaseEntity } from "../entities/base.entity";
import { CustomerQueryRepository } from "../repositories/customerquery.repository";
import { CustomerResponse, CustomersResponse } from "../types/customer.types";
import { Helper } from "src/common/helpers/helpers";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
//import { Cacheable } from "../decorators/cache.decorator";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { ModuleRef } from "@nestjs/core";
import { logger } from '@core/logs/logger';

type ReferralTreeNodePayload = {
  userId: string;
  username?: string;
  email?: string;
  salesManagerId?: string;
  managerCode?: string;
  approvalStatus?: string;
  depth: number;
  referrals?: ReferralTreeNodePayload[];
};

type WalletSnapshot = {
  wallet: {
    id: string;
    customerId: string;
    cashbackBalance: number;
    withdrawableBalance: number;
    totalEarnedCashback: number;
    totalEarnedReferral: number;
    lastMovementAt: string | Date | null;
  } | null;
  latest: Array<Record<string, unknown>>;
};

type SecurityUserSnapshot = {
  id: string;
  username?: string;
  email?: string;
};

type SalesManagerSnapshot = {
  id: string;
  userId: string;
  managerCode?: string | null;
  approvalStatus?: string | null;
};



@Injectable()
export class CustomerQueryService implements OnModuleInit{
  // Private properties
  readonly #logger = new Logger(CustomerQueryService.name);
  private readonly loggerClient = LoggerClient.getInstance();
  private internalAccessToken: string | null = null;
  private internalAccessTokenExpiresAt = 0;

  constructor(private readonly repository: CustomerQueryRepository,
  private moduleRef: ModuleRef
  ) {
    this.validate();
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
      .registerClient(CustomerQueryService.name)
      .get(CustomerQueryService.name),
  })
  onModuleInit() {
    //Se ejecuta en la inicialización del módulo
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
      .registerClient(CustomerQueryService.name)
      .get(CustomerQueryService.name),
  })
  private validate(): void {
    try {
      const entityInstance = Object.create(Customer.prototype);
      if (!(entityInstance instanceof BaseEntity)) {
        let sms = `El tipo ${Customer.name} no extiende de BaseEntity. Asegúrate de que todas las entidades hereden correctamente.`;
        logger.info(sms);
        throw new Error(sms);
      }
    } catch (error) {
      // Imprimir error
      logger.error(error);
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
      .registerClient(CustomerQueryService.name)
      .get(CustomerQueryService.name),
  })
  async findAll(
    options?: FindManyOptions<Customer>,
    paginationArgs?: PaginationArgs
  ): Promise<CustomersResponse<Customer>> {
    try {
      const customers = await this.repository.findAll(options);
      // Devolver respuesta
      logger.info("sms");
      return {
        ok: true,
        message: "Listado de customers obtenido con éxito",
        data: customers,
        pagination: Helper.getPaginator(
          paginationArgs ? paginationArgs.page : 1,
          paginationArgs ? paginationArgs.size : 25,
          customers.length
        ),
        count: customers.length,
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
      .registerClient(CustomerQueryService.name)
      .get(CustomerQueryService.name),
  })
  async findById(id: string): Promise<CustomerResponse<Customer>> {
    try {
      const customer = await this.repository.findOne({
        where: { id },
        relations: [],
      });
      // Respuesta si el customer no existe
      if (!customer)
        throw new NotFoundException(
          "Customer no encontrado para el id solicitado"
        );
      // Devolver customer
      return {
        ok: true,
        message: "Customer obtenido con éxito",
        data: customer,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }

    async getReferralTreeReadModel(customerId: string, maxDepth = 5): Promise<Record<string, unknown>> {
      const context = await this.buildReferralReadModelContext(customerId, maxDepth, 6);

      return {
        ok: true,
        message: 'Read model nativo del referral tree obtenido con éxito.',
        data: {
          rootCustomer: this.mapCustomerSummary(context.rootCustomer),
          tree: context.tree,
          stats: {
            totalUsersInTree: context.allNodes.length,
            customersLinked: context.customerNodes.length,
            usersWithoutCustomerProfile: context.allNodes.length - context.customerNodes.length,
            maxDepth,
            localSnapshotAt: new Date().toISOString(),
          },
        },
      };
    }

    async getReferralEarningsSummary(customerId: string, maxDepth = 5, limit = 8): Promise<Record<string, unknown>> {
      const context = await this.buildReferralReadModelContext(customerId, maxDepth, limit);
      const walletSnapshots = await Promise.all(
        context.customerNodes.map(async (customer) => ({
          customer,
          walletSnapshot: await this.fetchWalletSnapshot(customer.id, limit),
        })),
      );

      const latestMovements = walletSnapshots
        .flatMap(({ customer, walletSnapshot }) =>
          (walletSnapshot?.latest || []).map((movement) => ({
            customerId: customer.id,
            userId: customer.userId,
            amount: Number(movement.amount ?? 0),
            movementType: movement.movementType ?? null,
            level: Number(movement.level ?? 0),
            paymentId: movement.paymentId ?? null,
            orderId: movement.orderId ?? null,
            referenceCode: movement.referenceCode ?? null,
            createdAt: movement.createdAt ?? null,
          })),
        )
        .sort((left, right) => new Date(String(right.createdAt || 0)).getTime() - new Date(String(left.createdAt || 0)).getTime())
        .slice(0, limit);

      const totals = walletSnapshots.reduce(
        (accumulator, { walletSnapshot }) => {
          const wallet = walletSnapshot?.wallet;
          accumulator.totalCustomers += 1;
          accumulator.customersWithWallet += wallet ? 1 : 0;
          accumulator.totalCashbackBalance += Number(wallet?.cashbackBalance ?? 0);
          accumulator.totalWithdrawableBalance += Number(wallet?.withdrawableBalance ?? 0);
          accumulator.totalEarnedCashback += Number(wallet?.totalEarnedCashback ?? 0);
          accumulator.totalEarnedReferral += Number(wallet?.totalEarnedReferral ?? 0);
          return accumulator;
        },
        {
          totalCustomers: 0,
          customersWithWallet: 0,
          totalCashbackBalance: 0,
          totalWithdrawableBalance: 0,
          totalEarnedCashback: 0,
          totalEarnedReferral: 0,
        },
      );

      return {
        ok: true,
        message: 'Earnings summary local del referral tree obtenido con éxito.',
        data: {
          rootCustomer: this.mapCustomerSummary(context.rootCustomer),
          totals,
          network: walletSnapshots.map(({ customer, walletSnapshot }) => ({
            customer: this.mapCustomerSummary(customer),
            wallet: walletSnapshot?.wallet || null,
            latest: walletSnapshot?.latest || [],
          })),
          latest: latestMovements,
          localSnapshotAt: new Date().toISOString(),
        },
        count: walletSnapshots.length,
      };
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
      .registerClient(CustomerQueryService.name)
      .get(CustomerQueryService.name),
  })
  async findByField(
    field: string,
    value: any,
    paginationArgs?: PaginationArgs
  ): Promise<CustomersResponse<Customer>> {
    try {
      const [entities, lenght] = await this.repository.findAndCount({ [field]: value });

      // Respuesta si el customer no existe
      if (!entities)
        throw new NotFoundException(
          "Customers no encontrados para la propiedad y valor especificado"
        );
      // Devolver customer
      return {
        ok: true,
        message: "Customers obtenidos con éxito.",
        data: entities,
        pagination: Helper.getPaginator(
          paginationArgs ? paginationArgs.page : 1,
          paginationArgs ? paginationArgs.size : 25,
          lenght
        ),
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
      .registerClient(CustomerQueryService.name)
      .get(CustomerQueryService.name),
  })
  async findWithPagination(
    options: FindManyOptions<Customer>,
    paginationArgs?: PaginationArgs
  ): Promise<CustomersResponse<Customer>> {
    try {
      const entities = await this.repository.findWithPagination(
        options,
        paginationArgs ? paginationArgs.page : 1,
        paginationArgs ? paginationArgs.size : 25
      );

      // Respuesta si el customer no existe
      if (!entities)
        throw new NotFoundException("Entidades Customers no encontradas.");
      // Devolver customer
      return {
        ok: true,
        message: "Customer obtenido con éxito.",
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
      .registerClient(CustomerQueryService.name)
      .get(CustomerQueryService.name),
  })
  async count(): Promise<number> {
    return this.repository.count();
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
      .registerClient(CustomerQueryService.name)
      .get(CustomerQueryService.name),
  })
  async findAndCount(
    where?: Record<string, any>,
    paginationArgs?: PaginationArgs
  ): Promise<CustomersResponse<Customer>> {
    try {
      const [entities, lenght] = await this.repository.findAndCount(where);

      // Respuesta si el customer no existe
      if (!entities)
        throw new NotFoundException(
          "Entidades Customers no encontradas para el criterio especificado."
        );
      // Devolver customer
      return {
        ok: true,
        message: "Customers obtenidos con éxito.",
        data: entities,
        pagination: Helper.getPaginator(
          paginationArgs ? paginationArgs.page : 1,
          paginationArgs ? paginationArgs.size : 25,
          lenght
        ),
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
      .registerClient(CustomerQueryService.name)
      .get(CustomerQueryService.name),
  })
  async findOne(where?: Record<string, any>): Promise<CustomerResponse<Customer>> {
    try {
      const entity = await this.repository.findOne(where);

      // Respuesta si el customer no existe
      if (!entity)
        throw new NotFoundException("Entidad Customer no encontrada.");
      // Devolver customer
      return {
        ok: true,
        message: "Customer obtenido con éxito.",
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
      .registerClient(CustomerQueryService.name)
      .get(CustomerQueryService.name),
  })
  async findOneOrFail(
    where?: Record<string, any>
  ): Promise<CustomerResponse<Customer> | Error> {
    try {
      const entity = await this.repository.findOne(where);

      // Respuesta si el customer no existe
      if (!entity)
        return new NotFoundException("Entidad Customer no encontrada.");
      // Devolver customer
      return {
        ok: true,
        message: "Customer obtenido con éxito.",
        data: entity,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }

  private async buildReferralReadModelContext(customerId: string, maxDepth: number, limit: number): Promise<{
    rootCustomer: Customer;
    tree: Record<string, unknown>;
    allNodes: ReferralTreeNodePayload[];
    customerNodes: Customer[];
  }> {
    const rootCustomer = await this.repository.findOne({ where: { id: customerId } });
    if (!rootCustomer) {
      throw new NotFoundException(`Customer ${customerId} no encontrado.`);
    }

    const referralTree = await this.fetchReferralTree(rootCustomer.userId, maxDepth);
    const allNodes = this.flattenReferralTree(referralTree);
    const userIds = Array.from(new Set(allNodes.map((node) => String(node.userId || '').trim()).filter(Boolean)));
    const customerNodes = userIds.length
      ? await this.repository.findAll({
          where: {
            userId: In(userIds),
          } as never,
        })
      : [];
    const customersByUserId = new Map(customerNodes.map((customer) => [customer.userId, customer]));
    const walletSnapshots = await Promise.all(
      customerNodes.map(async (customer) => [customer.id, await this.fetchWalletSnapshot(customer.id, limit)] as const),
    );
    const walletByCustomerId = new Map(walletSnapshots);

    return {
      rootCustomer,
      tree: this.mapReferralTreeNode(referralTree, customersByUserId, walletByCustomerId),
      allNodes,
      customerNodes,
    };
  }

  private async fetchReferralTree(userId: string, maxDepth: number): Promise<ReferralTreeNodePayload> {
    const baseUrl = String(
      process.env.SALESMANAGER_SERVICE_URL || 'http://salesmanager-service-app-1:3013/api',
    ).replace(/\/$/, '');
    const headers = await this.buildInternalAuthHeaders();

    try {
      const response = await fetch(
        `${baseUrl}/salesmanagers/query/${encodeURIComponent(userId)}/referral-tree?maxDepth=${encodeURIComponent(String(maxDepth))}`,
        { headers },
      );

      if (response.ok) {
        return (await response.json()) as ReferralTreeNodePayload;
      }
    } catch {
      // Fallback below when SalesManager has no materialized tree endpoint.
    }

    return this.buildSyntheticReferralTree(userId);
  }

  private async buildSyntheticReferralTree(userId: string): Promise<ReferralTreeNodePayload> {
    const [user, salesManager] = await Promise.all([
      this.fetchSecurityUserSnapshot(userId),
      this.fetchSalesManagerSnapshot(userId),
    ]);

    if (!user) {
      throw new NotFoundException(`No fue posible obtener referral tree para user ${userId}.`);
    }

    return {
      userId,
      username: user.username || '',
      email: user.email || '',
      salesManagerId: salesManager?.id,
      managerCode: salesManager?.managerCode || undefined,
      approvalStatus: salesManager?.approvalStatus || undefined,
      depth: 0,
      referrals: [],
    };
  }

  private async fetchSecurityUserSnapshot(userId: string): Promise<SecurityUserSnapshot | null> {
    const baseUrl = String(process.env.SECURITY_SERVICE_URL || 'http://security-service-app-1:3015/api').replace(/\/$/, '');

    try {
      const response = await fetch(`${baseUrl}/users/query/${encodeURIComponent(userId)}`, {
        headers: await this.buildInternalAuthHeaders(),
      });
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as { ok?: boolean; data?: Record<string, unknown> };
      if (payload?.ok !== true || !payload.data) {
        return null;
      }

      return {
        id: String(payload.data.id || userId),
        username: String(payload.data.username || '').trim() || undefined,
        email: String(payload.data.email || '').trim() || undefined,
      };
    } catch {
      return null;
    }
  }

  private async fetchSalesManagerSnapshot(userId: string): Promise<SalesManagerSnapshot | null> {
    const baseUrl = String(process.env.SALESMANAGER_SERVICE_URL || 'http://salesmanager-service-app-1:3013/api').replace(/\/$/, '');

    try {
      const response = await fetch(
        `${baseUrl}/salesmanagers/query/field/userId?value=${encodeURIComponent(userId)}`,
        {
          headers: await this.buildInternalAuthHeaders(),
        },
      );
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as { ok?: boolean; data?: Array<Record<string, unknown>> };
      if (payload?.ok !== true || !Array.isArray(payload.data) || payload.data.length === 0) {
        return null;
      }

      const item = payload.data[0] || {};
      return {
        id: String(item.id || '').trim(),
        userId: String(item.userId || userId).trim(),
        managerCode: String(item.managerCode || '').trim() || null,
        approvalStatus: String(item.approvalStatus || '').trim() || null,
      };
    } catch {
      return null;
    }
  }

  private async fetchWalletSnapshot(customerId: string, limit: number): Promise<WalletSnapshot | null> {
    const baseUrl = String(process.env.PAYMENT_SERVICE_URL || 'http://payment-service-app-1:3005').replace(/\/$/, '');

    try {
      const response = await fetch(
        `${baseUrl}/payment-loyalty/wallet/${encodeURIComponent(customerId)}?limit=${encodeURIComponent(String(limit))}`,
        {
          headers: await this.buildInternalAuthHeaders(),
        },
      );
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as { ok?: boolean; data?: Record<string, unknown> };
      if (payload?.ok !== true || !payload.data) {
        return null;
      }

      return {
        wallet: (payload.data.wallet as WalletSnapshot['wallet']) || null,
        latest: Array.isArray(payload.data.latest) ? (payload.data.latest as Array<Record<string, unknown>>) : [],
      };
    } catch {
      return null;
    }
  }

  private flattenReferralTree(node: ReferralTreeNodePayload): ReferralTreeNodePayload[] {
    const children = Array.isArray(node.referrals) ? node.referrals : [];
    return [node, ...children.flatMap((child) => this.flattenReferralTree(child))];
  }

  private mapReferralTreeNode(
    node: ReferralTreeNodePayload,
    customersByUserId: Map<string, Customer>,
    walletByCustomerId: Map<string, WalletSnapshot | null>,
  ): Record<string, unknown> {
    const customer = customersByUserId.get(node.userId) || null;
    const walletSnapshot = customer ? walletByCustomerId.get(customer.id) || null : null;

    return {
      userId: node.userId,
      username: node.username || '',
      email: node.email || '',
      salesManagerId: node.salesManagerId || null,
      managerCode: node.managerCode || null,
      approvalStatus: node.approvalStatus || null,
      depth: Number(node.depth ?? 0),
      customer: customer ? this.mapCustomerSummary(customer) : null,
      wallet: walletSnapshot?.wallet || null,
      referrals: Array.isArray(node.referrals)
        ? node.referrals.map((child) => this.mapReferralTreeNode(child, customersByUserId, walletByCustomerId))
        : [],
    };
  }

  private mapCustomerSummary(customer: Customer): Record<string, unknown> {
    return {
      id: customer.id,
      userId: customer.userId,
      riskLevel: customer.riskLevel,
      externalReference: customer.externalReference || null,
      metadata: customer.metadata || {},
    };
  }

  private async buildInternalAuthHeaders(): Promise<Record<string, string>> {
    const configuredToken = String(process.env.INTERNAL_SERVICE_AUTH_TOKEN || '').trim();
    if (configuredToken) {
      return {
        Authorization: configuredToken.toLowerCase().startsWith('bearer ') ? configuredToken : `Bearer ${configuredToken}`,
      };
    }

    const accessToken = await this.getInternalAccessToken();
    if (!accessToken) {
      return {};
    }

    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  private async getInternalAccessToken(): Promise<string | null> {
    if (this.internalAccessToken && this.internalAccessTokenExpiresAt > Date.now()) {
      return this.internalAccessToken;
    }

    const securityBaseUrl = String(process.env.SECURITY_SERVICE_URL || 'http://security-service-app-1:3015/api').replace(/\/$/, '');
    const identifier = String(process.env.SA_EMAIL || '').trim();
    const password = String(process.env.SA_PWD || '').trim();
    if (!identifier || !password) {
      return null;
    }

    try {
      const response = await fetch(`${securityBaseUrl}/logins/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as { accessToken?: string; expiresAt?: string };
      const accessToken = String(payload.accessToken || '').trim();
      if (!accessToken) {
        return null;
      }

      const expiresAt = payload.expiresAt ? new Date(payload.expiresAt).getTime() : Date.now() + 5 * 60 * 1000;
      this.internalAccessToken = accessToken;
      this.internalAccessTokenExpiresAt = Number.isFinite(expiresAt) ? expiresAt - 15000 : Date.now() + 5 * 60 * 1000;
      return this.internalAccessToken;
    } catch {
      return null;
    }
  }

}



