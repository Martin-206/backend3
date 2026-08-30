import { expect } from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../src/app.js';
import UserModel from '../src/models/user.model.js';
import OrderModel from '../src/models/order.model.js';

const request = supertest(app);

function expectSuccessResponse(response, statusCode = 200) {
  expect(response.status).to.equal(statusCode);
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.property('status', 'success');
}

function expectErrorResponse(response, statusCode, errorCode) {
  expect(response.status).to.equal(statusCode);
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.property('status', 'error');
  expect(response.body).to.have.property('error').that.is.an('object');
  expect(response.body.error).to.have.property('code', errorCode);
  expect(response.body.error).to.have.property('message').that.is.a('string').and.is.not.empty;
}

async function createTestUser(overrides = {}) {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const userData = {
    first_name: 'Usuario',
    last_name: 'Testing',
    email: `testing-${unique}@shipnow.test`,
    password: 'Test1234',
    role: 'USER',
    ...overrides,
  };

  const response = await request.post('/api/users').send(userData);
  expectSuccessResponse(response, 201);
  expect(response.body).to.have.property('payload').that.is.an('object');
  expect(response.body.payload).to.have.property('_id');
  return response.body.payload;
}

async function createTestOrder(userId, overrides = {}) {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const orderData = {
    tracking_code: `SN-TEST-${unique}`,
    user: userId,
    description: 'Pedido creado por la suite funcional',
    delivery_address: 'Calle Testing 123',
    weight_kg: 2.5,
    status: 'PENDING',
    priority: 'NORMAL',
    ...overrides,
  };

  const response = await request.post('/api/orders').send(orderData);
  expectSuccessResponse(response, 201);
  expect(response.body).to.have.property('payload').that.is.an('object');
  expect(response.body.payload).to.have.property('_id');
  return response.body.payload;
}

async function createTestDelivery(orderId, overrides = {}) {
  const response = await request.post('/api/deliveries').send({
    order: orderId,
    estimated_at: '2026-09-01T18:00:00.000Z',
    notes: 'Entrega de testing',
    ...overrides,
  });
  expectSuccessResponse(response, 201);
  return response.body.payload;
}

describe('ShipNow - Testing funcional', function () {
  describe('Users', function () {
    it('GET /api/users obtiene usuarios con la estructura esperada', async function () {
      await createTestUser();

      const response = await request.get('/api/users');

      expectSuccessResponse(response);
      expect(response.body).to.have.property('payload').that.is.an('array').with.lengthOf(1);
      expect(response.body.payload[0]).to.include.all.keys(
        '_id',
        'first_name',
        'last_name',
        'email',
        'role',
        'active',
      );
      expect(response.body.payload[0]).to.not.have.property('password');
    });
  });

  describe('Orders', function () {
    it('GET /api/orders devuelve un listado correcto', async function () {
      const user = await createTestUser();
      await createTestOrder(user._id);

      const response = await request.get('/api/orders');

      expectSuccessResponse(response);
      expect(response.body.payload).to.be.an('array').with.lengthOf(1);
      expect(response.body.payload[0]).to.include.all.keys(
        '_id',
        'tracking_code',
        'user',
        'description',
        'delivery_address',
        'weight_kg',
        'status',
        'priority',
      );
    });

    it('POST /api/orders crea un pedido válido', async function () {
      const user = await createTestUser();

      const order = await createTestOrder(user._id);

      expect(order.status).to.equal('PENDING');
      expect(order.priority).to.equal('NORMAL');
      expect(order.description).to.equal('Pedido creado por la suite funcional');
      expect(order.user).to.be.an('object');
      expect(order.user).to.have.property('_id', user._id);
    });

    it('GET /api/orders/:id consulta un pedido existente por ID', async function () {
      const user = await createTestUser();
      const order = await createTestOrder(user._id);

      const response = await request.get(`/api/orders/${order._id}`);

      expectSuccessResponse(response);
      expect(response.body.payload).to.be.an('object');
      expect(response.body.payload).to.have.property('_id', order._id);
      expect(response.body.payload).to.have.property('tracking_code', order.tracking_code);
    });

    it('PATCH /api/orders/:id actualiza el estado con un valor permitido', async function () {
      const user = await createTestUser();
      const order = await createTestOrder(user._id);

      const response = await request
        .patch(`/api/orders/${order._id}`)
        .send({ status: 'CONFIRMED' });

      expectSuccessResponse(response);
      expect(response.body.payload).to.have.property('_id', order._id);
      expect(response.body.payload).to.have.property('status', 'CONFIRMED');
    });

    it('POST /api/orders rechaza datos incompletos con el formato global de error', async function () {
      const response = await request.post('/api/orders').send({
        description: 'Pedido incompleto',
      });

      expectErrorResponse(response, 400, 'INVALID_INPUT');
      expect(response.body.error).to.have.property('details').that.is.an('object');
      expect(response.body.error.details).to.have.property('missingFields').that.is.an('array');
    });

    it('GET /api/orders/:id responde 404 cuando el pedido no existe', async function () {
      const nonexistentId = new mongoose.Types.ObjectId().toString();

      const response = await request.get(`/api/orders/${nonexistentId}`);

      expectErrorResponse(response, 404, 'ORDER_NOT_FOUND');
    });

    it('PATCH /api/orders/:id rechaza un estado inválido', async function () {
      const user = await createTestUser();
      const order = await createTestOrder(user._id);

      const response = await request
        .patch(`/api/orders/${order._id}`)
        .send({ status: 'INVALID_STATUS' });

      expectErrorResponse(response, 400, 'INVALID_ORDER_STATUS');
      expect(response.body.error.details).to.have.property('allowedValues').that.is.an('array');
    });
  });

  describe('Mocks', function () {
    it('GET /api/mocks genera una vista previa controlada sin persistir datos', async function () {
      const response = await request.get('/api/mocks?users=2&drivers=1&orders=3');

      expectSuccessResponse(response);
      expect(response.body.payload).to.include.all.keys(
        'users',
        'drivers',
        'orders',
        'deliveries',
      );
      expect(response.body.payload.users).to.have.lengthOf(3);
      expect(response.body.payload.drivers).to.have.lengthOf(1);
      expect(response.body.payload.orders).to.have.lengthOf(3);
      expect(response.body.payload.deliveries).to.have.lengthOf(3);
      expect(await UserModel.countDocuments()).to.equal(0);
      expect(await OrderModel.countDocuments()).to.equal(0);
    });

    it('POST /api/mocks/generate-data inserta datos de prueba controlados', async function () {
      const response = await request.post('/api/mocks/generate-data').send({
        users: 2,
        drivers: 1,
        orders: 3,
      });

      expectSuccessResponse(response, 201);
      expect(response.body).to.have.property('message').that.is.a('string');
      expect(response.body.payload).to.deep.equal({
        users: 3,
        drivers: 1,
        orders: 3,
        deliveries: 3,
      });
      expect(await UserModel.countDocuments()).to.equal(3);
      expect(await OrderModel.countDocuments()).to.equal(3);
    });

    it('GET /api/mocks rechaza cantidades inválidas', async function () {
      const response = await request.get('/api/mocks?users=-1&drivers=1&orders=1');

      expectErrorResponse(response, 400, 'INVALID_MOCK_COUNTS');
      expect(response.body.error).to.have.property('details').that.is.an('object');
    });
  });

  describe('Logger y Swagger', function () {
    it('GET /api/logger/test responde correctamente y declara los niveles probados', async function () {
      const response = await request.get('/api/logger/test');

      expectSuccessResponse(response);
      expect(response.body).to.have.property('message').that.is.a('string');
      expect(response.body.payload).to.have.property('levels').that.is.an('array');
      expect(response.body.payload.levels).to.include.members([
        'debug',
        'http',
        'info',
        'warning',
        'error',
        'fatal',
      ]);
    });

    it('GET /api/docs/ permite acceder a Swagger UI', async function () {
      const response = await request.get('/api/docs/');

      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.match(/text\/html/);
      expect(response.text).to.include('Swagger UI');
    });
  });

  describe('Uploads - Módulo 7', function () {
    it('POST /api/users/:id/documents carga un documento válido y guarda sus metadatos', async function () {
      const user = await createTestUser();
      const response = await request
        .post(`/api/users/${user._id}/documents`)
        .field('document_type', 'IDENTITY')
        .attach('file', Buffer.from('%PDF-1.4 archivo de prueba'), { filename: 'dni.pdf', contentType: 'application/pdf' });

      expectSuccessResponse(response, 201);
      expect(response.body).to.have.property('message').that.is.a('string');
      expect(response.body.payload.documents).to.be.an('array').with.lengthOf(1);
      const document = response.body.payload.documents[0];
      expect(document).to.include.all.keys('original_name', 'stored_name', 'path', 'mime_type', 'size', 'document_type', 'uploaded_at');
      expect(document.original_name).to.equal('dni.pdf');
      expect(document.mime_type).to.equal('application/pdf');
      expect(document.document_type).to.equal('IDENTITY');
      expect(document.path).to.match(/^uploads\/user-documents\//);
    });

    it('rechaza la carga de documento cuando falta el archivo', async function () {
      const user = await createTestUser();
      const response = await request
        .post(`/api/users/${user._id}/documents`)
        .field('document_type', 'IDENTITY');
      expectErrorResponse(response, 400, 'FILE_REQUIRED');
      expect(response.body.error.details).to.have.property('expectedField', 'file');
    });

    it('rechaza un tipo de documento inválido', async function () {
      const user = await createTestUser();
      const response = await request
        .post(`/api/users/${user._id}/documents`)
        .field('document_type', 'INVENTADO')
        .attach('file', Buffer.from('%PDF-1.4 archivo de prueba'), { filename: 'doc.pdf', contentType: 'application/pdf' });
      expectErrorResponse(response, 400, 'INVALID_DOCUMENT_TYPE');
      expect(response.body.error.details.allowedValues).to.be.an('array').and.include('IDENTITY');
    });

    it('rechaza un tipo MIME no permitido', async function () {
      const user = await createTestUser();
      const response = await request
        .post(`/api/users/${user._id}/documents`)
        .field('document_type', 'IDENTITY')
        .attach('file', Buffer.from('texto'), { filename: 'archivo.txt', contentType: 'text/plain' });
      expectErrorResponse(response, 400, 'INVALID_FILE_TYPE');
    });

    it('POST /api/deliveries/:id/proofs carga un comprobante válido', async function () {
      const user = await createTestUser();
      const order = await createTestOrder(user._id);
      const delivery = await createTestDelivery(order._id);
      const response = await request
        .post(`/api/deliveries/${delivery._id}/proofs`)
        .attach('file', Buffer.from('imagen de prueba'), { filename: 'comprobante.png', contentType: 'image/png' });
      expectSuccessResponse(response, 201);
      expect(response.body.payload.proofs).to.be.an('array').with.lengthOf(1);
      expect(response.body.payload.proofs[0]).to.have.property('document_type', 'DELIVERY_PROOF');
    });

    it('comprobante sobre una entrega inexistente responde 404 con formato global', async function () {
      const nonexistentId = new mongoose.Types.ObjectId().toString();
      const response = await request
        .post(`/api/deliveries/${nonexistentId}/proofs`)
        .attach('file', Buffer.from('%PDF-1.4 comprobante'), { filename: 'comprobante.pdf', contentType: 'application/pdf' });
      expectErrorResponse(response, 404, 'DELIVERY_NOT_FOUND');
    });
  });

  describe('Errores globales', function () {
    it('una ruta inexistente responde 404 con ROUTE_NOT_FOUND', async function () {
      const response = await request.get('/api/ruta-inexistente-testing');

      expectErrorResponse(response, 404, 'ROUTE_NOT_FOUND');
      expect(response.body.error).to.have.property('details').that.is.an('object');
      expect(response.body.error.details).to.include({
        method: 'GET',
        path: '/api/ruta-inexistente-testing',
      });
    });
  });
});
