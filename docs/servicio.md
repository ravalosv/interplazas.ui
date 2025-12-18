# Servicio Endpoints

Base URL: `/api/servicio`

Este recurso gestiona los Servicios.

## Autenticación
Requiere Token JWT en Header `Authorization: Bearer <token>`.

## 1. Listar Servicios
**GET** `/`

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "whatsapp": "5551234567",
      "fo_Filial_otorgante_Id": 2,
      "fo_Filial_Origen_Id": 2,
      "fo_Contrato": "CON-001",
      "fo_Nombre_Titular": "Juan Perez",
      "fo_Nombre_Finado": "Maria Perez",
      "fo_Documento_Cliente_Id": 1,
      "fo_Jefe_Turno_Nombre": "Pedro Jefe",
      "fo_Jefe_Turno_Puesto": "Gerente",
      "fo_Jefe_Turno_WhatsApp": "5559876543",
      "fo_Fecha_Servicio": "2024-05-23T10:00:00.000Z",
      "fori_Status_Contrato_Id": 1,
      "fori_Saldo_Contrato": "5000.00",
      "fori_Acepta_Convenio": true,
      "fori_Otorga_Info_Nombre": "Ana Info",
      "fori_Otorga_Info_Puesto": "Recepcionista",
      "fori_Otorga_Info_Telefono": "5551112233",
      "fo_Contrato_Monto_Recuperado": "1000.00",
      "fo_Contrato_Monto_Convenio": "4000.00",
      "fo_Tipo_Servicio_Id": 1,
      "fo_Tipo_Ataud_Id": 1,
      "exp_Solicitud_Servicio_Status_id": 1,
      "exp_Solicitud_Servicio_File_Name": "solicitud.pdf",
      "exp_Comprobante_Pago_Status_Id": 1,
      "exp_Comprobante_Pago_File_Name": "pago.pdf",
      "exp_Convenio_Status_Id": 1,
      "exp_Convenio_File_Name": "convenio.pdf",
      "exp_Enviado_Grupo_Whats": true,
      "exp_Motivo_De_No_Otorgado_Id": null,
      "exp_Expediente_Completo": "SI",
      "exp_Observaciones": "Ninguna",
      "penalizado": false,
      "Usuario_CapturaId": 1,
      "Fecha_Captura": "2024-05-22T12:00:00.000Z",
      "filialOtorgante": { "id": 2, "nombre": "Filial A" },
      "filialOrigen": { "id": 2, "nombre": "Filial A" },
      "tipoDocumento": { "id": 1, "nombre": "Contrato" },
      "statusContrato": { "id": 1, "nombre": "Activo" },
      "tipoServicio": { "id": 1, "nombre": "Inumación" },
      "tipoAtaud": { "id": 1, "nombre": "Metalico" },
      "solicitudServicioStatus": { "id": 1, "nombre": "Solicitado" },
      "comprobantePagoStatus": { "id": 1, "nombre": "Solicitado" },
      "convenioStatus": { "id": 1, "nombre": "Solicitado" },
      "motivoNoOtorgado": null,
      "usuarioCaptura": { "id": 1, "name": "Admin", "email": "admin@admin.com" }
    }
  ]
}
```

## 1.1. Listar Servicios por Mes y Año
**GET** `/fecha/:year/:month`

**Parámetros de Ruta:**
- `year`: Año (ej. 2024)
- `month`: Mes (1-12)

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "Fecha_Captura": "2024-05-22T00:00:00.000Z",
      ...
    }
  ]
}
```

## 2. Obtener Servicio por ID
**GET** `/:id`

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "whatsapp": "5551234567",
    ...
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Not found"
}
```

## 3. Crear Servicio
**POST** `/`

**Body (JSON):**
```json
{
  "whatsapp": "5551234567",
  "fo_Filial_otorgante_Id": 2,
  "fo_Filial_Origen_Id": 2,
  "fo_Contrato": "CON-001",
  "fo_Nombre_Titular": "Juan Perez",
  "fo_Nombre_Finado": "Maria Perez",
  "fo_Documento_Cliente_Id": 1,
  "fo_Jefe_Turno_Nombre": "Pedro Jefe",
  "fo_Jefe_Turno_Puesto": "Gerente",
  "fo_Jefe_Turno_WhatsApp": "5559876543",
  "fo_Fecha_Servicio": "2024-05-23",
  "fori_Status_Contrato_Id": 1,
  "fori_Saldo_Contrato": 5000.00,
  "fori_Acepta_Convenio": true,
  "fori_Otorga_Info_Nombre": "Ana Info",
  "fori_Otorga_Info_Puesto": "Recepcionista",
  "fori_Otorga_Info_Telefono": "5551112233",
  "fo_Contrato_Monto_Recuperado": 1000.00,
  "fo_Contrato_Monto_Convenio": 4000.00,
  "fo_Tipo_Servicio_Id": 1,
  "fo_Tipo_Ataud_Id": 1,
  "exp_Solicitud_Servicio_Status_id": 1,
  "exp_Solicitud_Servicio_File_Name": "solicitud.pdf",
  "exp_Comprobante_Pago_Status_Id": 1,
  "exp_Comprobante_Pago_File_Name": "pago.pdf",
  "exp_Convenio_Status_Id": 1,
  "exp_Convenio_File_Name": "convenio.pdf",
  "exp_Enviado_Grupo_Whats": true,
  "exp_Motivo_De_No_Otorgado_Id": null,
  "exp_Expediente_Completo": "SI",
  "exp_Observaciones": "Ninguna"
}
```

**Nota:** El campo `penalizado` se calcula automáticamente. Es `true` si la `fo_Fecha_Servicio` es de un mes anterior al actual.

**Respuesta Exitosa (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "whatsapp": "5551234567",
    ...
  }
}
```

## 4. Actualizar Servicio
**PUT** `/:id`

**Body (JSON):**
(Campos a actualizar, igual que en Crear)

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "data": { ... }
}
```

## 5. Actualizar Estado de Penalización
**PATCH** `/:id/penalizado`

**Body (JSON):**
```json
{
  "penalizado": true
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "data": { ... }
}
```

## 6. Eliminar Servicio
**DELETE** `/:id`

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Deleted successfully"
}
```
