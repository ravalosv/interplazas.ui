import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { CedulaPayload } from '../interfaces/payloads/cedula.payload';
import * as XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';
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
      next: (buffer) => {
        XlsxPopulate.fromDataAsync(buffer).then((workbook: any) => {
          // Find and replace globally in the workbook
          // This handles Rich Text and shared strings automatically
          try {
            workbook.find('{nombreFilial}', (cedula.filialNombre || '').toUpperCase());
            workbook.find('{nombrePeriodo}', (cedula.periodoNombre || '').toUpperCase());
          } catch (e) {
            console.warn('Workbook find method failed, falling back to cell iteration', e);
            
            const sheet = workbook.sheet(0);
            const usedRange = sheet.usedRange();
            if (usedRange) {
              usedRange.cells().forEach((row: any[]) => {
                row.forEach((cell: any) => {
                  const value = cell.value();
                  if (typeof value === 'string') {
                    if (value.includes('{nombreFilial}')) {
                      cell.value(value.replace('{nombreFilial}', (cedula.filialNombre || '').toUpperCase()));
                    }
                    if (value.includes('{nombrePeriodo}')) {
                      cell.value(value.replace('{nombrePeriodo}', (cedula.periodoNombre || '').toUpperCase()));
                    }
                  } else if (value && typeof value === 'object' && value.text) {
                     // Handle RichText if exposed as object with text method/prop
                     // XlsxPopulate RichText usually behaves like an array of chunks
                     // For now, assume simple string replacement is primary target. 
                     // If find() fails, we might be in trouble with RichText, but find() is standard.
                  }
                });
              });
            }
          }

          try {
            const sheet = workbook.sheet(0);
            const startRow = 10;
            const detalles = (cedula.detalles || []).filter(d => d.tipo === 'FAVOR');

            // Write details directly to rows starting at startRow
            if (detalles.length > 0) {
              detalles.forEach((d, i) => {
                const currentRowNum = startRow + i;
                const row = sheet.row(currentRowNum).insertRows(1);

                row.cell(1).value(d.sucursalOrigenNombre || '');
                row.cell(2).value(d.sucursalOtorganteNombre || '');
                row.cell(3).value(d.titular || '');
                row.cell(4).value(d.finado || '');
                row.cell(5).value(d.contrato || '');
                row.cell(6).value(d.fecha ? this.datePipe.transform(d.fecha, 'dd/MM/yyyy') : '');
                row.cell(7).value(d.conceptoNombre || '');
                row.cell(8).value(d.monto ? Number(d.monto) : 0);
                row.cell(9).value(d.saldoPABS ? Number(d.saldoPABS) : 0);
                row.cell(10).value(d.observacion || '');
                row.cell(11).value(d.saldoEfectivamenteCobrado ? Number(d.saldoEfectivamenteCobrado) : 0);

                row.cell(8).style('numberFormat', '#,##0.00');
                row.cell(9).style('numberFormat', '#,##0.00');
                row.cell(11).style('numberFormat', '#,##0.00');
              });
            }
          } catch (e) {
             console.error('Error populating details', e);
          }

          return workbook.outputAsync();
        }).then((blob: any) => {
          const filial = this.cleanFileName(cedula.filialNombre);
          const periodo = this.cleanFileName(cedula.periodoNombre);
          FileSaver.saveAs(blob, `cedula_${filial}_${periodo}.xlsx`);
        }).catch((err: any) => {
          console.error('Error generating Excel', err);
        });
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

