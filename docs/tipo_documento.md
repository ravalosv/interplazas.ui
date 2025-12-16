# Endpoints: Tipo Documento

## Descripción
Gestiona los tipos de documento del sistema. Todas las rutas requieren autenticación por JWT y autorización basada en `tipoUsuarioId` con `checkRole([1])`.

- Base: `/api/tipo_documento`
- Autenticación: `Authorization: Bearer <token>`
- Content-Type: `application/json`
- Formato de respuesta: `{ success: boolean, data?: any, error?: string }`
- Código HTTP: 200 en éxito y error (los errores se codifican en el cuerpo)

## Modelo
`TipoDocumento`

```json
{
  "id": number,
  "nombre": string,
  "createdAt": string, 
  "updatedAt": string  
}
```

## Listar tipos de documento
- Método: `GET`
- Ruta: `/api/tipo_documento`
- Headers: `Authorization`
- Parámetros: ninguno
- Respuesta 200:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "DNI",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```
- Errores:
```json
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Obtener por ID
- Método: `GET`
- Ruta: `/api/tipo_documento/:id`
- Headers: `Authorization`
- Path params:
  - `id` (number) requerido
- Respuesta 200:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "DNI",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```
- Errores:
```json
{ "success": false, "error": "TIPO_DOCUMENTO_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Crear
- Método: `POST`
- Ruta: `/api/tipo_documento`
- Headers: `Authorization`, `Content-Type: application/json`
- Body:
```json
{ "nombre": "Nuevo Tipo" }
```
- Respuesta 200:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "nombre": "Nuevo Tipo",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```
- Errores:
```json
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Actualizar
- Método: `PUT`
- Ruta: `/api/tipo_documento/:id`
- Headers: `Authorization`, `Content-Type: application/json`
- Path params:
  - `id` (number) requerido
- Body:
```json
{ "nombre": "Tipo Editado" }
```
- Respuesta 200:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "nombre": "Tipo Editado",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:05:00.000Z"
  }
}
```
- Errores:
```json
{ "success": false, "error": "TIPO_DOCUMENTO_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Eliminar
- Método: `DELETE`
- Ruta: `/api/tipo_documento/:id`
- Headers: `Authorization`
- Path params:
  - `id` (number) requerido
- Respuesta 200:
```json
{ "success": true, "data": { "id": 3 } }
```
- Errores:
```json
{ "success": false, "error": "TIPO_DOCUMENTO_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Roles y seguridad
- Todas las rutas están protegidas por `checkJwt` y `checkRole([1])`.
- Se requiere token válido y `tipoUsuarioId` autorizado.

## Fuentes en código
- Rutas: `src/routes/tipo_documento.route.ts:7–11`
- Controlador: `src/controller/tipo-documento.controller.ts:1–64`
- Servicio: `src/services/tipo-documento.service.ts:1–54`
- Interface: `src/data/interfaces/tipo_documento.interface.ts:1–4`
- Payload de respuesta: `src/data/payloads/api-return.payload.ts:1–5`
