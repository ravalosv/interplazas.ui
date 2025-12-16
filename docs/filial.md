# Endpoints: Filial

## Descripción
Gestiona las filiales del sistema. Todas las rutas requieren autenticación por JWT y rol `admin`.

- Base: `/api/filial`
- Autenticación: `Authorization: Bearer <token>`
- Content-Type: `application/json`
- Formato de respuesta: `{ success: boolean, data?: any, error?: string }`
- Código HTTP: 200 en éxito y error (los errores se codifican en el cuerpo)

## Modelo
`Filial`

```json
{
  "id": number,
  "nombre": string,
  "extranjera": boolean,
  "createdAt": string, // ISO
  "updatedAt": string  // ISO
}
```

## Listar filiales
- Método: `GET`
- Ruta: `/api/filial`
- Headers: `Authorization`
- Parámetros: ninguno
- Respuesta 200:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Filial Central",
      "extranjera": false,
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
- Ruta: `/api/filial/:id`
- Headers: `Authorization`
- Path params:
  - `id` (number) requerido
- Respuesta 200:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Filial Central",
    "extranjera": false,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```
- Errores:
```json
{ "success": false, "error": "FILIAL_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Crear
- Método: `POST`
- Ruta: `/api/filial`
- Headers: `Authorization`, `Content-Type: application/json`
- Body:
```json
{ "nombre": "Nueva Filial", "extranjera": false }
```
- Respuesta 200:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "nombre": "Nueva Filial",
    "extranjera": false,
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
- Ruta: `/api/filial/:id`
- Headers: `Authorization`, `Content-Type: application/json`
- Path params:
  - `id` (number) requerido
- Body:
```json
{ "nombre": "Filial Editada", "extranjera": true }
```
- Respuesta 200:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "nombre": "Filial Editada",
    "extranjera": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:05:00.000Z"
  }
}
```
- Errores:
```json
{ "success": false, "error": "FILIAL_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Eliminar
- Método: `DELETE`
- Ruta: `/api/filial/:id`
- Headers: `Authorization`
- Path params:
  - `id` (number) requerido
- Respuesta 200:
```json
{ "success": true, "data": { "id": 3 } }
```
- Errores:
```json
{ "success": false, "error": "FILIAL_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Roles y seguridad
- Todas las rutas están protegidas por `checkJwt` y `checkRole(["admin"])`.
- Se requiere token válido y rol `admin`.
