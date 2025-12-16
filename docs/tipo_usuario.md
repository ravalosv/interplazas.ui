# Endpoints: Tipo Usuario

## Descripción
Gestiona los tipos de usuario del sistema. Todas las rutas requieren autenticación por JWT y rol `admin`.

- Base: `/api/tipo_usuario`
- Autenticación: `Authorization: Bearer <token>`
- Content-Type: `application/json`
- Formato de respuesta estándar: `{ success: boolean, data?: any, error?: string }`
- Código HTTP: 200 en éxito y error (los errores se codifican en el cuerpo)

## Modelo
`TipoUsuario`

```json
{
  "id": number,
  "nombre": string,
  "createdAt": string, // ISO
  "updatedAt": string  // ISO
}
```

## Listar tipos
- Método: `GET`
- Ruta: `/api/tipo_usuario`
- Headers: `Authorization`
- Parámetros: ninguno
- Respuesta 200:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Admin",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```
- Posibles errores:
```json
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Obtener por ID
- Método: `GET`
- Ruta: `/api/tipo_usuario/:id`
- Headers: `Authorization`
- Path params:
  - `id` (number) requerido
- Respuesta 200:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Admin",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```
- Errores:
```json
{ "success": false, "error": "TIPO_USUARIO_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Crear
- Método: `POST`
- Ruta: `/api/tipo_usuario`
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
- Ruta: `/api/tipo_usuario/:id`
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
{ "success": false, "error": "TIPO_USUARIO_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Eliminar
- Método: `DELETE`
- Ruta: `/api/tipo_usuario/:id`
- Headers: `Authorization`
- Path params:
  - `id` (number) requerido
- Respuesta 200:
```json
{ "success": true, "data": { "id": 3 } }
```
- Errores:
```json
{ "success": false, "error": "TIPO_USUARIO_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Roles y seguridad
- Todas las rutas están protegidas por `checkJwt` y `checkRole(["admin"])`.
- Se requiere token válido y rol `admin`.
