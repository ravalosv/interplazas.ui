import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { CedulaPayload } from '../interfaces/payloads/cedula.payload';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { DatePipe, DecimalPipe } from '@angular/common';
import { saveAs } from 'file-saver';


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

  private async generateExcelFromTemplate(cedula: CedulaPayload) {
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

        // Preserve column widths (workaround for ExcelJS losing widths on insert/save)
        const savedCols: any[] = [];
        const maxCol = 26; // Capture at least A-Z
        for (let i = 1; i <= Math.max(sheet.columnCount, maxCol); i++) {
          const col = sheet.getColumn(i);
          savedCols.push({
             key: col.key,
             width: col.width,
             style: col.style,
             hidden: col.hidden,
             outlineLevel: col.outlineLevel
          });
        }

        // Insert details
        try {
          const startRow = 10;
          const detalles = (cedula.detalles || []).filter(d => d.tipo === 'FAVOR');

          if (detalles.length > 0) {
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
            
            // Insert rows
            sheet.insertRows(startRow, rowsData);

            // Update Formulas
            // Since ExcelJS does not automatically update formulas when rows are shifted, 
            // we manually update formulas that reference rows equal to or below the insertion point.
            // This assumes simple relative references.
            const insertedCount = rowsData.length;
            sheet.eachRow((row, rowNumber) => {
              // Skip the inserted rows themselves (they contain raw data)
              if (rowNumber >= startRow && rowNumber < startRow + insertedCount) return;

              row.eachCell((cell) => {
                if (cell.formula) {
                   // Regex to match cell references like A10, $B$20, etc.
                   // We look for row numbers >= startRow and increment them by insertedCount
                   const formula = cell.formula;
                   const newFormula = formula.replace(/(\$?[A-Z]+)(\$?)(\d+)/g, (match, col, absRow, rowStr) => {
                      const rowNum = parseInt(rowStr, 10);
                      if (rowNum >= startRow) {
                        return `${col}${absRow}${rowNum + insertedCount}`;
                      }
                      return match;
                   });
                   
                   if (newFormula !== formula) {
                     cell.value = { formula: newFormula };
                   }
                }
              });
            });

            // Apply styles to the inserted rows
            for (let i = 0; i < detalles.length; i++) {
                const row = sheet.getRow(startRow + i);
                
                // Format numbers
                row.getCell(8).numFmt = '#,##0.00';
                row.getCell(9).numFmt = '#,##0.00';
                row.getCell(11).numFmt = '#,##0.00';
                
                // Optional: Copy style from the row above (row 9) or below?
                // For now, keeping default style or inherited.
            }
          }
        } catch (e) {
           console.error('Error populating details', e);
        }
        
        // Capture merges before resetting columns (which might clear them)
        // Make a copy to avoid reference issues if the library clears the internal array
        const currentMerges = sheet.model.merges ? [...sheet.model.merges] : [];

        // Restore column widths via sheet.columns to force <cols> write
        const newColumnDefs: any[] = [];
        savedCols.forEach((saved, index) => {
             newColumnDefs.push({
                 key: saved.key || `col${index+1}`,
                 width: saved.width,
                 style: saved.style,
                 hidden: saved.hidden,
                 outlineLevel: saved.outlineLevel
             });
        });
        sheet.columns = newColumnDefs;

        // Restore merges
        if (currentMerges && Array.isArray(currentMerges)) {
             try {
                 currentMerges.forEach(merge => {
                    if (typeof merge === 'string') {
                        sheet.mergeCells(merge);
                    }
                 });
             } catch (e) {
                 console.warn('Error restoring merges', e);
             }
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



/**
 * Utilidad manual para convertir rangos de Excel (A1:B2) a números
 * Esto reemplaza el uso de métodos inexistentes en el tipado de ExcelJS
 */
private decodeRange(rangeStr: string) {
  const parts = rangeStr.split(':');
  const start = this.addressToRowCol(parts[0]);
  const end = parts[1] ? this.addressToRowCol(parts[1]) : start;

  return {
    top: start.row,
    left: start.col,
    bottom: end.row,
    right: end.col
  };
}

private addressToRowCol(address: string) {
  const colMatch = address.match(/[A-Z]+/);
  const rowMatch = address.match(/[0-9]+/);
  
  const colStr = colMatch![0];
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + colStr.charCodeAt(i) - 64;
  }
  
  return {
    row: parseInt(rowMatch![0], 10),
    col: col
  };
}







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

