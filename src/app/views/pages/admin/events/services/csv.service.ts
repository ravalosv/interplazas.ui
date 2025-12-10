// reporte.service.ts
import { Injectable } from '@angular/core';
import { IInvitadoToEventoPayload } from 'src/app/core/interfaces/models/evento.dto';

@Injectable({
  providedIn: 'root',
})
export class CSVService {
  constructor() {}

  private resumenHabitaciones(datos: any[]): string {
    // Definimos los encabezados
    const encabezados = [
      'Nombre Grupo',
      'Tipo Habitación',
      'Total Habitaciones',
      'Habitaciones Disponibles',
    ];

    // Convertimos los encabezados a línea CSV
    let csv = encabezados.join(',') + '\n';

    // Agregamos cada fila de datos
    datos.forEach((fila) => {
      const valores = [
        `"${fila.nombreGrupo}"`,
        `"${fila.tipoHabitacion}"`,
        fila.totalHabitaciones,
        fila.totalHabitacionesDisponibles,
      ];
      csv += valores.join(',') + '\n';
    });

    return csv;
  }

  private resumenMesas(datos: any[]): string {
    // Definimos los encabezados
    const encabezados = [
      'Nombre Grupo',
      'Tipo Mesa',
      'Total Mesas',
      'Mesas Disponibles',
    ];

    // Convertimos los encabezados a línea CSV
    let csv = encabezados.join(',') + '\n';

    // Agregamos cada fila de datos
    datos.forEach((fila) => {
      const valores = [
        `"${fila.nombreGrupo}"`,
        `"${fila.tipoMesa}"`,
        fila.totalMesas,
        fila.totalMesasDisponibles,
      ];
      csv += valores.join(',') + '\n';
    });

    return csv;
  }

  private invitadoPorGrupoEdad(datos: any[]): string {
    // Definimos los encabezados
    const encabezados = ['Grupo', 'Adulto', 'JR', 'Menor', 'Infante'];

    // Convertimos los encabezados a línea CSV
    let csv = encabezados.join(',') + '\n';

    // Agregamos cada fila de datos
    datos.forEach((fila) => {
      const valores = [
        `"${fila.nombre}"`,
        `"${fila.Adulto}"`,
        `"${fila.JR}"`,
        `"${fila.Menor}"`,
        `"${fila.Infante}"`,
      ];
      csv += valores.join(',') + '\n';
    });

    return csv;
  }

  private listaInvitados(datos: IInvitadoToEventoPayload[]): string {
    // Definimos los encabezados
    const encabezados = [
      'Grupo',
      'Unidad Negocio',
      'Filial',
      'Nombre',
      'Edad',
      'Tipo Invitado',
      'Fecha Ingreso',
      'Requiere Transporte',
      'Origen',
      'Destino',
      'Relacionar Con Otro Evento',
      'FechaEstancia Inicio',
      'FechaEstancia Fin',
      'Participa En Rifa',
      'Fecha Hospedaje Inicio',
      'Fecha Hospedaje Fin',
      `Comentarios`,
    ];

    // Convertimos los encabezados a línea CSV
    let csv = encabezados.join(',') + '\n';

    // Agregamos cada fila de datos
    datos.forEach((fila) => {
      const valores = [
        fila.Grupo.nombre,
        fila.UnidadNegocio.nombre,
        fila.Filial.nombre,
        fila.nombre,
        fila.edad,
        fila.tipoInvitado,
        fila.fechaIngreso,
        fila.requiereTransporte ? 'Si' : 'No',
        fila.origen,
        fila.destino,
        fila.relacionarConOtroEvento ? 'Si' : 'No',
        fila.fechaEstanciaInicio,
        fila.fechaEstanciaFin,
        fila.participaEnRifa ? 'Si' : 'No',
        fila.fechaHospedajeInicio,
        fila.fechaHospedajeFin,
        fila.comentarios == null
          ? ''
          : `"${fila.comentarios
              .replace(/[\r\n]+/g, ' ')
              .replace(/[^\w\sáéíóúÁÉÍÓÚñÑüÜ]/g, '')}"`,
      ];
      csv += valores.join(',') + '\n';
    });

    return csv;
  }

  descargarCSV(tipo: Tipo, datos: any[], nombre: string): void {
    try {
      // Convertimos a CSV
      let contenidoCSV: string;
      switch (tipo) {
        case Tipo.ResumenHabitaciones:
          contenidoCSV = this.resumenHabitaciones(datos);
          break;
        case Tipo.ResumenMesas:
          contenidoCSV = this.resumenMesas(datos);
          break;
        case Tipo.ListaInvitados:
          contenidoCSV = this.listaInvitados(datos);
          break;
        case Tipo.InvitadoPorGrupoEdad:
          contenidoCSV = this.invitadoPorGrupoEdad(datos);
          break;
        default:
          throw new Error('Tipo de resumen no soportado');
      }

      // Agregar BOM para UTF-8
      const bom = '\uFEFF';
      const contenidoConBom = bom + contenidoCSV;

      // Creamos el blob
      const blob = new Blob([contenidoConBom], {
        type: 'text/csv;charset=utf-8;',
      });

      // Creamos el link de descarga
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${nombre}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar el archivo CSV:', error);
      throw error;
    }
  }
}
// enum ResumenHabitaciones, ResumenMesas
export enum Tipo {
  ResumenHabitaciones = 'ResumenHabitaciones',
  ResumenMesas = 'ResumenMesas',
  ListaInvitados = 'ListaInvitados',
  InvitadoPorGrupoEdad = 'InvitadoPorGrupoEdad',
}
