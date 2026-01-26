import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx-js-style';
import { CedulaPayload } from '../interfaces/payloads/cedula.payload';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CedulaExcelService {
  private datePipe = new DatePipe('en-US');
  
  // Constantes de estilo
  private readonly PRIMARY_COLOR = "1F4E78";
  private readonly SECONDARY_COLOR = "D9E1F2";
  private readonly GREY_COLOR = "D0CECE";
  private readonly ACCOUNTING_FORMAT = '_("$"* #,##0.00_);_("$"* \\(#,##0.00\\);_("$"* "-"??_);_(@_)';
  private readonly TEMPLATE_PATH = 'assets/docs/plantilla_cedula.xlsx';

  constructor(private http: HttpClient) { }

  public async generateExcelFromTemplate2(cedula: CedulaPayload) {
    try {
      const buffer = await firstValueFrom(
        this.http.get(this.TEMPLATE_PATH, { responseType: 'arraybuffer' })
      );
      
      this.processWorkbook(buffer, cedula);
    } catch (err) {
      console.error('Error loading Excel template', err);
    }
  }

  private processWorkbook(buffer: ArrayBuffer, cedula: CedulaPayload) {
    const workbook = XLSX.read(buffer, { 
      type: 'array',
      cellStyles: true,
      cellFormula: true,
      cellDates: true,
      cellNF: true,
      sheetStubs: true
    });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) return;

    this.applyTitleAndHeaderStyles(worksheet, cedula);
    this.applyTableHeadersStyle(worksheet);
    this.insertDetails(worksheet, cedula);
    this.saveFile(workbook, cedula);
  }

  private applyTitleAndHeaderStyles(worksheet: XLSX.WorkSheet, cedula: CedulaPayload) {
    // A1: Título principal
    this.setCellStyle(worksheet, 'A1', {
      font: { name: 'Calibri', sz: 36, color: { rgb: this.PRIMARY_COLOR } },
      alignment: { horizontal: 'center', vertical: 'center' }
    });

    // A3: Nombre de Filial
    if (worksheet['A3'] && worksheet['A3'].v) {
      const originalValue = worksheet['A3'].v.toString();
      worksheet['A3'].v = originalValue.replace('{nombreFilial}', (cedula.filialNombre || '').toUpperCase());
      
      this.setCellStyle(worksheet, 'A3', {
        font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: this.PRIMARY_COLOR } },
        alignment: { horizontal: 'center', vertical: 'center' }
      });
    }

    // A4:K5: Estilo secundario
    const rangeToFormat = XLSX.utils.decode_range("A4:K5");
    this.ensureRangeExists(worksheet, rangeToFormat);

    for (let R = rangeToFormat.s.r; R <= rangeToFormat.e.r; ++R) {
      for (let C = rangeToFormat.s.c; C <= rangeToFormat.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
        this.ensureCellExists(worksheet, cellRef);
        
        this.setCellStyle(worksheet, cellRef, {
          font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: this.PRIMARY_COLOR } },
          fill: { fgColor: { rgb: this.SECONDARY_COLOR } }
        });
      }
    }

    // Reemplazar {nombrePeriodo} en A5 (nota: código original verificaba A5 pero lógica decía B5, mantenemos A5 del original)
    if (worksheet['A5'] && worksheet['A5'].v) {
      const originalValue = worksheet['A5'].v.toString();
      worksheet['A5'].v = originalValue.replace('{nombrePeriodo}', (cedula.periodoNombre || '').toUpperCase());
    }

    // A4 y A5 alineación izquierda
    ['A4', 'A5'].forEach(cellKey => {
       if (worksheet[cellKey]) {
           if (!worksheet[cellKey].s) worksheet[cellKey].s = {};
           worksheet[cellKey].s.alignment = { horizontal: 'left', vertical: 'center' };
       }
    });

    // A6: Estilo sin fondo específico
    this.setCellStyle(worksheet, 'A6', {
      font: { name: 'Calibri', sz: 9, color: { rgb: "000000" } },
      alignment: { horizontal: 'center', vertical: 'center' }
    });

    // A8: Estilo especial (Fondo primario, texto blanco, COBRAR amarillo)
    this.ensureCellExists(worksheet, 'A8');
    const cellA8 = worksheet['A8'];
    const textA8 = "SERVICIOS OTORGADOS EN SUCURSAL | POR COBRAR A FAVOR DE LA FILIAL";
    
    // Asignar valores básicos
    cellA8.v = textA8;
    cellA8.t = 's';

    // Estilo base de la celda (Fondo y fuente por defecto)
    const styleA8: any = {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: this.PRIMARY_COLOR } },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
    this.setCellStyle(worksheet, 'A8', styleA8);

    // Intento de Rich Text para colorear "COBRAR" en amarillo
    // Nota: La compatibilidad de Rich Text depende de la librería xlsx-js-style. 
    // Si no es compatible, se mostrará el estilo base (todo blanco).
    /*
    const parts = textA8.split('COBRAR');
    // Estructura aproximada para Rich Text si fuera soportado en escritura por la librería
    // Por seguridad mantenemos el texto plano con el estilo base que es legible.
    */

    // K8: Estilo primario
    this.ensureCellExists(worksheet, 'K8');
    this.setCellStyle(worksheet, 'K8', {
      fill: { fgColor: { rgb: this.PRIMARY_COLOR } }
    });
  }

  private applyTableHeadersStyle(worksheet: XLSX.WorkSheet) {
    const headerRange = XLSX.utils.decode_range("A9:K9");
    for (let c = headerRange.s.c; c <= headerRange.e.c; ++c) {
      const cellRef = XLSX.utils.encode_cell({ c: c, r: 8 }); // Fila 9 es índice 8
      this.ensureCellExists(worksheet, cellRef);

      const style: any = {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: this.PRIMARY_COLOR } },
        fill: { fgColor: { rgb: this.SECONDARY_COLOR } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
      };

      // Columna I (Saldo PABS) -> Gris
      if (c === 8) style.fill = { fgColor: { rgb: this.GREY_COLOR } };
      // Columna J (Observación) -> Sin fondo específico
      if (c === 9) delete style.fill;
      // Columna K (Monto Recuperado) -> Secundario (ya es el default, pero explícito si se cambia lógica)
      // No necesitamos lógica extra porque el default ya es SECONDARY_COLOR

      this.setCellStyle(worksheet, cellRef, style);
    }
  }

  private insertDetails(worksheet: XLSX.WorkSheet, cedula: CedulaPayload) {
    const detallesFavor = (cedula.detalles || []).filter(d => d.tipo === 'FAVOR');
    
    if (detallesFavor.length === 0) return;

    const startRow = 9; // A10 es índice 9
    const numRows = detallesFavor.length;
    
    this.shiftRowsDown(worksheet, startRow, numRows);
    
    // Insertar datos
    detallesFavor.forEach((d, i) => {
      const currentRow = startRow + i;
      this.setRowHeight(worksheet, currentRow, 12.75);
      this.insertDetailRow(worksheet, currentRow, d);
    });

    // Extender color GREY_COLOR en columna I (índice 8) y SECONDARY_COLOR en columna K (índice 10) dos renglones más
    const lastDetailRow = startRow + numRows;
    for (let r = lastDetailRow; r < lastDetailRow + 2; r++) {
        // Columna I (8)
        const cellRefI = XLSX.utils.encode_cell({c: 8, r: r});
        this.ensureCellExists(worksheet, cellRefI);
        this.setCellStyle(worksheet, cellRefI, {
            fill: { fgColor: { rgb: this.GREY_COLOR } }
        });

        // Columna K (10)
        const cellRefK = XLSX.utils.encode_cell({c: 10, r: r});
        this.ensureCellExists(worksheet, cellRefK);
        this.setCellStyle(worksheet, cellRefK, {
            fill: { fgColor: { rgb: this.SECONDARY_COLOR } }
        });
    }

    this.updateSummaryFormulas(worksheet, startRow, numRows);
  }

  private shiftRowsDown(worksheet: XLSX.WorkSheet, startRow: number, numRows: number) {
    const ref = worksheet['!ref'] || 'A1:A1';
    const range = XLSX.utils.decode_range(ref);
    
    // Desplazar filas existentes
    for (let r = range.e.r; r >= startRow; r--) {
      // Desplazar propiedades de fila (!rows)
      if (worksheet['!rows'] && worksheet['!rows'][r]) {
         worksheet['!rows'][r + numRows] = worksheet['!rows'][r];
         delete worksheet['!rows'][r];
      }

      for (let c = range.s.c; c <= range.e.c; c++) {
        const fromRef = XLSX.utils.encode_cell({c: c, r: r});
        const toRef = XLSX.utils.encode_cell({c: c, r: r + numRows});

        // Eliminar merges afectados
        this.removeMergesInRange(worksheet, r, c);

        if (worksheet[fromRef]) {
          worksheet[toRef] = worksheet[fromRef];
          delete worksheet[fromRef];
        }
      }
    }

    // Actualizar rango de la hoja
    range.e.r += numRows;
    worksheet['!ref'] = XLSX.utils.encode_range(range);
  }

  private removeMergesInRange(worksheet: XLSX.WorkSheet, r: number, c: number) {
    if (!worksheet['!merges']) return;
    
    for (let m = worksheet['!merges'].length - 1; m >= 0; m--) {
      const merge = worksheet['!merges'][m];
      if (r >= merge.s.r && r <= merge.e.r && c >= merge.s.c && c <= merge.e.c) {
        worksheet['!merges'].splice(m, 1);
      }
    }
  }

  private insertDetailRow(worksheet: XLSX.WorkSheet, row: number, d: any) {
    const setCell = (col: number, val: any, type: string = 's', fmt: string = '', styleOverrides?: any) => {
      const ref = XLSX.utils.encode_cell({c: col, r: row});
      worksheet[ref] = { t: type, v: val };
      if (fmt) worksheet[ref].z = fmt;
      
      let style: any = { font: { name: 'Calibri', sz: 10 } };
      if (styleOverrides) {
        style = { ...style, ...styleOverrides };
      }
      
      this.setCellStyle(worksheet, ref, style);
    };

    setCell(0, d.sucursalOrigenNombre || '');
    setCell(1, d.sucursalOtorganteNombre || '');
    setCell(2, d.titular || '');
    setCell(3, d.finado || '');
    setCell(4, d.contrato || '');
    setCell(5, d.fecha ? this.datePipe.transform(d.fecha, 'dd-MMM-yyyy') : '');
    setCell(6, d.conceptoNombre || '');
    
    setCell(7, d.monto ? Number(d.monto) : 0, 'n', this.ACCOUNTING_FORMAT);
    setCell(8, d.saldoPABS ? Number(d.saldoPABS) : 0, 'n', this.ACCOUNTING_FORMAT, { fill: { fgColor: { rgb: this.GREY_COLOR } } });

    // Chips logic
    let obs = d.observacion || '';
    const chips: string[] = [];
    
    if (d.penalizado) chips.push('Reportado fuera de tiempo');
    if (d.esFilialesHermanas) chips.push('Filiales hermanas');
    if (d.aceptaConvenio) chips.push('Saldo PABS conveniado');
    
    if ((d.saldoEfectivamenteCobrado || 0) > 0) {
        if ((d.montoDevuelto || 0) < (d.saldoEfectivamenteCobrado || 0)) {
            chips.push('Saldo PABS pendiente de depositar');
        } else if ((d.montoDevuelto || 0) >= (d.saldoEfectivamenteCobrado || 0)) {
            chips.push('Saldo PABS devuelto');
        }
    }
    
    if (chips.length > 0) {
        if (obs) obs += '\n';
        obs += chips.map(c => `[${c}]`).join('\n');
    }

    setCell(9, obs, 's', '', { 
        alignment: { wrapText: true, vertical: 'center' }
    });
    
    setCell(10, d.montoRecuperado ? Number(d.montoRecuperado) : 0, 'n', this.ACCOUNTING_FORMAT, { fill: { fgColor: { rgb: this.SECONDARY_COLOR } } });
  }

  private updateSummaryFormulas(worksheet: XLSX.WorkSheet, startRow: number, numRows: number) {
    const rangeSearch = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    let foundH = false;
    let foundK = false;
    const firstDataRow = startRow + 1; // 1-based index
    const lastDataRow = startRow + numRows; // 1-based index

    for (let r = startRow + numRows; r <= rangeSearch.e.r; r++) {
       const cellRefH = XLSX.utils.encode_cell({c: 7, r: r});
       const cellRefK = XLSX.utils.encode_cell({c: 10, r: r});
       let isSubtotalRow = false;
       
       if (!foundH && this.isPlaceholder(worksheet, cellRefH, '{subtotalFAVOR}')) {
           this.setFormula(worksheet, cellRefH, `SUM(H${firstDataRow}:H${lastDataRow})`, this.ACCOUNTING_FORMAT);
           foundH = true;
           isSubtotalRow = true;
       }

       if (!foundK && this.isPlaceholder(worksheet, cellRefK, '{saldosCobrados}')) {
           this.setFormula(worksheet, cellRefK, `SUM(K${firstDataRow}:K${lastDataRow})`, this.ACCOUNTING_FORMAT);
           foundK = true;
           isSubtotalRow = true;
       }
       
       if (isSubtotalRow) {
           // Formato solicitado: G-K (Cols 6-10), EXCEPTO I (Col 8)
           // Background: Secundario, Font: Calibri 10 Bold Principal
           for (let c = 6; c <= 10; c++) {
               if (c === 8) continue; // Saltar columna I

               const cellRef = XLSX.utils.encode_cell({c, r});
               this.ensureCellExists(worksheet, cellRef);
               
               this.setCellStyle(worksheet, cellRef, {
                   fill: { fgColor: { rgb: this.SECONDARY_COLOR } },
                   font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: this.PRIMARY_COLOR } },
                   alignment: { horizontal: 'right', vertical: 'center' }
               });
           }
       }
       
       if (foundH && foundK) break;
    }
  }

  private saveFile(workbook: XLSX.WorkBook, cedula: CedulaPayload) {
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      cellStyles: true 
    });
    
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filial = this.cleanFileName(cedula.filialNombre);
    const periodo = this.cleanFileName(cedula.periodoNombre);
    const fileName = filial && periodo ? `cedula_${filial}_${periodo}.xlsx` : 'cedula.xlsx';
    
    FileSaver.saveAs(blob, fileName);
  }

  // --- Helper Utils ---

  private setCellStyle(worksheet: XLSX.WorkSheet, cellRef: string, style: any) {
    if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
    if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
    
    // Merge styles
    worksheet[cellRef].s = { ...worksheet[cellRef].s, ...style };
  }

  private ensureCellExists(worksheet: XLSX.WorkSheet, cellRef: string) {
    if (!worksheet[cellRef]) {
       worksheet[cellRef] = { t: 's', v: '' }; 
    } else if (worksheet[cellRef].t === 'z') {
       worksheet[cellRef].t = 's';
       worksheet[cellRef].v = '';
    }
  }

  private ensureRangeExists(worksheet: XLSX.WorkSheet, range: XLSX.Range) {
    if (worksheet['!ref']) {
      const currentRange = XLSX.utils.decode_range(worksheet['!ref']);
      const newRange = {
        s: {
          r: Math.min(currentRange.s.r, range.s.r),
          c: Math.min(currentRange.s.c, range.s.c)
        },
        e: {
          r: Math.max(currentRange.e.r, range.e.r),
          c: Math.max(currentRange.e.c, range.e.c)
        }
      };
      worksheet['!ref'] = XLSX.utils.encode_range(newRange);
    }
  }

  private setRowHeight(worksheet: XLSX.WorkSheet, row: number, height: number) {
    if (!worksheet['!rows']) worksheet['!rows'] = [];
    if (!worksheet['!rows'][row]) worksheet['!rows'][row] = {};
    worksheet['!rows'][row].hpt = height;
  }

  private isPlaceholder(worksheet: XLSX.WorkSheet, cellRef: string, placeholder: string): boolean {
    return worksheet[cellRef] && worksheet[cellRef].v === placeholder;
  }

  private setFormula(worksheet: XLSX.WorkSheet, cellRef: string, formula: string, format: string) {
    worksheet[cellRef].t = 'n';
    worksheet[cellRef].f = formula;
    worksheet[cellRef].v = 0;
    worksheet[cellRef].z = format;
  }

  private cleanFileName(name: string | undefined): string {
    if (!name) return '';
    return name
      .replace(/\s+/g, '_')
      .replace(/[\\/:*?"<>|]/g, '');
  }
}
