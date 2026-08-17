import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './index.js';
import {
  DELIVERY_STATUS,
  ORDER_PRIORITY,
  ORDER_STATUS,
  USER_ROLES,
} from '../constants/index.js';

const schemas = {
  User: {
    type: 'object',
    description: 'Usuario público. La contraseña nunca se devuelve en las respuestas.',
    properties: {
      _id: { type: 'string', example: '66c1234567890abcdef12345' },
      first_name: { type: 'string', example: 'Martín' },
      last_name: { type: 'string', example: 'Contreras' },
      email: { type: 'string', format: 'email', example: 'martin@shipnow.test' },
      role: { type: 'string', enum: Object.values(USER_ROLES), example: USER_ROLES.USER },
      active: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  UserCreateRequest: {
    type: 'object',
    required: ['first_name', 'last_name', 'email', 'password'],
    properties: {
      first_name: { type: 'string', example: 'Ana' },
      last_name: { type: 'string', example: 'Pérez' },
      email: { type: 'string', format: 'email', example: 'ana.perez@shipnow.test' },
      password: { type: 'string', format: 'password', example: 'Clave1234!' },
      role: { type: 'string', enum: Object.values(USER_ROLES), example: USER_ROLES.USER },
    },
  },

  UserUpdateRequest: {
    type: 'object',
    minProperties: 1,
    properties: {
      first_name: { type: 'string', example: 'Ana María' },
      last_name: { type: 'string', example: 'Pérez' },
      email: { type: 'string', format: 'email', example: 'ana.nueva@shipnow.test' },
      password: { type: 'string', format: 'password', example: 'NuevaClave123!' },
      role: { type: 'string', enum: Object.values(USER_ROLES), example: USER_ROLES.ADMIN },
    },
  },

  OrderItem: {
    type: 'object',
    description: 'Schema reutilizable para un item de pedido. El modelo actual de ShipNow no expone items como campo persistido.',
    properties: {
      description: { type: 'string', example: 'Paquete de indumentaria' },
      quantity: { type: 'integer', minimum: 1, example: 1 },
      weight_kg: { type: 'number', format: 'float', minimum: 0.1, example: 2.5 },
    },
  },

  Order: {
    type: 'object',
    properties: {
      tracking_code: { type: 'string', example: 'SN-20260817-001' },
      user: { type: 'string', description: 'Id del usuario asociado.' },
      description: { type: 'string', example: 'Repuestos mecánicos' },
      delivery_address: { type: 'string', example: 'Av. San Martín 1250' },
      weight_kg: { type: 'number', format: 'float', minimum: 0.1, example: 4.75 },
      status: { type: 'string', enum: Object.values(ORDER_STATUS), example: ORDER_STATUS.PENDING },
      priority: { type: 'string', enum: Object.values(ORDER_PRIORITY), example: ORDER_PRIORITY.NORMAL },
      active: { type: 'boolean', example: true },
    },
  },

  Delivery: {
    type: 'object',
    properties: {
      order: { type: 'string', description: 'Id del pedido asociado.' },
      driver: { type: 'string', nullable: true, description: 'Id del repartidor, si fue asignado.' },
      status: { type: 'string', enum: Object.values(DELIVERY_STATUS), example: DELIVERY_STATUS.PENDING },
      estimated_at: { type: 'string', format: 'date-time' },
      delivered_at: { type: 'string', format: 'date-time', nullable: true },
      notes: { type: 'string', example: 'Entrega generada por el módulo de mocking.' },
    },
  },

  MockCounts: {
    type: 'object',
    properties: {
      users: { type: 'integer', minimum: 0, maximum: 100, default: 10, example: 10 },
      drivers: { type: 'integer', minimum: 0, maximum: 50, default: 5, example: 5 },
      orders: { type: 'integer', minimum: 0, maximum: 200, default: 20, example: 20 },
    },
  },

  SuccessResponse: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', example: 'success' },
      message: { type: 'string', example: 'Operación realizada correctamente.' },
      payload: { nullable: true },
    },
  },

  ErrorResponse: {
    type: 'object',
    required: ['status', 'error'],
    properties: {
      status: { type: 'string', example: 'error' },
      error: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: { type: 'string', example: 'INVALID_INPUT' },
          message: { type: 'string', example: 'Los datos enviados no son válidos.' },
          details: { nullable: true },
          stack: {
            type: 'string',
            description: 'Solo aparece en NODE_ENV=development cuando existe stack técnico.',
          },
        },
      },
    },
  },
};

const responses = {
  BadRequestResponse: {
    description: 'Datos inválidos o regla de validación incumplida.',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
  },
  NotFoundResponse: {
    description: 'Recurso o ruta no encontrada.',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
  },
  ConflictResponse: {
    description: 'Conflicto por recurso duplicado.',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
  },
  InternalErrorResponse: {
    description: 'Error interno inesperado del servidor.',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
  },
  InvalidMockCountsResponse: {
    description: 'Cantidad de mocks inválida, fuera de rango, no entera o con campos desconocidos.',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          status: 'error',
          error: {
            code: 'INVALID_MOCK_COUNTS',
            message: 'Las cantidades solicitadas para los mocks no son válidas.',
            details: { field: 'users', received: '-1', min: 0, max: 100 },
          },
        },
      },
    },
  },
};

const swaggerSpecs = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShipNow API',
      version: '1.5.0',
      description:
        'API académica de ShipNow. Documenta usuarios, generación de pedidos y entregas mediante mocks y el endpoint interno de validación del logger.',
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Servidor local de desarrollo',
      },
    ],
    tags: [
      { name: 'Users', description: 'Gestión de usuarios.' },
      { name: 'Orders', description: 'Pedidos generados actualmente mediante el módulo de mocks.' },
      { name: 'Deliveries', description: 'Entregas generadas actualmente mediante el módulo de mocks.' },
      { name: 'Mocks', description: 'Generación y carga controlada de datos de prueba.' },
      { name: 'Logger', description: 'Herramienta interna para validar los niveles del logger.' },
    ],
    components: {
      schemas,
      responses,
    },
  },
  apis: ['./src/docs/**/*.yaml'],
});

export default swaggerSpecs;
