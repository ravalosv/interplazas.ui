import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { CedulaPayload } from '../interfaces/payloads/cedula.payload';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { DatePipe, DecimalPipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CedulaService {
  private baseUrl = environment.apiUrl;
  private datePipe = new DatePipe('en-US');
  private decimalPipe = new DecimalPipe('en-US');

  constructor(private http: HttpClient) {}

  getByPeriodo(periodoId: number) {
    const url = `${this.baseUrl}/periodo/${periodoId}/cedulas`;
    return this.http
      .get<ApiReturn<CedulaPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/periodo/cedulas/${id}`;
    return this.http
      .get<ApiReturn<CedulaPayload>>(url)
      .pipe(map((ret) => ret));
  }

  exportExcel(id: number) {
    this.getById(id).subscribe({
      next: (ret) => {
        if (ret.success && ret.data) {
          this.generateExcelFromTemplate(ret.data);
        }
      },
      error: (err) => {
        console.error('Error fetching cedula for export', err);
      }
    });
  }

  private generateExcelFromTemplate(cedula: CedulaPayload) {
    const templatePath = 'assets/docs/plantilla_cedula.xlsx';
    this.http.get(templatePath, { responseType: 'arraybuffer' }).subscribe({
      next: async (buffer) => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const sheet = workbook.getWorksheet(1);
        
        if (!sheet) {
          console.error('Worksheet not found in template');
          return;
        }

        // Replace placeholders
        sheet.eachRow((row, rowNumber) => {
          row.eachCell((cell, colNumber) => {
            if (typeof cell.value === 'string') {
              if (cell.value.includes('{nombreFilial}')) {
                cell.value = cell.value.replace('{nombreFilial}', (cedula.filialNombre || '').toUpperCase());
              }
              if (cell.value.includes('{nombrePeriodo}')) {
                cell.value = cell.value.replace('{nombrePeriodo}', (cedula.periodoNombre || '').toUpperCase());
              }
            } else if (cell.value && typeof cell.value === 'object' && 'richText' in cell.value) {
               // Handle Rich Text
               const richText = cell.value as any;
               if (Array.isArray(richText.richText)) {
                 richText.richText.forEach((part: any) => {
                   if (part.text.includes('{nombreFilial}')) {
                     part.text = part.text.replace('{nombreFilial}', (cedula.filialNombre || '').toUpperCase());
                   }
                   if (part.text.includes('{nombrePeriodo}')) {
                     part.text = part.text.replace('{nombrePeriodo}', (cedula.periodoNombre || '').toUpperCase());
                   }
                 });
               }
            }
          });
        });

        // Insert details
        try {
          const startRow = 10;
          const detalles = (cedula.detalles || []).filter(d => d.tipo === 'FAVOR');

          if (detalles.length > 0) {
            // Get style from the start row (assuming it has the desired style)
            // or just insert rows and they will inherit style from above/below depending on ExcelJS behavior?
            // ExcelJS insertRow inherits from the row above usually.
            // But if row 9 is a header, we might not want that.
            // Let's assume row 10 is a placeholder row with correct styles.
            // We can duplicate it.
            
            // Strategy: Insert rows at startRow.
            // sheet.spliceRows(startRow, 0, ...detalles.map(d => [cols...]))
            
            const rowsData = detalles.map(d => {
                return [
                    d.sucursalOrigenNombre || '',
                    d.sucursalOtorganteNombre || '',
                    d.titular || '',
                    d.finado || '',
                    d.contrato || '',
                    d.fecha ? this.datePipe.transform(d.fecha, 'dd/MM/yyyy') : '',
                    d.conceptoNombre || '',
                    d.monto ? Number(d.monto) : 0,
                    d.saldoPABS ? Number(d.saldoPABS) : 0,
                    d.observacion || '',
                    d.saldoEfectivamenteCobrado ? Number(d.saldoEfectivamenteCobrado) : 0
                ];
            });
            
            // Insert rows. Note: this pushes existing rows down.
            sheet.insertRows(startRow, rowsData);

            // Apply styles to the inserted rows
            // We need to iterate over the inserted rows and apply styles.
            // Let's assume we want a basic style (borders, etc.) or try to copy from a reference.
            // If the template is blank at row 10, we might need to define styles.
            // But the user said "conserve el diseño". If the template has a table defined, inserting rows might expand it.
            // For now, let's just ensure numbers are formatted.
            
            for (let i = 0; i < detalles.length; i++) {
                const row = sheet.getRow(startRow + i);
                
                // Format numbers
                row.getCell(8).numFmt = '#,##0.00';
                row.getCell(9).numFmt = '#,##0.00';
                row.getCell(11).numFmt = '#,##0.00';
                
                // Optional: Apply border to all cells in the row if needed
                // row.eachCell(cell => {
                //     cell.border = {
                //         top: { style: 'thin' },
                //         left: { style: 'thin' },
                //         bottom: { style: 'thin' },
                //         right: { style: 'thin' }
                //     };
                // });
            }
          }
        } catch (e) {
           console.error('Error populating details', e);
        }

        const bufferOut = await workbook.xlsx.writeBuffer();
        const filial = this.cleanFileName(cedula.filialNombre);
        const periodo = this.cleanFileName(cedula.periodoNombre);
        const blob = new Blob([bufferOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(blob, `cedula_${filial}_${periodo}.xlsx`);
      },
      error: (err) => {
        console.error('Error loading Excel template', err);
      }
    });
  }

  /*
  private replaceInSheet(ws: XLSX.WorkSheet, placeholder: string, value: string) { ... } // Removed
  */

  // private generateExcel(cedula: CedulaPayload) { ... } // Comented out or removed
  /*
  private generateExcel(cedula: CedulaPayload) {
    const detallesFavor = cedula.detalles?.filter((d) => d.tipo === 'FAVOR') || [];
    const totalFavorMonto = detallesFavor.reduce((acc, curr) => acc + (curr.monto || 0), 0);
    const totalFavorCobrado = detallesFavor.reduce((acc, curr) => acc + (curr.saldoEfectivamenteCobrado || 0), 0);

    const detallesPagar = cedula.detalles?.filter((d) => d.tipo === 'PAGAR') || [];
    const totalPagarMonto = detallesPagar.reduce((acc, curr) => acc + (curr.monto || 0), 0);
    const totalPagarCobrado = detallesPagar.reduce((acc, curr) => acc + (curr.saldoEfectivamenteCobrado || 0), 0);

    let comisionPercentage = 0;
    if (cedula.totalFavor && cedula.totalFavor !== 0) {
      comisionPercentage = (cedula.comisionPF || 0) / cedula.totalFavor * 100;
    }

    const data: any[][] = [];

    // Title Row
    data.push(['PROMOTORA FUTURA']);
    data.push([`FILIAL ${(cedula.filialNombre || '').toUpperCase()}`]);
    // Row 3
    data.push(['ESTADO DE CUENTA:', 'SERVICIOS CCI']);

    // Row 4
    data.push(['Periodo:', cedula.periodoNombre]);

    data.push([]); // Spacer

    // Totals
    const comisionStr = this.decimalPipe.transform(cedula.saldosEfectivamenteCobradosTotal, '1.2-2');
    const saldoStr = this.decimalPipe.transform(cedula.totalNeto, '1.2-2');
    const comisionPFStr = this.decimalPipe.transform(cedula.comisionPF, '1.2-2');
    const pct = this.decimalPipe.transform(comisionPercentage, '1.0-0');
    const totalFinalStr = this.decimalPipe.transform(cedula.totalFinal, '1.2-2');

    data.push(['TOTAL COMISIONES', 'TOTAL SALDOS', `Comision por Gestion PF (${pct}%)`]);
    data.push([comisionStr, saldoStr, comisionPFStr]);
    data.push([]);
    data.push(['', '', 'Total Final:', totalFinalStr]);
    data.push([]);

    // FAVOR Table
    data.push(['SERVICIOS OTORGADOS EN SUCURSAL | POR COBRAR A FAVOR DE LA FILIAL']);
    const headers = [
      'Filial Origen', 'Filial Otorgante', 'Titular', 'Finado', 'Contrato',
      'Fecha', 'Concepto', 'Monto', 'Saldo PABS', 'Observaciones', 'Saldo Efec. Cobrado'
    ];
    data.push(headers);

    detallesFavor.forEach(d => {
      data.push([
        d.sucursalOrigenNombre,
        d.sucursalOtorganteNombre,
        d.titular,
        d.finado,
        d.contrato,
        this.datePipe.transform(d.fecha, 'dd/MM/yyyy'),
        d.conceptoNombre,
        this.decimalPipe.transform(d.monto, '1.2-2'),
        this.decimalPipe.transform(d.saldoPABS, '1.2-2'),
        d.observacion,
        this.decimalPipe.transform(d.saldoEfectivamenteCobrado, '1.2-2')
      ]);
    });

    // Subtotal Favor
    data.push([
      '', '', '', '', '', '', 'Subtotal:',
      this.decimalPipe.transform(totalFavorMonto, '1.2-2'),
      '', '',
      this.decimalPipe.transform(totalFavorCobrado, '1.2-2')
    ]);

    data.push([]);

    // PAGAR Table
    data.push(['SERVICIOS OTORGADOS EN OTRA SUCURSAL | POR PAGAR A OTRAS FILIALES']);
    data.push(headers);

    detallesPagar.forEach(d => {
      data.push([
        d.sucursalOrigenNombre,
        d.sucursalOtorganteNombre,
        d.titular,
        d.finado,
        d.contrato,
        this.datePipe.transform(d.fecha, 'dd/MM/yyyy'),
        d.conceptoNombre,
        this.decimalPipe.transform(d.monto, '1.2-2'),
        this.decimalPipe.transform(d.saldoPABS, '1.2-2'),
        d.observacion,
        this.decimalPipe.transform(d.saldoEfectivamenteCobrado, '1.2-2')
      ]);
    });

    // Subtotal Pagar
    data.push([
      '', '', '', '', '', '', 'Subtotal:',
      this.decimalPipe.transform(totalPagarMonto, '1.2-2'),
      '', '',
      this.decimalPipe.transform(totalPagarCobrado, '1.2-2')
    ]);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

    // Merge cells for "PROMOTORA FUTURA" (A1:K1) -> { s: {r:0, c:0}, e: {r:0, c:10} }
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } });

    // Merge cells for "FILIAL ..." (A2:K2) -> { s: {r:1, c:0}, e: {r:1, c:10} }
    ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 10 } });

    // Center alignment for title (A1)
    if (!ws['A1'].s) ws['A1'].s = {};
    ws['A1'].s = {
      alignment: { horizontal: 'center', vertical: 'center' },
      font: { name: 'Calibri', sz: 36, color: { rgb: '1f4e78' }, bold: false }
    };

    // Style for Filial row (A2)
    if (!ws['A2'].s) ws['A2'].s = {};
    ws['A2'].s = {
      alignment: { horizontal: 'center', vertical: 'center' },
      font: { name: 'Calibri', sz: 14, color: { rgb: 'FFFFFF' }, bold: true },
      fill: { fgColor: { rgb: '4472C4' } }
    };

    // Style for Rows 3 and 4 (A3..K3, A4..K4)
    const headerStyle = {
      font: { name: 'Calibri', sz: 11, color: { rgb: '1F4E78' }, bold: true },
      fill: { fgColor: { rgb: 'DAE2F2' } }
    };

    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    ['3', '4'].forEach(r => {
      cols.forEach(c => {
        const cell = c + r;
        if (!ws[cell]) ws[cell] = { t: 's', v: '' };
        if (!ws[cell].s) ws[cell].s = {};
        ws[cell].s = { ...headerStyle };
      });
    });

    const wb: XLSX.WorkBook = { Sheets: { 'Cedula': ws }, SheetNames: ['Cedula'] };
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    const filial = this.cleanFileName(cedula.filialNombre);
    const periodo = this.cleanFileName(cedula.periodoNombre);
    
    this.saveAsExcelFile(excelBuffer, `cedula_${filial}_${periodo}`);
  }
  */

  private cleanFileName(name: string | undefined): string {
    if (!name) return '';
    return name
      .replace(/\s+/g, '_') // Replace spaces with _
      .replace(/[\\/:*?"<>|]/g, ''); // Remove illegal characters
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }
}

