# Endpoints: Auth

## Descripción
Autenticación y gestión de usuarios. Algunas rutas requieren autenticación por JWT y rol `admin`.

- Base: `/api/auth`
- Autenticación:
  - `POST /login`: no requiere token
  - `POST /renew-token/`: no requiere token
  - `POST /register`: requiere `Authorization: Bearer <token>` y rol `admin`
  - `PUT /change-password`: requiere `Authorization: Bearer <token>` y rol `admin`
- Content-Type: `application/json`
- Formato de respuesta estándar: `{ success: boolean, data?: any, error?: string }`
- Códigos HTTP:
  - Generalmente `200` en éxito y error (los errores se codifican en el cuerpo)
  - `POST /login` devuelve `401` con texto plano `"USER_PASSWORD_WRONG"` cuando credenciales son inválidas

## Modelo de Usuario (referencia)
Estructura principal devuelta por el servicio sin el campo `password`:
```json
{
  "id": number,
  "name": string,
  "email": string,
  "role": "admin" | "repre" | "reports",
  "tipoUsuarioId": number,
  "filialId": number | null,
  "isDisabled": boolean,
  "createdByUserId": number | null,
  "createdAt": string, // ISO
  "updatedAt": string  // ISO
}
```

## Login
- Método: `POST`
- Ruta: `/api/auth/login`
- Headers: `Content-Type: application/json`
- Body:
```json
{ "email": "user@example.com", "password": "******" }
```
- Respuesta 200:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@admin.com",
      "role": "admin",
      "tipoUsuarioId": 1,
      "filialId": null,
      "isDisabled": false,
      "createdByUserId": 1,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    "token": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```
- Error credenciales inválidas:
  - Código HTTP: `401`
  - Body (texto plano): `USER_PASSWORD_WRONG`
- Otros errores:
```json
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Registrar usuario
- Método: `POST`
- Ruta: `/api/auth/register`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Requiere rol: `admin`
- Body:
```json
{
  "email": "newuser@example.com",
  "password": "******",
  "name": "Nuevo Usuario",
  "role": "repre",
  "tipoUsuarioId": 1,
  "filialId": null
}
```
- Respuesta 200:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Nuevo Usuario",
    "email": "newuser@example.com",
    "role": "repre",
    "tipoUsuarioId": 1,
    "filialId": null,
    "isDisabled": false,
    "createdByUserId": 1,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```
- Errores:
```json
{ "success": false, "error": "USER_ALREADY_EXISTS" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Cambiar contraseña
- Método: `PUT`
- Ruta: `/api/auth/change-password`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Requiere rol: `admin`
- Body:
```json
{ "userId": 3, "newPassword": "newpass123" }
```
- Respuesta 200:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Usuario",
    "email": "user@example.com",
    "role": "repre",
    "tipoUsuarioId": 1,
    "filialId": null,
    "isDisabled": false,
    "createdByUserId": 1,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:05:00.000Z"
  }
}
```
- Errores:
```json
{ "success": false, "error": "USER_NOT_FOUND" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Renovar token
- Método: `POST`
- Ruta: `/api/auth/renew-token/`  <!-- nota: incluye barra final -->
- Headers: `Content-Type: application/json`
- Body:
```json
{ "refreshToken": "<jwt>" }
```
- Respuesta 200:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@admin.com",
      "role": "admin",
      "tipoUsuarioId": 1,
      "filialId": null,
      "isDisabled": false,
      "createdByUserId": 1,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    "token": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```
- Errores:
```json
{ "success": false, "error": "invalid token" }
{ "success": false, "error": "invalid token: user not found" }
{ "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

## Roles y seguridad
- `POST /register` y `PUT /change-password` están protegidas por `checkJwt` y `checkRole(["admin"])`.
- `POST /login` y `POST /renew-token/` no requieren token.

## Referencias en código
- Rutas: `src/routes/auth.route.ts`
- Controlador: `src/controller/auth.controller.ts`
- Servicio: `src/services/auth.service.ts`
