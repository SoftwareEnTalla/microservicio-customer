/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 *
 * NomencladorListenersModule — registra los listeners on<Nomenclador>Change
 * para todos los nomencladores referenciados por las entidades de este
 * microservicio. Se importa una sola vez desde app.module.ts.
 *
 * Generado por sources/scaffold_nomenclador_listeners.py — NO editar a mano.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { OnCustomerOnboardingStatusChangeListener } from './on-customer-onboarding-status-change.listener';
import { OnRiskLevelChangeListener } from './on-risk-level-change.listener';

@Module({
  imports: [ConfigModule, CqrsModule],
  providers: [
    OnCustomerOnboardingStatusChangeListener,
    OnRiskLevelChangeListener,
  ],
  exports: [
    OnCustomerOnboardingStatusChangeListener,
    OnRiskLevelChangeListener,
  ],
})
export class NomencladorListenersModule {}
