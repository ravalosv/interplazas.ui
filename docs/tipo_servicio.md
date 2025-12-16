# Endpoints: Tipo Servicio

## Descripción
Gestiona los tipos de servicio del sistema. Todas las rutas requieren autenticación por JWT y autorización basada en `tipoUsuarioId` con `checkRole([1])`.

- Base: `/api/tipo_servicio`
- Autenticación: `Authorization: Bearer <token>`
- Content-Type: `application/json`
- Formato de respuesta: `{ success: boolean, data?: any, error?: string }`
- Código HTTP: 200 en éxito y error (los errores se codifican en el cuerpo)

## Modelo
`TipoServicio`

```json
{
  "id": number,
  "nombre": string,
  "createdAt": string,
  "updatedAt": string
}
```

## Listar tipos de servicio
- Método: `GET`
- Ruta: `/api/tipo_servicio`
- Headers: `Authorization`
- Respuesta 200:
```json
{
  "success": true,
  "data": [
    { "id": 1, "nombre": "Básico", "createdAt": "2024-01-01T12:00:00.000Z", "updatedAt": "2024-01-01T12:00:00.000Z" }
  ]
}
```
- Errores:
```json
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Obtener por ID
- Método: `GET`
- Ruta: `/api/tipo_servicio/:id`
- Headers: `Authorization`
- Respuesta 200:
```json
{
  "success": true,
  "data": { "id": 1, "nombre": "Básico", "createdAt": "2024-01-01T12:00:00.000Z", "updatedAt": "2024-01-01T12:00:00.000Z" }
}
```
- Errores:
```json
{ "success": false, "error": "TIPO_SERVICIO_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Crear
- Método: `POST`
- Ruta: `/api/tipo_servicio`
- Headers: `Authorization`, `Content-Type: application/json`
- Body:
```json
{ "nombre": "Nuevo Servicio" }
```
- Respuesta 200:
```json
{
  "success": true,
  "data": { "id": 3, "nombre": "Nuevo Servicio", "createdAt": "2024-01-01T12:00:00.000Z", "updatedAt": "2024-01-01T12:00:00.000Z" }
}
```

## Actualizar
- Método: `PUT`
- Ruta: `/api/tipo_servicio/:id`
- Headers: `Authorization`, `Content-Type: application/json`
- Body:
```json
{ "nombre": "Servicio Editado" }
```
- Respuesta 200:
```json
{
  "success": true,
  "data": { "id": 3, "nombre": "Servicio Editado", "createdAt": "2024-01-01T12:00:00.000Z", "updatedAt": "2024-01-01T12:05:00.000Z" }
}
```
- Errores:
```json
{ "success": false, "error": "TIPO_SERVICIO_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Eliminar
- Método: `DELETE`
- Ruta: `/api/tipo_servicio/:id`
- Headers: `Authorization`
- Respuesta 200:
```json
{ "success": true, "data": { "id": 3 } }
```
- Errores:
```json
{ "success": false, "error": "TIPO_SERVICIO_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Roles y seguridad
- Todas las rutas están protegidas por `checkJwt` y `checkRole([1])`.
- Requiere token válido con `tipoUsuarioId` autorizado.

## Fuentes en código
- Rutas: `src/routes/tipo_servicio.route.ts:7–11`
- Controlador: `src/controller/tipo-servicio.controller.ts:1–64`
- Servicio: `src/services/tipo-servicio.service.ts:1–54`
- Interface: `src/data/interfaces/tipo_servicio.interface.ts:1–4`
