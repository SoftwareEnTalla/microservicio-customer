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

import { InputType, Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
  ValidateNested,
} from 'class-validator';




@InputType()
export class BaseCustomerGatewayOnboardingDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateCustomerGatewayOnboarding',
    example: 'Nombre de instancia CreateCustomerGatewayOnboarding',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateCustomerGatewayOnboardingDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateCustomerGatewayOnboarding).',
    example: 'Fecha de creación de la instancia (CreateCustomerGatewayOnboarding).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateCustomerGatewayOnboarding).',
    example: 'Fecha de actualización de la instancia (CreateCustomerGatewayOnboarding).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateCustomerGatewayOnboarding).',
    example:
      'Usuario que realiza la creación de la instancia (CreateCustomerGatewayOnboarding).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateCustomerGatewayOnboarding).',
    example: 'Estado de activación de la instancia (CreateCustomerGatewayOnboarding).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código del onboarding',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código del onboarding', nullable: false })
  code!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Cliente asociado',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Cliente asociado', nullable: false })
  customerId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Pasarela asociada',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Pasarela asociada', nullable: false })
  gatewayId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado del onboarding del cliente',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado del onboarding del cliente', nullable: false })
  status!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Versión del flujo de onboarding',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Versión del flujo de onboarding', nullable: true })
  onboardingVersion?: string = '';

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de inicio',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de inicio', nullable: true })
  startedAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de finalización',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de finalización', nullable: true })
  completedAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de rechazo',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de rechazo', nullable: true })
  rejectedAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de expiración',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de expiración', nullable: true })
  expiresAt?: Date = new Date();

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Motivo del rechazo',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Motivo del rechazo', nullable: true })
  rejectionReason?: string = '';

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si requiere revalidación',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si requiere revalidación', nullable: false })
  requiresRevalidation!: boolean;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Referencia de sesión externa',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Referencia de sesión externa', nullable: true })
  externalSessionReference?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del onboarding',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Metadatos del onboarding', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseCustomerGatewayOnboardingDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class CustomerGatewayOnboardingDto extends BaseCustomerGatewayOnboardingDto {
  // Propiedades específicas de la clase CustomerGatewayOnboardingDto en cuestión

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador único de la instancia',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CustomerGatewayOnboardingDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CustomerGatewayOnboardingDto>): CustomerGatewayOnboardingDto {
    const instance = new CustomerGatewayOnboardingDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class CustomerGatewayOnboardingValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => CustomerGatewayOnboardingDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => CustomerGatewayOnboardingDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class CustomerGatewayOnboardingOutPutDto extends BaseCustomerGatewayOnboardingDto {
  // Propiedades específicas de la clase CustomerGatewayOnboardingOutPutDto en cuestión

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador único de la instancia',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CustomerGatewayOnboardingOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CustomerGatewayOnboardingOutPutDto>): CustomerGatewayOnboardingOutPutDto {
    const instance = new CustomerGatewayOnboardingOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateCustomerGatewayOnboardingDto extends BaseCustomerGatewayOnboardingDto {
  // Propiedades específicas de la clase CreateCustomerGatewayOnboardingDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateCustomerGatewayOnboarding a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateCustomerGatewayOnboardingDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateCustomerGatewayOnboardingDto>): CreateCustomerGatewayOnboardingDto {
    const instance = new CreateCustomerGatewayOnboardingDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateCustomerGatewayOnboardingDto {
  @ApiProperty({
    type: () => String,
    description: 'Identificador',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  @ApiProperty({
    type: () => CreateCustomerGatewayOnboardingDto,
    description: 'Instancia CreateCustomerGatewayOnboarding o UpdateCustomerGatewayOnboarding',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateCustomerGatewayOnboardingDto, { nullable: true })
  input?: CreateCustomerGatewayOnboardingDto | UpdateCustomerGatewayOnboardingDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteCustomerGatewayOnboardingDto {
  // Propiedades específicas de la clase DeleteCustomerGatewayOnboardingDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteCustomerGatewayOnboarding a eliminar',
    default: '',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id: string = '';

  @ApiProperty({
    type: () => String,
    description: 'Lista de identificadores de instancias a eliminar',
    example:
      'Se proporciona una lista de identificadores de DeleteCustomerGatewayOnboarding a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateCustomerGatewayOnboardingDto extends BaseCustomerGatewayOnboardingDto {
  // Propiedades específicas de la clase UpdateCustomerGatewayOnboardingDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateCustomerGatewayOnboarding a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateCustomerGatewayOnboardingDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateCustomerGatewayOnboardingDto>): UpdateCustomerGatewayOnboardingDto {
    const instance = new UpdateCustomerGatewayOnboardingDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 

