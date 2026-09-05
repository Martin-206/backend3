# Cambios Módulo 8

- Paginación en Users, Orders y Deliveries (`page`, `limit`, máximo 100).
- Metadatos de paginación en las respuestas sin romper el `payload` array existente.
- `LOG_LEVEL` configurable y validado por entorno.
- `.env.production.example` agregado.
- Health check ampliado con entorno, uptime y timestamp.
- Mocks y logger test deshabilitados en producción; Swagger y health permanecen disponibles.
- Dockerfile y .dockerignore agregados.
- Swagger actualizado con paginación y `/health`.
- Tests funcionales para paginación, límite inválido y health check.
- README actualizado con ejecución local, testing, producción y Docker.

## Importante al actualizar desde Módulo 7

Agregar `LOG_LEVEL` a los archivos locales que ya existan:

```env
# .env
LOG_LEVEL=debug

# .env.test
LOG_LEVEL=warning
```
