import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { PeriodoService } from 'src/app/core/services/periodo.service';
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

  constructor(
    private periodoService: PeriodoService,
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
        this.periodoService.cerrar(periodo.id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Periodo cerrado exitosamente');
              this.loadPeriodos();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => this.alertsService.error(e.error),
        });
      },
    });
  }

  abrirPeriodo(periodo: PeriodoPayload) {
    let message = `¿Está seguro de abrir el periodo ${periodo.nombre}? Esto permitirá modificaciones en los servicios de este periodo.`;

    if (periodo.cedulas && periodo.cedulas.length > 0) {
      message = `¡ADVERTENCIA! El periodo ${periodo.nombre} ya tiene cédulas generadas. Si lo abre, TODAS LAS CÉDULAS SERÁN ELIMINADAS. ¿Está seguro de continuar?`;
    }

    this.alertsService.confirm({
      titulo: 'Abrir Periodo',
      message: message,
      okCallback: () => {
        this.periodoService.abrir(periodo.id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Periodo abierto exitosamente');
              this.loadPeriodos();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => this.alertsService.error(e.error),
        });
      },
    });
  }

  generarCedulas(periodo: PeriodoPayload) {
    this.alertsService.confirm({
      titulo: 'Generar Cédulas',
      message: `¿Desea generar las cédulas para el periodo ${periodo.nombre}?`,
      okCallback: () => {
        this.loading = true;
        this.periodoService.generarCedulas(periodo.anio, periodo.mes).subscribe({
          next: (ret) => {
            this.loading = false;
            if (ret.success) {
              this.alertsService.success('Cédulas generadas exitosamente');
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.loading = false;
            this.alertsService.error(e.error);
          },
        });
      },
    });
  }

  verCedulas(periodo: PeriodoPayload) {
    this.router.navigate(['/admin/operacion/cedulas'], {
      queryParams: { periodoId: periodo.id },
    });
  }

  // Sorting functions
  sortId = (a: PeriodoPayload, b: PeriodoPayload) => a.id - b.id;
  sortNombre = (a: PeriodoPayload, b: PeriodoPayload) => (a.nombre || '').localeCompare(b.nombre || '');
  sortMes = (a: PeriodoPayload, b: PeriodoPayload) => a.mes - b.mes;
  sortAnio = (a: PeriodoPayload, b: PeriodoPayload) => a.anio - b.anio;
  sortEstado = (a: PeriodoPayload, b: PeriodoPayload) => (a.activo === b.activo) ? 0 : a.activo ? -1 : 1;
}
