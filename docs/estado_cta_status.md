# Endpoints: Estado Cta Status

## Descripción
Catálogo de estados de cuenta. Autenticación por JWT y autorización `checkRole([1])` basada en `tipoUsuarioId`.

- Base: `/api/estado_cta_status`
- Autenticación: `Authorization: Bearer <token>`
- Content-Type: `application/json`
- Formato: `{ success, data?, error? }`

## Modelo
`EstadoCtaStatus`
```json
{ "id": number, "nombre": string, "createdAt": string, "updatedAt": string }
```

## Endpoints
- `GET /api/estado_cta_status`
- `GET /api/estado_cta_status/:id`
- `POST /api/estado_cta_status` body `{"nombre":"En mora"}`
- `PUT /api/estado_cta_status/:id` body `{"nombre":"Al día"}`
- `DELETE /api/estado_cta_status/:id`

## Errores
```json
{ "success": false, "error": "ESTADO_CTA_STATUS_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Seguridad
- `checkJwt` y `checkRole([1])`.
