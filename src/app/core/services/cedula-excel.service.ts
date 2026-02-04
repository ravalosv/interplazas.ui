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
  private readonly RED_ACCOUNTING_FORMAT = '_("$"* #,##0.00_);[Red]_("$"* \\(#,##0.00\\);_("$"* "-"??_);_(@_)';
  public readonly TEMPLATE_PATH = 'assets/docs/plantilla_cedula.xlsx';

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) { }

  public async generateExcel(cedula: CedulaPayload) {
    try {
      const [buffer, settingsRet] = await Promise.all([
        firstValueFrom(this.http.get(this.TEMPLATE_PATH, { responseType: 'arraybuffer' })),
        firstValueFrom(this.settingsService.getAll())
      ]);

      const settings = (settingsRet.success && settingsRet.data.length > 0) ? settingsRet.data[0] : null;
      
      const workbook = this.createCedulaWorkbook(buffer, cedula, settings);
      if (workbook) {
        this.saveFile(workbook, cedula);
      }
    } catch (err) {
      console.error('Error loading Excel template or settings', err);
    }
  }

  public async getExcelBlob(cedula: CedulaPayload): Promise<{ blob: Blob, fileName: string }> {
    const [buffer, settingsRet] = await Promise.all([
        firstValueFrom(this.http.get(this.TEMPLATE_PATH, { responseType: 'arraybuffer' })),
        firstValueFrom(this.settingsService.getAll())
    ]);

    const settings = (settingsRet.success && settingsRet.data.length > 0) ? settingsRet.data[0] : null;
    
    return this.createExcelFromPreloaded(buffer, settings, cedula);
  }

  public createExcelFromPreloaded(
    templateBuffer: ArrayBuffer,
    settings: SettingsPayload | null,
    cedula: CedulaPayload
  ): { blob: Blob, fileName: string } {
    const workbook = this.createCedulaWorkbook(templateBuffer, cedula, settings);
    if (!workbook) {
        throw new Error('Could not create workbook');
    }

    return this.generateBlob(workbook, cedula);
  }

  private createCedulaWorkbook(buffer: ArrayBuffer, cedula: CedulaPayload, settings: SettingsPayload | null): XLSX.WorkBook | null {
    const isForeign = !!(cedula.filial && cedula.filial.extranjera);
    return this.buildCedulaWorkbook(buffer, cedula, settings, isForeign);
  }

  private buildCedulaWorkbook(buffer: ArrayBuffer, cedula: CedulaPayload, settings: SettingsPayload | null, isForeign: boolean): XLSX.WorkBook | null {
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

    if (!worksheet) return null;

    this.applyTitleAndHeaderStyles(worksheet, cedula);
    
    const summaryRefs: any = {};
    
    // 1. Section COBRAR
    // Nacional -> Favor Details
    // Extranjera -> USA Details (labeled as Cobrar)
    let cobrarResult;
    if (isForeign) {
        cobrarResult = this.insertCobrarExtranjeraDetails(worksheet, cedula);
    } else {
        cobrarResult = this.insertFavorDetails(worksheet, cedula);
    }
    const lastCobrarRow = cobrarResult.lastRow;
    Object.assign(summaryRefs, cobrarResult.refs);

    // 2. Section PAGAR (Common)
    const pagarResult = this.insertPagarDetails(worksheet, cedula, lastCobrarRow);
    Object.assign(summaryRefs, pagarResult.refs);
    
    const lastPagarRow = pagarResult.lastRow;

    // 3. Subtotales (Common)
    const lastSubtotalRow = this.insertSubtotales(worksheet, lastPagarRow, cedula, summaryRefs, settings);
    
    // 4. Total Final (Common logic, conditional disclaimer)
    const showDisclaimer = !isForeign;
    const disclaimerRow = this.insertTotalFinal(worksheet, lastSubtotalRow, summaryRefs, showDisclaimer);

    // 5. USA Section (Only for Nacional)
    if (!isForeign) {
        const resultUSA = this.insertUSADetails(worksheet, cedula, disclaimerRow);
        this.insertUSATotal(worksheet, resultUSA.lastRow, resultUSA.refs);
    }

    return workbook;
  }

  private insertSubtotales(worksheet: XLSX.WorkSheet, lastRow: number, cedula: CedulaPayload, refs: any, settings: SettingsPayload | null): number {
    let currentRow = lastRow + 2;

    // 1. TOTAL COMISIONES
    this.insertSummaryLabel(worksheet, currentRow, "TOTAL COMISIONES:");
    
    // Formula para H: subtotalCobrar - subtotalPagar
    const totalComisiones = XLSX.utils.encode_cell({c: 7, r: currentRow});
    this.ensureCellExists(worksheet, totalComisiones);
    const cellH = worksheet[totalComisiones];
    
    const cobrar = refs.subtotalCobrar;
    const pagar = refs.subtotalPagar;
    
    if (cobrar && pagar) {
        this.setFormula(worksheet, totalComisiones, `${cobrar}-${pagar}`, this.RED_ACCOUNTING_FORMAT);
    } else if (cobrar) {
        this.setFormula(worksheet, totalComisiones, cobrar, this.RED_ACCOUNTING_FORMAT);
    } else if (pagar) {
        // Si solo hay pagar, el resultado sería negativo (0 - pagar)
        this.setFormula(worksheet, totalComisiones, `-${pagar}`, this.RED_ACCOUNTING_FORMAT);
    } else {
        cellH.v = 0;
        cellH.t = 'n';
        cellH.z = this.RED_ACCOUNTING_FORMAT;
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
        this.setFormula(worksheet, totalSaldos, `${saldosPagar}-${saldosCobrar}`, this.RED_ACCOUNTING_FORMAT);
    } else if (saldosPagar) {
        this.setFormula(worksheet, totalSaldos, saldosPagar, this.RED_ACCOUNTING_FORMAT);
    } else if (saldosCobrar) {
        // Si solo hay saldosCobrar, sería 0 - saldosCobrar
        this.setFormula(worksheet, totalSaldos, `-${saldosCobrar}`, this.RED_ACCOUNTING_FORMAT);
    } else {
        cellK.v = 0;
        cellK.t = 'n';
        cellK.z = this.RED_ACCOUNTING_FORMAT;
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
    const comisionStr = `Comision por Gestion PF ${comisionVal * 100}%`;
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

  private insertTotalFinal(worksheet: XLSX.WorkSheet, lastRow: number, refs: any, showDisclaimer: boolean = true): number {
    const currentRow = lastRow + 1;
    
    // Total Final: totalComisiones + totalSaldos
    const cellHRef = this.insertGrandTotalRow(
        worksheet, 
        currentRow, 
        "TOTAL FINAL", 
        refs.totalComisiones, 
        refs.totalSaldos, 
        '+'
    );

    // Guardar referencia
    refs.totalFinal = cellHRef;

    if (showDisclaimer) {
        // Disclaimer USA: 2 lineas abajo del total final
        const disclaimerRow = currentRow + 2;
        const disclaimerRef = XLSX.utils.encode_cell({c: 0, r: disclaimerRow});
        this.ensureCellExists(worksheet, disclaimerRef);
        const disclaimerCell = worksheet[disclaimerRef];
        
        disclaimerCell.v = "Estos servicios fueron otorgados en Estados Unidos, su pago procederá por separado y en dólares. La tarifa vigente y pactada por mesa directiva para un Servicio CCI con sucursal USA, es de $1,200dlls.";
        disclaimerCell.t = 's';

        // Merge A-K (0-10)
        if (!worksheet['!merges']) worksheet['!merges'] = [];
        worksheet['!merges'].push({
            s: { r: disclaimerRow, c: 0 },
            e: { r: disclaimerRow, c: 10 }
        });

        // Style: Calibri, 9, bold, negro, left, sin fondo
        this.setCellStyle(worksheet, disclaimerRef, {
            font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: "000000" } },
            alignment: { horizontal: 'left', vertical: 'center' }
        });

        return disclaimerRow;
    }

    return currentRow;
  }

  private insertGrandTotalRow(
    worksheet: XLSX.WorkSheet,
    row: number,
    label: string,
    val1: string | undefined,
    val2: string | undefined,
    operation: '+' | '-'
  ): string {
    // Label A-G
    const cellRef = XLSX.utils.encode_cell({c: 0, r: row});
    this.ensureCellExists(worksheet, cellRef);
    const cell = worksheet[cellRef];
    cell.v = label;
    cell.t = 's';
    
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({ s: { r: row, c: 0 }, e: { r: row, c: 6 } });
    
    this.setCellStyle(worksheet, cellRef, {
        font: { name: 'Calibri', sz: 24, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: this.PRIMARY_COLOR } },
        alignment: { horizontal: 'right', vertical: 'center' }
    });

    // Value H-K
    worksheet['!merges'].push({ s: { r: row, c: 7 }, e: { r: row, c: 10 } });
    const cellHRef = XLSX.utils.encode_cell({c: 7, r: row});
    this.ensureCellExists(worksheet, cellHRef);
    const cellH = worksheet[cellHRef];

    // Formula Logic
    if (val1 && val2) {
        this.setFormula(worksheet, cellHRef, `${val1}${operation}${val2}`, this.RED_ACCOUNTING_FORMAT);
    } else if (val1) {
        this.setFormula(worksheet, cellHRef, val1, this.RED_ACCOUNTING_FORMAT);
    } else if (val2) {
        const formula = operation === '-' ? `-${val2}` : val2;
        this.setFormula(worksheet, cellHRef, formula, this.RED_ACCOUNTING_FORMAT);
    } else {
        cellH.v = 0;
        cellH.t = 'n';
        cellH.z = this.RED_ACCOUNTING_FORMAT;
    }

    // Style H-K
    const totalStyle = {
        font: { name: 'Calibri', sz: 24, bold: true, color: { rgb: this.PRIMARY_COLOR } },
        fill: { fgColor: { rgb: "A9D08E" } },
        alignment: { horizontal: 'right', vertical: 'center' }
    };
    
    for (let c = 7; c <= 10; c++) {
        const ref = XLSX.utils.encode_cell({c: c, r: row});
        this.ensureCellExists(worksheet, ref);
        this.setCellStyle(worksheet, ref, totalStyle);
    }

    return cellHRef;
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
  }

  private insertCobrarExtranjeraDetails(worksheet: XLSX.WorkSheet, cedula: CedulaPayload): any {
    const detallesUSA = (cedula.detalles || []).filter(d => d.tipo === 'USA');
    
    // Título en fila 8 (índice 7), Headers en fila 9 (índice 8), Datos inician en fila 10 (índice 9)
    // Usamos el mismo layout que favor
    const startRow = 7;
    const shiftFromRow = 9;

    return this.insertGenericSection(worksheet, detallesUSA, startRow, {
        title: "SERVICIOS OTORGADOS EN SUCURSAL | POR COBRAR A FAVOR DE LA FILIAL",
        headers: [
            "SUCURSAL ORIGEN", "SUCURSAL OTORGANTE", "TITULAR", "FINADO", "CONTRATO", 
            "FECHA", "CONCEPTO", "MONTO DLLS", "SALDO PABS*", "OBSERVACION", "SALDOS EFECTIVAMENTE COBRADOS"
        ],
        refKeys: { monto: 'subtotalCobrar', saldos: 'subtotalSaldosCobrar' },
        shiftFromRow: shiftFromRow
    });
  }

  private insertFavorDetails(worksheet: XLSX.WorkSheet, cedula: CedulaPayload): any {
    const detallesFavor = (cedula.detalles || []).filter(d => d.tipo === 'FAVOR');
    
    // Título en fila 8 (índice 7), Headers en fila 9 (índice 8), Datos inician en fila 10 (índice 9)
    // Pero shift debe ocurrir desde fila 10 (índice 9) para preservar lo que haya abajo (si hay)
    const startRow = 7;
    const shiftFromRow = 9;

    return this.insertGenericSection(worksheet, detallesFavor, startRow, {
        title: "SERVICIOS OTORGADOS EN SUCURSAL | POR COBRAR A FAVOR DE LA FILIAL",
        headers: [
            "SUCURSAL ORIGEN", "SUCURSAL OTORGANTE", "TITULAR", "FINADO", "CONTRATO", 
            "FECHA", "CONCEPTO", "MONTO", "SALDO PABS*", "OBSERVACION", "SALDOS EFECTIVAMENTE COBRADOS"
        ],
        refKeys: { monto: 'subtotalCobrar', saldos: 'subtotalSaldosCobrar' },
        shiftFromRow: shiftFromRow
    });
  }

  private insertGenericSection(
    worksheet: XLSX.WorkSheet, 
    detalles: any[], 
    startRow: number, 
    config: {
        title: string,
        headers: string[],
        refKeys: { monto: string, saldos: string },
        shiftFromRow?: number
    }
  ): any {
    const hasDetails = detalles.length > 0;
    const numDataRows = hasDetails ? detalles.length : 1;
    // Filas necesarias: Título (1) + Header (1) + Datos (N) + Espacio/Colores (2)
    const rowsNeeded = 1 + 1 + numDataRows + 2;

    // Calcular desplazamiento
    // Si shiftFromRow está definido, desplazamos desde ahí.
    // Cantidad a desplazar = Total necesario - (Lo que sobrescribimos antes del shift)
    // Sobrescrito = shiftFromRow - startRow
    const shiftStartRow = config.shiftFromRow ?? startRow;
    const rowsToShift = config.shiftFromRow ? rowsNeeded - (config.shiftFromRow - startRow) : rowsNeeded;

    this.shiftRowsDown(worksheet, shiftStartRow, rowsToShift);

    // 1. Título
    const titleRow = startRow;
    const cellTitleRef = XLSX.utils.encode_cell({c: 0, r: titleRow});
    this.ensureCellExists(worksheet, cellTitleRef);
    const cellTitle = worksheet[cellTitleRef];
    cellTitle.v = config.title;
    cellTitle.t = 's';
    
    this.setCellStyle(worksheet, cellTitleRef, {
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: this.PRIMARY_COLOR } },
        alignment: { horizontal: 'left', vertical: 'center' }
    });

    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({
        s: { r: titleRow, c: 0 },
        e: { r: titleRow, c: 8 }
    });

    const cellRefK = XLSX.utils.encode_cell({c: 10, r: titleRow});
    this.ensureCellExists(worksheet, cellRefK);
    this.setCellStyle(worksheet, cellRefK, {
        fill: { fgColor: { rgb: this.PRIMARY_COLOR } }
    });

    // 2. Encabezados
    const headerRow = startRow + 1;
    config.headers.forEach((header, index) => {
        const cellRef = XLSX.utils.encode_cell({c: index, r: headerRow});
        this.ensureCellExists(worksheet, cellRef);
        worksheet[cellRef] = { t: 's', v: header };
        
        const style: any = {
            font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: this.PRIMARY_COLOR } },
            fill: { fgColor: { rgb: this.SECONDARY_COLOR } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
        };

        if (index === 8) style.fill = { fgColor: { rgb: this.GREY_COLOR } };
        if (index === 9) delete style.fill;
        
        this.setCellStyle(worksheet, cellRef, style);
    });

    // 3. Datos
    const dataStartRow = startRow + 2;
    if (hasDetails) {
        detalles.forEach((d, i) => {
            const currentRow = dataStartRow + i;
            const obs = this.getFormattedObservation(d);
            const height = this.calculateObservationRowHeight(obs);
            this.setRowHeight(worksheet, currentRow, height);
            this.insertDetailRow(worksheet, currentRow, d);
        });
    } else {
        const currentRow = dataStartRow;
        this.setRowHeight(worksheet, currentRow, 12.75);
        this.insertEmptyDetailRow(worksheet, currentRow);
    }

    // 4. Extender colores
    const lastDataRow = dataStartRow + numDataRows;
    for (let r = lastDataRow; r < lastDataRow + 2; r++) {
        const cellRefI = XLSX.utils.encode_cell({c: 8, r: r});
        this.ensureCellExists(worksheet, cellRefI);
        this.setCellStyle(worksheet, cellRefI, {
            fill: { fgColor: { rgb: this.GREY_COLOR } }
        });

        const cellRefK = XLSX.utils.encode_cell({c: 10, r: r});
        this.ensureCellExists(worksheet, cellRefK);
        this.setCellStyle(worksheet, cellRefK, {
            fill: { fgColor: { rgb: this.SECONDARY_COLOR } }
        });
    }

    // Subtotales
    const subtotalRow = lastDataRow + 1;
    const subtotalStyle = {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: this.PRIMARY_COLOR } },
        fill: { fgColor: { rgb: this.SECONDARY_COLOR } },
        alignment: { horizontal: 'right', vertical: 'center' }
    };

    const cellG = XLSX.utils.encode_cell({c: 6, r: subtotalRow});
    this.ensureCellExists(worksheet, cellG);
    worksheet[cellG].v = 'SUBTOTAL';
    this.setCellStyle(worksheet, cellG, subtotalStyle);

    const cellH = XLSX.utils.encode_cell({c: 7, r: subtotalRow});
    this.ensureCellExists(worksheet, cellH);
    const startH = XLSX.utils.encode_cell({c: 7, r: dataStartRow});
    const endH = XLSX.utils.encode_cell({c: 7, r: dataStartRow + numDataRows - 1});
    this.setFormula(worksheet, cellH, `SUM(${startH}:${endH})`, this.ACCOUNTING_FORMAT);
    this.setCellStyle(worksheet, cellH, subtotalStyle);

    const cellJ = XLSX.utils.encode_cell({c: 9, r: subtotalRow});
    this.ensureCellExists(worksheet, cellJ);
    worksheet[cellJ].v = 'SUBTOTAL';
    this.setCellStyle(worksheet, cellJ, subtotalStyle);

    const cellK = XLSX.utils.encode_cell({c: 10, r: subtotalRow});
    this.ensureCellExists(worksheet, cellK);
    const startK = XLSX.utils.encode_cell({c: 10, r: dataStartRow});
    const endK = XLSX.utils.encode_cell({c: 10, r: dataStartRow + numDataRows - 1});
    this.setFormula(worksheet, cellK, `SUM(${startK}:${endK})`, this.ACCOUNTING_FORMAT);
    this.setCellStyle(worksheet, cellK, subtotalStyle);

    const refs: any = {};
    refs[config.refKeys.monto] = cellH;
    refs[config.refKeys.saldos] = cellK;

    return { lastRow: subtotalRow, refs };
  }

  private insertPagarDetails(worksheet: XLSX.WorkSheet, cedula: CedulaPayload, lastFavorRow: number): any {
    const detallesPagar = (cedula.detalles || []).filter(d => d.tipo === 'PAGAR');
    
    const startSectionRow = lastFavorRow + 2;

    return this.insertGenericSection(worksheet, detallesPagar, startSectionRow, {
        title: "SERVICIOS OTORGADOS EN OTRA SUCURSAL | POR PAGAR A OTRAS FILIALES",
        headers: [
            "SUCURSAL ORIGEN", "SUCURSAL OTORGANTE", "TITULAR", "FINADO", "CONTRATO", 
            "FECHA", "CONCEPTO", "MONTO", "SALDO PABS*", "OBSERVACION", "SALDOS EFECTIVAMENTE COBRADOS"
        ],
        refKeys: { monto: 'subtotalPagar', saldos: 'subtotalSaldosPagar' }
    });
  }

  private insertUSADetails(worksheet: XLSX.WorkSheet, cedula: CedulaPayload, lastRow: number): any {
    const detallesUSA = (cedula.detalles || []).filter(d => d.tipo === 'USA');
    
    const startSectionRow = lastRow + 1;

    return this.insertGenericSection(worksheet, detallesUSA, startSectionRow, {
        title: "SERVICIOS OTORGADOS EN SUCURSAL E.U.A | POR PAGAR ",
        headers: [
            "SUCURSAL ORIGEN", "SUCURSAL OTORGANTE", "TITULAR", "FINADO", "CONTRATO", 
            "FECHA", "CONCEPTO", "MONTO DLLS", "SALDO PABS*", "OBSERVACION", "SALDOS EFECTIVAMENTE COBRADOS"
        ],
        refKeys: { monto: 'subtotalMonto', saldos: 'subtotalSaldos' }
    });
  }

  private insertUSATotal(worksheet: XLSX.WorkSheet, lastRow: number, refs: any) {
    const currentRow = lastRow + 1;
    
    // Total USA: subtotalMonto - subtotalSaldos
    this.insertGrandTotalRow(
        worksheet, 
        currentRow, 
        "TOTAL USD", 
        refs.subtotalMonto, 
        refs.subtotalSaldos, 
        '-'
    );
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

  private getFormattedObservation(d: any): string {
    let obs = d.observacion || '';
    const chips: string[] = [];
    
    if (d.penalizado) chips.push('Reportado fuera de tiempo');
    if (d.esFilialesHermanas) chips.push('Filiales hermanas');
    if (d.aceptaConvenio) chips.push('Saldo PABS Conveniado');
    
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
    return obs;
  }

  private calculateObservationRowHeight(obs: string): number {
    if (!obs) return 12.75;
    const lines = obs.split('\n');
    let totalLines = 0;
    // Ancho aproximado de la columna J (Observacion) en caracteres
    const COL_WIDTH = 45; 
    
    lines.forEach(line => {
        if (line.length === 0) {
            totalLines += 1;
        } else {
            totalLines += Math.ceil(line.length / COL_WIDTH);
        }
    });
    
    return Math.max(12.75, totalLines * 12.75);
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

    const obs = this.getFormattedObservation(d);
    setCell(9, obs, 's', '', { 
        alignment: { wrapText: true, vertical: 'center' }
    });
    
    setCell(10, d.saldoEfectivamenteCobrado ? Number(d.saldoEfectivamenteCobrado) : 0, 'n', this.ACCOUNTING_FORMAT, { fill: { fgColor: { rgb: this.SECONDARY_COLOR } } });
  }

  private insertEmptyDetailRow(worksheet: XLSX.WorkSheet, row: number) {
    const setCell = (col: number, styleOverrides?: any) => {
      const ref = XLSX.utils.encode_cell({c: col, r: row});
      worksheet[ref] = { t: 's', v: '' };
      
      let style: any = { font: { name: 'Calibri', sz: 10 } };
      if (styleOverrides) {
        style = { ...style, ...styleOverrides };
      }
      
      this.setCellStyle(worksheet, ref, style);
    };

    // 0-6: Standard
    for (let c = 0; c <= 6; c++) setCell(c);
    
    // 7: Monto
    setCell(7);
    
    // 8: Saldo PABS (Grey)
    setCell(8, { fill: { fgColor: { rgb: this.GREY_COLOR } } });
    
    // 9: Observacion
    setCell(9, { alignment: { wrapText: true, vertical: 'center' } });
    
    // 10: Saldo Efectivamente Cobrado (Secondary)
    setCell(10, { fill: { fgColor: { rgb: this.SECONDARY_COLOR } } });
  }

  private generateBlob(workbook: XLSX.WorkBook, cedula: CedulaPayload): { blob: Blob, fileName: string } {
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      cellStyles: true 
    });
    
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filial = this.cleanFileName(cedula.filialNombre);
    const periodo = this.cleanFileName(cedula.periodoNombre);
    const fileName = filial && periodo ? `cedula_${filial}_${periodo}.xlsx` : 'cedula.xlsx';
    
    return { blob, fileName };
  }

  private saveFile(workbook: XLSX.WorkBook, cedula: CedulaPayload) {
    const { blob, fileName } = this.generateBlob(workbook, cedula);
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

    // Update range
    const cell = XLSX.utils.decode_cell(cellRef);
    const ref = worksheet['!ref'] || 'A1:A1';
    const range = XLSX.utils.decode_range(ref);
    
    let changed = false;
    if (cell.r > range.e.r) { range.e.r = cell.r; changed = true; }
    if (cell.c > range.e.c) { range.e.c = cell.c; changed = true; }
    if (cell.r < range.s.r) { range.s.r = cell.r; changed = true; }
    if (cell.c < range.s.c) { range.s.c = cell.c; changed = true; }
    
    if (changed) {
        worksheet['!ref'] = XLSX.utils.encode_range(range);
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
