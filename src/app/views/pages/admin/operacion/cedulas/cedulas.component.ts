import { Component, OnInit } from '@angular/core';
import { CedulaService } from 'src/app/core/services/cedula.service';
import { PeriodoService } from 'src/app/core/services/periodo.service';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { CedulaExcelService } from 'src/app/core/services/cedula-excel.service';
import { SettingsService } from 'src/app/core/services/settings.service';
import { PeriodoPayload } from 'src/app/core/interfaces/payloads/periodo.payload';
import { CedulaPayload } from 'src/app/core/interfaces/payloads/cedula.payload';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cedulas',
  templateUrl: './cedulas.component.html',
  styleUrls: ['./cedulas.component.scss'],
})
export class CedulasComponent implements OnInit {
  periodos: PeriodoPayload[] = [];
  cedulas: CedulaPayload[] = [];
  displayCedulas: CedulaPayload[] = [];
  loading = false;
  loadingCedulas = false;
  exporting = false;
  selectedPeriodoId: number | null = null;
  filterText = '';
  private readonly selectedPeriodoStorageKey = 'cedulas.selectedPeriodoId';

  constructor(
    private cedulaService: CedulaService,
    private periodoService: PeriodoService,
    private cedulaExcelService: CedulaExcelService,
    private settingsService: SettingsService,
    private alertsService: AlertsService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.selectedPeriodoId = this.getStoredSelectedPeriodoId();
    this.loadPeriodos();
    this.route.queryParamMap.subscribe((params) => {
      const periodoIdParam = params.get('periodoId');
      if (periodoIdParam) {
        const periodoId = Number(periodoIdParam);
        if (!isNaN(periodoId)) {
          this.selectedPeriodoId = periodoId;
          this.storeSelectedPeriodoId(this.selectedPeriodoId);
          this.loadCedulas();
        }
      }
    });
  }

  private getStoredSelectedPeriodoId(): number | null {
    try {
      const raw = localStorage.getItem(this.selectedPeriodoStorageKey);
      if (!raw) return null;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private storeSelectedPeriodoId(periodoId: number | null): void {
    try {
      if (periodoId == null) {
        localStorage.removeItem(this.selectedPeriodoStorageKey);
      } else {
        localStorage.setItem(this.selectedPeriodoStorageKey, String(periodoId));
      }
    } catch {}
  }

  loadPeriodos() {
    this.loading = true;
    this.periodoService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.periodos = ret.data;
          const selectedExists =
            this.selectedPeriodoId != null && this.periodos.some(p => Number(p.id) === Number(this.selectedPeriodoId));

          if (!selectedExists && this.periodos.length > 0) {
            const mostRecent = this.periodos.reduce((prev, current) => {
              if (current.anio > prev.anio) return current;
              if (current.anio === prev.anio && current.mes > prev.mes) return current;
              return prev;
            });
            this.selectedPeriodoId = mostRecent.id;
          }

          this.storeSelectedPeriodoId(this.selectedPeriodoId);

          if (this.selectedPeriodoId && this.cedulas.length === 0) {
            this.loadCedulas();
          }
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.loading = false;
        this.alertsService.error(e.error);
      },
    });
  }

  onPeriodoChange(periodoId: number | null) {
    this.selectedPeriodoId = periodoId;
    this.storeSelectedPeriodoId(this.selectedPeriodoId);
    if (this.selectedPeriodoId) {
      this.loadCedulas();
    } else {
      this.cedulas = [];
      this.displayCedulas = [];
    }
  }

  loadCedulas() {
    if (!this.selectedPeriodoId) {
      return;
    }
    this.loadingCedulas = true;
    this.cedulaService.getByPeriodo(this.selectedPeriodoId).subscribe({
      next: (ret) => {
        this.loadingCedulas = false;
        if (ret.success) {
          this.cedulas = ret.data;
          this.applyFilter();
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.loadingCedulas = false;
        this.alertsService.error(e.error);
      },
    });
  }

  getSelectedPeriodo() {
    return this.periodos.find(p => p.id === this.selectedPeriodoId);
  }

  applyFilter() {
    if (!this.filterText) {
      this.displayCedulas = this.cedulas;
      return;
    }
    const term = this.filterText.toLowerCase();
    this.displayCedulas = this.cedulas.filter((c) => {
      const filialName = c.filial?.nombre || '';
      return filialName.toLowerCase().includes(term);
    });
  }

  verDetalle(cedula: CedulaPayload) {
    this.router.navigate(['/admin/operacion/cedulas', cedula.id]);
  }

  async exportarTodo() {
    if (!this.cedulas || this.cedulas.length === 0) return;
    
    this.exporting = true;
    try {
      const zip = new JSZip();

      // 1. Obtener recursos estáticos y configuración una sola vez
      const [buffer, settingsRet] = await Promise.all([
        firstValueFrom(this.http.get(this.cedulaExcelService.TEMPLATE_PATH, { responseType: 'arraybuffer' })),
        firstValueFrom(this.settingsService.getAll())
      ]);
      
      const settings = (settingsRet.success && settingsRet.data.length > 0) ? settingsRet.data[0] : null;

      // 2. Obtener TODAS las cédulas con detalle en una sola petición
      const cedulasFullRet = await firstValueFrom(this.cedulaService.getByPeriodoWithDetails(this.selectedPeriodoId!));
      
      if (!cedulasFullRet.success || !cedulasFullRet.data) {
         this.alertsService.error('Error al cargar los detalles de las cédulas.');
         this.exporting = false;
         return;
      }
      
      const cedulasFull = cedulasFullRet.data;

      // 3. Procesar generación de Excel en memoria
      let count = 0;
      cedulasFull.forEach((c) => {
        try {
          const res = this.cedulaExcelService.createExcelFromPreloaded(buffer, settings, c);
          zip.file(res.fileName, res.blob);
          count++;
        } catch (err) {
          console.error(`Error generando excel para cedula ${c.id}`, err);
        }
      });
      
      if (count === 0) {
        this.alertsService.warning('No se pudieron generar los archivos de las cédulas.');
        return;
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const periodo = this.periodos.find(p => p.id === this.selectedPeriodoId);
      const periodoNombre = periodo ? periodo.nombre.replace(/\s+/g, '_') : 'periodo';
      
      FileSaver.saveAs(content, `cedulas_${periodoNombre}.zip`);
      
      this.alertsService.success(`Se exportaron ${count} cédulas correctamente`);
    } catch (error) {
      console.error(error);
      this.alertsService.error('Error al exportar las cédulas');
    } finally {
      this.exporting = false;
    }
  }

  private getFilialDisplayName(cedula: CedulaPayload): string {
    const name = cedula.filial?.nombre || cedula.filialNombre;
    if (name) return String(name);
    if (cedula.filialId != null) return String(cedula.filialId);
    return '';
  }

  private toSortableNumber(value: unknown): number {
    if (value == null) return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.-]/g, '');
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    const parsed = Number(value as any);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  sortFilial = (a: CedulaPayload, b: CedulaPayload) =>
    this.getFilialDisplayName(a).localeCompare(this.getFilialDisplayName(b));

  sortTotalUsa = (a: CedulaPayload, b: CedulaPayload) =>
    this.toSortableNumber(a.totalUsa) - this.toSortableNumber(b.totalUsa);

  sortTotalComisiones = (a: CedulaPayload, b: CedulaPayload) =>
    this.toSortableNumber(a.totalComisiones) - this.toSortableNumber(b.totalComisiones);

  sortTotalFinal = (a: CedulaPayload, b: CedulaPayload) =>
    this.toSortableNumber(a.totalFinal) - this.toSortableNumber(b.totalFinal);
}

