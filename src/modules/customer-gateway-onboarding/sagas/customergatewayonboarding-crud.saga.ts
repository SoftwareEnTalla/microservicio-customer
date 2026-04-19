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


import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import {
  CustomerGatewayOnboardingCreatedEvent,
  CustomerGatewayOnboardingUpdatedEvent,
  CustomerGatewayOnboardingDeletedEvent,
  CustomerGatewayOnboardingStartedEvent,
  CustomerGatewayOnboardingApprovedEvent,
  CustomerGatewayOnboardingRejectedEvent,
  CustomerGatewayOnboardingExpiredEvent,
} from '../events/exporting.event';
import {
  SagaCustomerGatewayOnboardingFailedEvent
} from '../events/customergatewayonboarding-failed.event';
import {
  CreateCustomerGatewayOnboardingCommand,
  UpdateCustomerGatewayOnboardingCommand,
  DeleteCustomerGatewayOnboardingCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class CustomerGatewayOnboardingCrudSaga {
  private readonly logger = new Logger(CustomerGatewayOnboardingCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onCustomerGatewayOnboardingCreated = ($events: Observable<CustomerGatewayOnboardingCreatedEvent>) => {
    return $events.pipe(
      ofType(CustomerGatewayOnboardingCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de CustomerGatewayOnboarding: ${event.aggregateId}`);
        void this.handleCustomerGatewayOnboardingCreated(event);
      }),
      map(() => null),
      map(event => {
        // Ejecutar comandos adicionales si es necesario
        return null;
      })
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onCustomerGatewayOnboardingUpdated = ($events: Observable<CustomerGatewayOnboardingUpdatedEvent>) => {
    return $events.pipe(
      ofType(CustomerGatewayOnboardingUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de CustomerGatewayOnboarding: ${event.aggregateId}`);
        void this.handleCustomerGatewayOnboardingUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onCustomerGatewayOnboardingDeleted = ($events: Observable<CustomerGatewayOnboardingDeletedEvent>) => {
    return $events.pipe(
      ofType(CustomerGatewayOnboardingDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de CustomerGatewayOnboarding: ${event.aggregateId}`);
        void this.handleCustomerGatewayOnboardingDeleted(event);
      }),
      map(() => null),
      map(event => {
        // Ejemplo: Ejecutar comando de compensación
        // return this.commandBus.execute(new CompensateDeleteCommand(...));
        return null;
      })
    );
  };

  @Saga()
  onCustomerGatewayOnboardingStarted = ($events: Observable<CustomerGatewayOnboardingStartedEvent>) => {
    return $events.pipe(
      ofType(CustomerGatewayOnboardingStartedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio CustomerGatewayOnboardingStarted: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onCustomerGatewayOnboardingApproved = ($events: Observable<CustomerGatewayOnboardingApprovedEvent>) => {
    return $events.pipe(
      ofType(CustomerGatewayOnboardingApprovedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio CustomerGatewayOnboardingApproved: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onCustomerGatewayOnboardingRejected = ($events: Observable<CustomerGatewayOnboardingRejectedEvent>) => {
    return $events.pipe(
      ofType(CustomerGatewayOnboardingRejectedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio CustomerGatewayOnboardingRejected: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onCustomerGatewayOnboardingExpired = ($events: Observable<CustomerGatewayOnboardingExpiredEvent>) => {
    return $events.pipe(
      ofType(CustomerGatewayOnboardingExpiredEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio CustomerGatewayOnboardingExpired: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };


  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(CustomerGatewayOnboardingCrudSaga.name)
      .get(CustomerGatewayOnboardingCrudSaga.name),
  })
  private async handleCustomerGatewayOnboardingCreated(event: CustomerGatewayOnboardingCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga CustomerGatewayOnboarding Created completada: ${event.aggregateId}`);
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }


  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(CustomerGatewayOnboardingCrudSaga.name)
      .get(CustomerGatewayOnboardingCrudSaga.name),
  })
  private async handleCustomerGatewayOnboardingUpdated(event: CustomerGatewayOnboardingUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga CustomerGatewayOnboarding Updated completada: ${event.aggregateId}`);
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }


  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(CustomerGatewayOnboardingCrudSaga.name)
      .get(CustomerGatewayOnboardingCrudSaga.name),
  })
  private async handleCustomerGatewayOnboardingDeleted(event: CustomerGatewayOnboardingDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga CustomerGatewayOnboarding Deleted completada: ${event.aggregateId}`);
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaCustomerGatewayOnboardingFailedEvent( error,event));
  }
}
