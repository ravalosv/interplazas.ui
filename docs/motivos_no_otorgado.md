# Endpoints: Motivos No Otorgado

## Descripción
Gestiona motivos por los cuales no se otorga el servicio. Autenticación por JWT y `checkRole([1])`.

- Base: `/api/motivos_no_otorgado`
- Autenticación: `Authorization: Bearer <token>`
- Content-Type: `application/json`
- Formato: `{ success, data?, error? }`

## Modelo
`MotivoNoOtorgado`
```json
{ "id": number, "nombre": string, "createdAt": string, "updatedAt": string }
```

## Endpoints
- `GET /api/motivos_no_otorgado`
- `GET /api/motivos_no_otorgado/:id`
- `POST /api/motivos_no_otorgado` body `{"nombre":"Sin cobertura"}`
- `PUT /api/motivos_no_otorgado/:id` body `{"nombre":"Reprogramado"}`
- `DELETE /api/motivos_no_otorgado/:id`

## Errores
```json
{ "success": false, "error": "MOTIVO_NO_OTORGADO_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Seguridad
- `checkJwt` y `checkRole([1])`.
