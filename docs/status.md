# Endpoints: Status

## Descripción
Catálogo de estados generales. Autenticación por JWT y autorización `checkRole([1])`.

- Base: `/api/status`
- Autenticación: `Authorization: Bearer <token>`
- Content-Type: `application/json`
- Formato: `{ success, data?, error? }`

## Modelo
`Status`
```json
{ "id": number, "nombre": string, "createdAt": string, "updatedAt": string }
```

## Endpoints
- `GET /api/status`
- `GET /api/status/:id`
- `POST /api/status` body `{"nombre":"Activo"}`
- `PUT /api/status/:id` body `{"nombre":"Inactivo"}`
- `DELETE /api/status/:id`

## Errores
```json
{ "success": false, "error": "STATUS_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Seguridad
- `checkJwt` y `checkRole([1])`.
