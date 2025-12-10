import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CsvService {
  downloadCSV<T extends object>(
    data: T[],
    filename: string = 'data.csv'
  ): void {
    // Convertir el arreglo a CSV
    const csvContent = this.convertArrayToCSV(data);

    // Agregar BOM al contenido CSV
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // Crear un blob con el contenido CSV
    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });

    // Crear un enlace de descarga
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    // Añadir el enlace al documento y simular un clic
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertArrayToCSV<T extends object>(data: T[]): string {
    const capitalizeHeader = (header: string): string => {
      return header
        .split('_')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' ');
    };

    if (data.length === 0) {
      return '';
    }

    // Obtener los encabezados del CSV
    const headers = Object.keys(data[0]).map(capitalizeHeader).join(',');

    // Mapear los datos a una cadena CSV
    const rows = data.map((item) => {
      return Object.values(item)
        .map((value) => `"${value}"`)
        .join(',');
    });

    // Unir los encabezados y las filas
    return [headers, ...rows].join('\n');
  }
}
