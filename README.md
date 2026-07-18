# ShipNow API — Pre-entrega Módulo 1

Refactorizacion de los endpoints de **Products** y **Users** utilizando arquitectura de tres capas:

```text
Route → Controller → Service → Repository → Model → MongoDB
```

## Requisitos

- Node.js 20 o superior.
- MongoDB local o una conexión de MongoDB Atlas.

## Instalación y ejecución

1. Instalar dependencias:


2. Copiar `.env.example` como `.env`:


3. Completar las variables del `.env`:


4. Iniciar el proyecto:


## Variables de entorno

La validación está centralizada en `src/config/env.config.js`.


- Roles: `ADMIN`, `USER`.
- Estados de producto: `AVAILABLE`, `OUT_OF_STOCK`.

## Endpoints

### Products

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/products` | Listar productos activos |
| GET | `/api/products/:id` | Obtener un producto |
| POST | `/api/products` | Crear un producto |
| PATCH | `/api/products/:id` | Actualizar un producto |
| DELETE | `/api/products/:id` | Eliminar lógicamente un producto |

Filtros opcionales para el listado: `category`, `status` y `search`.

### Users

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/users` | Listar usuarios activos |
| GET | `/api/users/:id` | Obtener un usuario |
| POST | `/api/users` | Crear un usuario |
| PATCH | `/api/users/:id` | Actualizar un usuario |
| DELETE | `/api/users/:id` | Eliminar lógicamente un usuario |

Filtros opcionales para el listado: `role` y `search`.

## Ejemplos de cuerpos JSON

### Crear producto

```json
{
  "title": "Caja",
  "description": "Caja para envíos",
  "code": "BOX-M",
  "price": 2500,
  "stock": 20,
  "category": "PACKAGING"
}
```

### Crear usuario

```json
{
  "first_name": "Martín",
  "last_name": "Contreras",
  "email": "martin@example.com",
  "password": "clave123",
  "role": "USER"
}
```
