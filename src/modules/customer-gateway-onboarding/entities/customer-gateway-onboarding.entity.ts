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

import { Column, Entity, OneToOne, JoinColumn, ChildEntity, ManyToOne, OneToMany, ManyToMany, JoinTable, Index, Check, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CreateCustomerGatewayOnboardingDto, UpdateCustomerGatewayOnboardingDto, DeleteCustomerGatewayOnboardingDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { plainToInstance } from 'class-transformer';
import { Customer } from '../../customer/entities/customer.entity';

@Index('idx_customer_gateway_onboarding_code', ['code'], { unique: true })
@Index('idx_customer_gateway_onboarding_customer_gateway', ['customerId', 'gatewayId'], { unique: true })
@Unique('uq_customer_gateway_onboarding_code', ['code'])
@Unique('chk_customer_gateway_onboarding_customer_gateway', ['customerId', 'gatewayId'])
@ChildEntity('customergatewayonboarding')
@ObjectType()
export class CustomerGatewayOnboarding extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de CustomerGatewayOnboarding",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de CustomerGatewayOnboarding", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia CustomerGatewayOnboarding' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de CustomerGatewayOnboarding",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de CustomerGatewayOnboarding", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia CustomerGatewayOnboarding' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código del onboarding',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código del onboarding', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 60, unique: true, comment: 'Código del onboarding' })
  code!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Cliente asociado',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Cliente asociado', nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'Cliente asociado' })
  customerId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Pasarela asociada',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Pasarela asociada', nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'Pasarela asociada' })
  gatewayId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado del onboarding del cliente',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado del onboarding del cliente', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'NOT_STARTED', comment: 'Estado del onboarding del cliente' })
  status!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Versión del flujo de onboarding',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Versión del flujo de onboarding', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 20, comment: 'Versión del flujo de onboarding' })
  onboardingVersion?: string = '';

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de inicio',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de inicio', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de inicio' })
  startedAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de finalización',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de finalización', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de finalización' })
  completedAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de rechazo',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de rechazo', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de rechazo' })
  rejectedAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de expiración',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de expiración', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de expiración' })
  expiresAt?: Date = new Date();

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Motivo del rechazo',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Motivo del rechazo', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 150, comment: 'Motivo del rechazo' })
  rejectionReason?: string = '';

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si requiere revalidación',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si requiere revalidación', nullable: false })
  @Column({ type: 'boolean', nullable: false, default: false, comment: 'Indica si requiere revalidación' })
  requiresRevalidation!: boolean;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Referencia de sesión externa',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Referencia de sesión externa', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 150, comment: 'Referencia de sesión externa' })
  externalSessionReference?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del onboarding',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Metadatos del onboarding', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos del onboarding' })
  metadata?: Record<string, any> = {};

  @ApiProperty({
    type: () => Customer,
    nullable: false,
    description: 'Relación con Customer',
  })
  @Field(() => Customer, { nullable: false })
  @ManyToOne(() => Customer, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  // Referencia externa a PaymentGateway del bounded context payment; se integra vía event-driven sin dependencia ORM directa.

  protected executeDslLifecycle(): void {
    // Rule: approved-onboarding-requires-completion-date
    // Un onboarding aprobado debe registrar fecha de finalización.
    if (!(this.status === 'APPROVED' && !(this.completedAt === undefined || this.completedAt === null || (typeof this.completedAt === 'string' && String(this.completedAt).trim() === '') || (Array.isArray(this.completedAt) && this.completedAt.length === 0) || (typeof this.completedAt === 'object' && !Array.isArray(this.completedAt) && Object.prototype.toString.call(this.completedAt) === '[object Object]' && Object.keys(Object(this.completedAt)).length === 0)))) {
      console.warn('CUST_ONBOARDING_001: Un onboarding aprobado debe tener fecha de finalización');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'customergatewayonboarding';
  }

  // Getters y Setters
  get getName(): string {
    return this.name;
  }
  set setName(value: string) {
    this.name = value;
  }
  get getDescription(): string {
    return this.description;
  }

  // Métodos abstractos implementados
  async create(data: any): Promise<BaseEntity> {
    Object.assign(this, data);
    this.executeDslLifecycle();
    this.modificationDate = new Date();
    return this;
  }
  async update(data: any): Promise<BaseEntity> {
    Object.assign(this, data);
    this.executeDslLifecycle();
    this.modificationDate = new Date();
    return this;
  }
  async delete(id: string): Promise<BaseEntity> {
    this.id = id;
    return this;
  }

  // Método estático para convertir DTOs a entidad con sobrecarga
  static fromDto(dto: CreateCustomerGatewayOnboardingDto): CustomerGatewayOnboarding;
  static fromDto(dto: UpdateCustomerGatewayOnboardingDto): CustomerGatewayOnboarding;
  static fromDto(dto: DeleteCustomerGatewayOnboardingDto): CustomerGatewayOnboarding;
  static fromDto(dto: any): CustomerGatewayOnboarding {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(CustomerGatewayOnboarding, dto);
  }
}
