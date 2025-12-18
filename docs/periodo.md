# Periodo Endpoints

Base URL: `/api/periodo`

Este recurso gestiona los Periodos contables/administrativos. Los periodos se crean automáticamente al registrar servicios, pero pueden ser cerrados o reabiertos manualmente.

## Autenticación
Requiere Token JWT en Header `Authorization: Bearer <token>`.

## 1. Listar Periodos
**GET** `/`

Devuelve la lista de todos los periodos registrados, ordenados por año y mes descendente.

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "mes": 1,
      "anio": 2025,
      "nombre": "ENERO 2025",
      "activo": true,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "mes": 12,
      "anio": 2024,
      "nombre": "DICIEMBRE 2024",
      "activo": false,
      "createdAt": "2024-12-15T10:00:00.000Z",
      "updatedAt": "2025-01-05T10:00:00.000Z"
    }
  ]
}
```

## 2. Cerrar Periodo
**PATCH** `/:id/cerrar`

Cierra un periodo existente, impidiendo la creación o modificación de servicios asociados a este.

**Parámetros URL:**
*   `id` (integer): ID del periodo.

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Periodo cerrado exitosamente",
  "data": {
    "id": 1,
    "mes": 1,
    "anio": 2025,
    "nombre": "ENERO 2025",
    "activo": false,
    ...
  }
}
```

**Respuesta de Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Periodo not found"
}
```

## 3. Abrir Periodo
**PATCH** `/:id/abrir`

Reabre un periodo previamente cerrado, permitiendo nuevamente la gestión de servicios en él.

**Parámetros URL:**
*   `id` (integer): ID del periodo.

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Periodo abierto exitosamente",
  "data": {
    "id": 1,
    "mes": 1,
    "anio": 2025,
    "nombre": "ENERO 2025",
    "activo": true,
    ...
  }
}
```
