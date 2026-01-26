import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx-js-style';
import { CedulaPayload } from '../interfaces/payloads/cedula.payload';
import { SettingsPayload } from '../interfaces/payloads/settings.payload';
import { SettingsService } from './settings.service';
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

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) { }

  public async generateExcelFromTemplate2(cedula: CedulaPayload) {
    try {
      const [buffer, settingsRet] = await Promise.all([
        firstValueFrom(this.http.get(this.TEMPLATE_PATH, { responseType: 'arraybuffer' })),
        firstValueFrom(this.settingsService.getAll())
      ]);

      const settings = (settingsRet.success && settingsRet.data.length > 0) ? settingsRet.data[0] : null;
      
      this.processWorkbook(buffer, cedula, settings);
    } catch (err) {
      console.error('Error loading Excel template or settings', err);
    }
  }

  private processWorkbook(buffer: ArrayBuffer, cedula: CedulaPayload, settings: SettingsPayload | null) {
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
    
    const summaryRefs: any = {};
    
    const favorResult = this.insertFavorDetails(worksheet, cedula);
    const lastFavorRow = favorResult.lastRow;
    Object.assign(summaryRefs, favorResult.refs);

    const pagarResult = this.insertPagarDetails(worksheet, cedula, lastFavorRow);
    Object.assign(summaryRefs, pagarResult.refs);
    
    // Si lastRow viene de pagarResult, usarlo, sino (si no hubo pagar) usar lastFavorRow
    // Nota: insertPagarDetails retorna lastRow = lastFavorRow si no hay datos
    const lastPagarRow = pagarResult.lastRow;

    const lastSubtotalRow = this.insertSubtotales(worksheet, lastPagarRow, cedula, summaryRefs, settings);
    
    this.insertTotalFinal(worksheet, lastSubtotalRow, summaryRefs);

    this.saveFile(workbook, cedula);
  }

  private insertSubtotales(worksheet: XLSX.WorkSheet, lastRow: number, cedula: CedulaPayload, refs: any, settings: SettingsPayload | null): number {
    let currentRow = lastRow + 2;

    // 1. TOTAL COMISIONES
    this.insertSummaryLabel(worksheet, currentRow, "TOTAL COMISIONES:");
    
    // Formula para H: subtotalCobrar - subtotalPagar
    const totalComisiones = XLSX.utils.encode_cell({c: 7, r: currentRow});
    this.ensureCellExists(worksheet, totalComisiones);
    const cellH = worksheet[totalComisiones];
    
    // Formato con texto rojo para negativos
    const RED_ACCOUNTING_FORMAT = '_("$"* #,##0.00_);[Red]_("$"* \\(#,##0.00\\);_("$"* "-"??_);_(@_)';

    const cobrar = refs.subtotalCobrar;
    const pagar = refs.subtotalPagar;
    
    if (cobrar && pagar) {
        this.setFormula(worksheet, totalComisiones, `${cobrar}-${pagar}`, RED_ACCOUNTING_FORMAT);
    } else if (cobrar) {
        this.setFormula(worksheet, totalComisiones, cobrar, RED_ACCOUNTING_FORMAT);
    } else if (pagar) {
        // Si solo hay pagar, el resultado sería negativo (0 - pagar)
        this.setFormula(worksheet, totalComisiones, `-${pagar}`, RED_ACCOUNTING_FORMAT);
    } else {
        cellH.v = 0;
        cellH.t = 'n';
        cellH.z = RED_ACCOUNTING_FORMAT;
    }
    
    // Estilo para H (Mismo estilo que los subtotales: fondo secundario, texto bold primario)
    this.setCellStyle(worksheet, totalComisiones, {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: this.PRIMARY_COLOR } },
        fill: { fgColor: { rgb: this.SECONDARY_COLOR } },
        alignment: { horizontal: 'right', vertical: 'center' }
    });

    // Formato I y J
    // I: Fondo Primario, Forecolor FFFFFF
    const cellIRef = XLSX.utils.encode_cell({c: 8, r: currentRow});
    this.ensureCellExists(worksheet, cellIRef);
    this.setCellStyle(worksheet, cellIRef, {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: this.PRIMARY_COLOR } },
        alignment: { horizontal: 'center', vertical: 'center' }
    });

    // J: "TOTAL SALDOS", Fondo Primario, Forecolor FFFFFF
    const cellJRef = XLSX.utils.encode_cell({c: 9, r: currentRow});
    this.ensureCellExists(worksheet, cellJRef);
    const cellJ = worksheet[cellJRef];
    cellJ.v = "TOTAL SALDOS";
    cellJ.t = 's';
    this.setCellStyle(worksheet, cellJRef, {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: this.PRIMARY_COLOR } },
        alignment: { horizontal: 'center', vertical: 'center' }
    });

    // K: "TOTAL SALDOS", Formula: subtotalSaldosPagar - subtotalSaldosCobrar
    const totalSaldos = XLSX.utils.encode_cell({c: 10, r: currentRow});
    this.ensureCellExists(worksheet, totalSaldos);
    const cellK = worksheet[totalSaldos];

    const saldosCobrar = refs.subtotalSaldosCobrar;
    const saldosPagar = refs.subtotalSaldosPagar;

    if (saldosPagar && saldosCobrar) {
        this.setFormula(worksheet, totalSaldos, `${saldosPagar}-${saldosCobrar}`, RED_ACCOUNTING_FORMAT);
    } else if (saldosPagar) {
        this.setFormula(worksheet, totalSaldos, saldosPagar, RED_ACCOUNTING_FORMAT);
    } else if (saldosCobrar) {
        // Si solo hay saldosCobrar, sería 0 - saldosCobrar
        this.setFormula(worksheet, totalSaldos, `-${saldosCobrar}`, RED_ACCOUNTING_FORMAT);
    } else {
        cellK.v = 0;
        cellK.t = 'n';
        cellK.z = RED_ACCOUNTING_FORMAT;
    }

    // Formato K: Fondo secundario, Calibri 10, rojo si es negativo (ya aplicado con RED_ACCOUNTING_FORMAT)
    this.setCellStyle(worksheet, totalSaldos, {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: this.PRIMARY_COLOR } }, // Asumimos texto primario sobre fondo secundario, o rojo por formato condicional
        fill: { fgColor: { rgb: this.SECONDARY_COLOR } },
        alignment: { horizontal: 'right', vertical: 'center' }
    });

    // Guardar referencias para Total Final
    refs.totalComisiones = totalComisiones;
    refs.totalSaldos = totalSaldos;

    currentRow++;

    // 2. Comision por Gestion PF
    // Prioridad: SettingsPayload.comisionPF -> cedula.comisionPF -> 0
    const comisionVal = settings?.comisionPF ?? cedula.comisionPF ?? 0;
    const comisionStr = `Comision por Gestion PF ${comisionVal}%`;
    this.insertSummaryLabel(worksheet, currentRow, comisionStr);

    // Formato H-K: backgroundcolor: secundario; Calibri, 10, bold, negro
    const comisionStyle = {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: this.SECONDARY_COLOR } },
        alignment: { horizontal: 'right', vertical: 'center' }
    };

    [7, 8, 9, 10].forEach(colIndex => {
        const cellRef = XLSX.utils.encode_cell({c: colIndex, r: currentRow});
        this.ensureCellExists(worksheet, cellRef);
        this.setCellStyle(worksheet, cellRef, comisionStyle);
    });
    
    // H: CedulaPayload.comisionPF
    const cellHComisionRef = XLSX.utils.encode_cell({c: 7, r: currentRow});
    const cellHComision = worksheet[cellHComisionRef];
    cellHComision.v = cedula.comisionPF ?? 0;
    cellHComision.t = 'n';

    currentRow++;
    return currentRow;
  }

  private insertTotalFinal(worksheet: XLSX.WorkSheet, lastRow: number, refs: any) {
    const currentRow = lastRow + 1;
    
    // A = "TOTAL FINAL"
    const cellRef = XLSX.utils.encode_cell({c: 0, r: currentRow});
    this.ensureCellExists(worksheet, cellRef);
    const cell = worksheet[cellRef];
    cell.v = "TOTAL FINAL";
    cell.t = 's';

    // Merge A-G (0-6)
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow, c: 6 }
    });

    // Style: background: principal, forecolor: FFFFFF, Calibri, 24, bold, right
    this.setCellStyle(worksheet, cellRef, {
        font: { name: 'Calibri', sz: 24, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: this.PRIMARY_COLOR } },
        alignment: { horizontal: 'right', vertical: 'center' }
    });

    // H-K (7-10) Merge y Valor
    // Merge
    worksheet['!merges'].push({
        s: { r: currentRow, c: 7 },
        e: { r: currentRow, c: 10 }
    });

    const cellHRef = XLSX.utils.encode_cell({c: 7, r: currentRow});
    this.ensureCellExists(worksheet, cellHRef);
    const cellH = worksheet[cellHRef];

    // Formula: totalComisiones + totalSaldos
    const comm = refs.totalComisiones;
    const saldos = refs.totalSaldos;
    const RED_ACCOUNTING_FORMAT = '_("$"* #,##0.00_);[Red]_("$"* \\(#,##0.00\\);_("$"* "-"??_);_(@_)';

    if (comm && saldos) {
        this.setFormula(worksheet, cellHRef, `${comm}+${saldos}`, RED_ACCOUNTING_FORMAT);
    } else if (comm) {
        this.setFormula(worksheet, cellHRef, comm, RED_ACCOUNTING_FORMAT);
    } else if (saldos) {
        this.setFormula(worksheet, cellHRef, saldos, RED_ACCOUNTING_FORMAT);
    } else {
        cellH.v = 0;
        cellH.t = 'n';
        cellH.z = RED_ACCOUNTING_FORMAT;
    }

    // Guardar referencia
    refs.totalFinal = cellHRef;

    // Style: background: a9d08e, Calibri, 24, bold, forecolor: primario
    const totalStyle = {
        font: { name: 'Calibri', sz: 24, bold: true, color: { rgb: this.PRIMARY_COLOR } },
        fill: { fgColor: { rgb: "A9D08E" } },
        alignment: { horizontal: 'right', vertical: 'center' }
    };

    // Aplicar estilo a las celdas mergeadas (H-K)
    for (let c = 7; c <= 10; c++) {
        const ref = XLSX.utils.encode_cell({c: c, r: currentRow});
        this.ensureCellExists(worksheet, ref);
        this.setCellStyle(worksheet, ref, totalStyle);
    }
  }

  private insertSummaryLabel(worksheet: XLSX.WorkSheet, row: number, text: string) {
    const cellRef = XLSX.utils.encode_cell({c: 0, r: row});
    this.ensureCellExists(worksheet, cellRef);
    
    const cell = worksheet[cellRef];
    cell.v = text;
    cell.t = 's';
    
    // Merge A-G (0-6)
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({
        s: { r: row, c: 0 },
        e: { r: row, c: 6 }
    });
    
    // Style
    this.setCellStyle(worksheet, cellRef, {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: this.PRIMARY_COLOR } },
        alignment: { horizontal: 'right', vertical: 'center' }
    });
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

  private insertFavorDetails(worksheet: XLSX.WorkSheet, cedula: CedulaPayload): any {
    const detallesFavor = (cedula.detalles || []).filter(d => d.tipo === 'FAVOR');
    const startRow = 9; // A10 es índice 9
    let lastModifiedRow = startRow; // Default si no hay detalles (asumiendo que al menos la fila 9 existe)

    if (detallesFavor.length > 0) {
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
        
        // Actualizar lastModifiedRow (los dos renglones extra están en indices lastDetailRow y lastDetailRow+1)
        lastModifiedRow = lastDetailRow + 1;

        const summaryRefs = this.updateSummaryFormulas(worksheet, startRow, numRows);
        return { lastRow: lastModifiedRow, refs: summaryRefs };
    } else {
        // Si no hay detalles, la plantilla tiene una fila vacía en startRow?
        // Asumimos que la plantilla base tiene espacio. Si no se insertó nada, la "última modificada" 
        // podría considerarse la fila de encabezados (8) o la fila vacía (9).
        // Para seguridad, si no hay datos, asumimos que la fila 9 está vacía y lista.
        // Pero si la tabla está vacía, quizás deberíamos devolver 9.
        lastModifiedRow = startRow;
        return { lastRow: lastModifiedRow, refs: {} };
    }
  }

  private insertPagarDetails(worksheet: XLSX.WorkSheet, cedula: CedulaPayload, lastFavorRow: number): any {
    const detallesPagar = (cedula.detalles || []).filter(d => d.tipo === 'PAGAR');
    if (detallesPagar.length === 0) return { lastRow: lastFavorRow, refs: {} };

    // Comienza un renglón abajo de la última línea modificada en COBRAR (Gap de 1 fila vacía)
    // lastFavorRow es el índice de la última fila tocada (incluyendo los 2 extra)
    const startSectionRow = lastFavorRow + 2;

    // Estructura PAGAR:
    // 1. Título (1 fila)
    // 2. Encabezados (1 fila)
    // 3. Datos (N filas)
    // 4. Espacio extra/colores (2 filas)
    const numDataRows = detallesPagar.length;
    const rowsToInsert = 1 + 1 + numDataRows + 2; // Título + Header + Datos + 2 Extra

    // Desplazar contenido hacia abajo para hacer espacio
    this.shiftRowsDown(worksheet, startSectionRow, rowsToInsert);

    // 1. Título "SERVICIOS OTORGADOS EN OTRA SUCURSAL | POR PAGAR A OTRAS FILIALES"
    // Usamos el mismo estilo que A8 pero con otro texto
    // Asumimos que va en la columna A
    const titleRow = startSectionRow;
    const cellTitleRef = XLSX.utils.encode_cell({c: 0, r: titleRow});
    
    // Texto y estilo del título
    const titleText = "SERVICIOS OTORGADOS EN OTRA SUCURSAL | POR PAGAR A OTRAS FILIALES";
    this.ensureCellExists(worksheet, cellTitleRef);
    const cellTitle = worksheet[cellTitleRef];
    cellTitle.v = titleText;
    cellTitle.t = 's';
    
    this.setCellStyle(worksheet, cellTitleRef, {
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: this.PRIMARY_COLOR } },
        alignment: { horizontal: 'left', vertical: 'center' }
    });

    // Merge A-I (Cols 0-8) para el título
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({
        s: { r: titleRow, c: 0 },
        e: { r: titleRow, c: 8 }
    });

    // Columna K en fila de título PAGAR con mismo formato
    const cellRefK = XLSX.utils.encode_cell({c: 10, r: titleRow});
    this.ensureCellExists(worksheet, cellRefK);
    this.setCellStyle(worksheet, cellRefK, {
        fill: { fgColor: { rgb: this.PRIMARY_COLOR } }
    });

    // 2. Encabezados de tabla
    const headerRow = startSectionRow + 1;
    // Copiamos los encabezados de la fila 8 (A9:K9) o los definimos manualmente
    // Definición manual para asegurar consistencia
    const headers = [
        "SUCURSAL ORIGEN", "SUCURSAL OTORGANTE", "TITULAR", "FINADO", "CONTRATO", 
        "FECHA", "CONCEPTO", "MONTO", "SALDO PABS*", "OBSERVACION", "SALDOS EFECTIVAMENTE COBRADOS"
    ];

    headers.forEach((header, index) => {
        const cellRef = XLSX.utils.encode_cell({c: index, r: headerRow});
        this.ensureCellExists(worksheet, cellRef);
        worksheet[cellRef] = { t: 's', v: header };
        
        const style: any = {
            font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: this.PRIMARY_COLOR } },
            fill: { fgColor: { rgb: this.SECONDARY_COLOR } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
        };

        // Estilos específicos por columna (igual que applyTableHeadersStyle)
        if (index === 8) style.fill = { fgColor: { rgb: this.GREY_COLOR } }; // Saldo PABS
        if (index === 9) delete style.fill; // Observación
        
        this.setCellStyle(worksheet, cellRef, style);
    });

    // 3. Insertar datos
    const dataStartRow = startSectionRow + 2;
    detallesPagar.forEach((d, i) => {
        const currentRow = dataStartRow + i;
        this.setRowHeight(worksheet, currentRow, 12.75);
        this.insertDetailRow(worksheet, currentRow, d);
    });

    // 4. Extender colores (2 filas extra)
    const lastDataRow = dataStartRow + numDataRows;
    for (let r = lastDataRow; r < lastDataRow + 2; r++) {
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

    // Subtotales para PAGAR
    const subtotalRow = lastDataRow + 1; // Un renglón abajo del detalle (coincide con la segunda fila extra)
    
    // Definimos estilo común
    const subtotalStyle = {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: this.PRIMARY_COLOR } },
        fill: { fgColor: { rgb: this.SECONDARY_COLOR } },
        alignment: { horizontal: 'right', vertical: 'center' }
    };

    // G = 'SUBTOTAL'
    const cellG = XLSX.utils.encode_cell({c: 6, r: subtotalRow});
    this.ensureCellExists(worksheet, cellG);
    worksheet[cellG].v = 'SUBTOTAL';
    this.setCellStyle(worksheet, cellG, subtotalStyle);

    // H = SUM Columna H (Monto)
    const cellH = XLSX.utils.encode_cell({c: 7, r: subtotalRow});
    this.ensureCellExists(worksheet, cellH);
    const startH = XLSX.utils.encode_cell({c: 7, r: dataStartRow});
    const endH = XLSX.utils.encode_cell({c: 7, r: dataStartRow + numDataRows - 1});
    this.setFormula(worksheet, cellH, `SUM(${startH}:${endH})`, this.ACCOUNTING_FORMAT);
    this.setCellStyle(worksheet, cellH, subtotalStyle);

    // J = 'SUBTOTAL'
    const cellJ = XLSX.utils.encode_cell({c: 9, r: subtotalRow});
    this.ensureCellExists(worksheet, cellJ);
    worksheet[cellJ].v = 'SUBTOTAL';
    this.setCellStyle(worksheet, cellJ, subtotalStyle);

    // K = SUM Columna K (Monto Recuperado)
    const cellK = XLSX.utils.encode_cell({c: 10, r: subtotalRow});
    this.ensureCellExists(worksheet, cellK);
    const startK = XLSX.utils.encode_cell({c: 10, r: dataStartRow});
    const endK = XLSX.utils.encode_cell({c: 10, r: dataStartRow + numDataRows - 1});
    this.setFormula(worksheet, cellK, `SUM(${startK}:${endK})`, this.ACCOUNTING_FORMAT);
    this.setCellStyle(worksheet, cellK, subtotalStyle);

    return { lastRow: subtotalRow, refs: { subtotalPagar: cellH, subtotalSaldosPagar: cellK } };
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

    let subtotalCobrar = '';
    let subtotalSaldosCobrar = '';

    for (let r = startRow + numRows; r <= rangeSearch.e.r; r++) {
       const cellRefH = XLSX.utils.encode_cell({c: 7, r: r});
       const cellRefK = XLSX.utils.encode_cell({c: 10, r: r});
       let isSubtotalRow = false;
       
       if (!foundH && this.isPlaceholder(worksheet, cellRefH, '{subtotalFAVOR}')) {
           this.setFormula(worksheet, cellRefH, `SUM(H${firstDataRow}:H${lastDataRow})`, this.ACCOUNTING_FORMAT);
           foundH = true;
           isSubtotalRow = true;
           subtotalCobrar = cellRefH;
       }

       if (!foundK && this.isPlaceholder(worksheet, cellRefK, '{saldosCobrados}')) {
           this.setFormula(worksheet, cellRefK, `SUM(K${firstDataRow}:K${lastDataRow})`, this.ACCOUNTING_FORMAT);
           foundK = true;
           isSubtotalRow = true;
           subtotalSaldosCobrar = cellRefK;
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

    return { subtotalCobrar, subtotalSaldosCobrar };
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
