import { Component, OnInit } from '@angular/core';
import { CedulaService } from 'src/app/core/services/cedula.service';
import { PeriodoService } from 'src/app/core/services/periodo.service';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { PeriodoPayload } from 'src/app/core/interfaces/payloads/periodo.payload';
import { CedulaPayload } from 'src/app/core/interfaces/payloads/cedula.payload';
import { ActivatedRoute, Router } from '@angular/router';

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
  selectedPeriodoId: number | null = null;

  constructor(
    private cedulaService: CedulaService,
    private periodoService: PeriodoService,
    private alertsService: AlertsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPeriodos();
    this.route.queryParamMap.subscribe((params) => {
      const periodoIdParam = params.get('periodoId');
      if (periodoIdParam) {
        const periodoId = Number(periodoIdParam);
        if (!isNaN(periodoId)) {
          this.selectedPeriodoId = periodoId;
          this.loadCedulas();
        }
      }
    });
  }

  loadPeriodos() {
    this.loading = true;
    this.periodoService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.periodos = ret.data;
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
          this.displayCedulas = this.cedulas;
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

  verDetalle(cedula: CedulaPayload) {
    this.router.navigate(['/admin/operacion/cedulas', cedula.id]);
  }
}

