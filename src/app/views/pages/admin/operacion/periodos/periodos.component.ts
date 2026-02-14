import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { PeriodoService } from 'src/app/core/services/periodo.service';
import { EstadoCuentaService } from 'src/app/core/services/estado-cuenta.service';
import { PeriodoPayload } from 'src/app/core/interfaces/payloads/periodo.payload';

@Component({
  selector: 'app-periodos',
  templateUrl: './periodos.component.html',
  styleUrls: ['./periodos.component.scss'],
})
export class PeriodosComponent implements OnInit {
  periodos: PeriodoPayload[] = [];
  displayPeriodos: PeriodoPayload[] = [];
  loading = false;
  processingId: number | null = null;
  processingAction: 'close' | 'open' | 'cedulas' | 'ec' | null = null;

  isVisibleModal = false;
  isConfirmLoading = false;
  editingPeriodo: PeriodoPayload | null = null;

  constructor(
    private periodoService: PeriodoService,
    private estadoCuentaService: EstadoCuentaService,
    private alertsService: AlertsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPeriodos();
  }

  loadPeriodos() {
    this.loading = true;
    this.periodoService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.periodos = ret.data;
          this.displayPeriodos = this.periodos;
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

  cerrarPeriodo(periodo: PeriodoPayload) {
    this.alertsService.confirm({
      titulo: 'Cerrar Periodo',
      message: `¿Está seguro de cerrar el periodo ${periodo.nombre}? Esta acción impedirá modificaciones en los servicios de este periodo.`,
      okCallback: () => {
        this.processingId = periodo.id;
        this.processingAction = 'close';
        this.periodoService.cerrar(periodo.id).subscribe({
          next: (ret) => {
            this.processingId = null;
            this.processingAction = null;
            if (ret.success) {
              this.alertsService.success('Periodo cerrado exitosamente');
              this.loadPeriodos();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.processingId = null;
            this.processingAction = null;
            this.alertsService.error(e.error);
          },
        });
      },
    });
  }

  abrirPeriodo(periodo: PeriodoPayload) {
    let message = `¿Está seguro de abrir el periodo ${periodo.nombre}? Esto permitirá modificaciones en los servicios de este periodo.`;

    if (periodo.estadoCuentaGenerado) {
      message = `¡ADVERTENCIA! El periodo ${periodo.nombre} ya tiene ESTADO DE CUENTA y CÉDULAS generados. Si lo abre, AMBOS SERÁN ELIMINADOS y tendrá que generarlos nuevamente. ¿Está seguro de continuar?`;
    } else if (periodo.cedulas && periodo.cedulas.length > 0) {
      message = `¡ADVERTENCIA! El periodo ${periodo.nombre} ya tiene cédulas generadas. Si lo abre, TODAS LAS CÉDULAS SERÁN ELIMINADAS. ¿Está seguro de continuar?`;
    }

    this.alertsService.confirm({
      titulo: 'Abrir Periodo',
      message: message,
      okCallback: () => {
        this.processingId = periodo.id;
        this.processingAction = 'open';
        this.periodoService.abrir(periodo.id).subscribe({
          next: (ret) => {
            this.processingId = null;
            this.processingAction = null;
            if (ret.success) {
              this.alertsService.success('Periodo abierto exitosamente');
              this.loadPeriodos();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.processingId = null;
            this.processingAction = null;
            this.alertsService.error(e.error);
          },
        });
      },
    });
  }

  generarCedulas(periodo: PeriodoPayload) {
    this.alertsService.confirm({
      titulo: 'Generar Cédulas',
      message: `¿Desea generar las cédulas para el periodo ${periodo.nombre}?`,
      okCallback: () => {
        this.processingId = periodo.id;
        this.processingAction = 'cedulas';
        this.periodoService.generarCedulas(periodo.anio, periodo.mes).subscribe({
          next: (ret) => {
            this.processingId = null;
            this.processingAction = null;
            if (ret.success) {
              this.alertsService.success('Cédulas generadas exitosamente');
              this.loadPeriodos();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.processingId = null;
            this.processingAction = null;
            this.alertsService.error(e.error);
          },
        });
      },
    });
  }

  generarEstadoCuenta(periodo: PeriodoPayload) {
    if (periodo.activo) {
      this.alertsService.warning('El periodo debe estar cerrado para generar el estado de cuenta.');
      return;
    }

    if (periodo.estadoCuentaGenerado) {
      this.alertsService.warning('El estado de cuenta ya ha sido generado para este periodo.');
      return;
    }

    if (!periodo.cedulas || periodo.cedulas.length === 0) {
      this.alertsService.warning('No hay cédulas generadas para este periodo.');
      return;
    }

    this.alertsService.confirm({
      titulo: 'Generar Estado de Cuenta',
      message: `¿Está seguro de generar el estado de cuenta para el periodo ${periodo.nombre}? Esta acción no se puede deshacer.`,
      okCallback: () => {
        this.processingId = periodo.id;
        this.processingAction = 'ec';
        this.estadoCuentaService.generar(periodo.id).subscribe({
          next: (ret) => {
            this.processingId = null;
            this.processingAction = null;
            if (ret.success) {
              this.alertsService.success(ret.data.message);
              this.loadPeriodos(); // Recargar para actualizar estado
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.processingId = null;
            this.processingAction = null;
            this.alertsService.error(e.error);
          },
        });
      },
    });
  }

  openEditModal(periodo: PeriodoPayload) {
    this.editingPeriodo = { ...periodo };
    this.isVisibleModal = true;
  }

  handleCancel() {
    this.isVisibleModal = false;
    this.editingPeriodo = null;
  }

  handleOk() {
    if (!this.editingPeriodo) return;
    
    this.isConfirmLoading = true;
    const { id, fecha_revision, fecha_reenvio_cedulas, fecha_visto_bueno, fecha_cierre_periodo } = this.editingPeriodo;
    
    this.periodoService.update(id, {
      fecha_revision,
      fecha_reenvio_cedulas,
      fecha_visto_bueno,
      fecha_cierre_periodo
    }).subscribe({
      next: (ret) => {
        this.isConfirmLoading = false;
        if (ret.success) {
          this.isVisibleModal = false;
          this.alertsService.success('Fechas actualizadas correctamente');
          this.loadPeriodos();
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.isConfirmLoading = false;
        this.alertsService.error(e.error);
      }
    });
  }

  // Sorting functions
  sortId = (a: PeriodoPayload, b: PeriodoPayload) => a.id - b.id;
  sortNombre = (a: PeriodoPayload, b: PeriodoPayload) => (a.nombre || '').localeCompare(b.nombre || '');
  sortMes = (a: PeriodoPayload, b: PeriodoPayload) => a.mes - b.mes;
  sortAnio = (a: PeriodoPayload, b: PeriodoPayload) => a.anio - b.anio;
  sortEstado = (a: PeriodoPayload, b: PeriodoPayload) => (a.activo === b.activo) ? 0 : a.activo ? -1 : 1;
}
