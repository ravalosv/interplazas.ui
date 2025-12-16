# Endpoints: Tipo Ataúd

## Descripción
Gestiona los tipos de ataúd del sistema. Todas las rutas requieren autenticación por JWT y autorización basada en `tipoUsuarioId` con `checkRole([1])`.

- Base: `/api/tipo_ataud`
- Autenticación: `Authorization: Bearer <token>`
- Content-Type: `application/json`
- Formato de respuesta: `{ success: boolean, data?: any, error?: string }`
- Código HTTP: 200 en éxito y error

## Modelo
`TipoAtaud`

```json
{
  "id": number,
  "nombre": string,
  "createdAt": string,
  "updatedAt": string
}
```

## Listar
- Método: `GET`
- Ruta: `/api/tipo_ataud`
- Respuesta 200:
```json
{ "success": true, "data": [ { "id": 1, "nombre": "Estandar" } ] }
```

## Obtener por ID
- Método: `GET`
- Ruta: `/api/tipo_ataud/:id`
- Errores:
```json
{ "success": false, "error": "TIPO_ATAUD_NOT_FOUND" }
```

## Crear
- Método: `POST`
- Ruta: `/api/tipo_ataud`
- Body:
```json
{ "nombre": "Estandar" }
```

## Actualizar
- Método: `PUT`
- Ruta: `/api/tipo_ataud/:id`
- Body:
```json
{ "nombre": "Premium" }
```
- Errores:
```json
{ "success": false, "error": "TIPO_ATAUD_NOT_FOUND" }
```

## Eliminar
- Método: `DELETE`
- Ruta: `/api/tipo_ataud/:id`
- Respuesta:
```json
{ "success": true, "data": { "id": 3 } }
```

## Roles y seguridad
- `checkJwt` y `checkRole([1])`.
