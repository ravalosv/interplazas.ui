import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CedulaService } from 'src/app/core/services/cedula.service';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { CedulaPayload, CedulaDetallePayload } from 'src/app/core/interfaces/payloads/cedula.payload';

@Component({
  selector: 'app-cedula-detalle',
  templateUrl: './cedula-detalle.component.html',
  styleUrls: ['./cedula-detalle.component.scss'],
})
export class CedulaDetalleComponent implements OnInit {
  cedula: CedulaPayload | null = null;
  loading = false;
  searchTermFavor = '';
  searchTermPagar = '';
  searchTermUSA = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cedulaService: CedulaService,
    private alertsService: AlertsService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.loadCedula(id);
      }
    }
  }

  loadCedula(id: number) {
    this.loading = true;
    this.cedulaService.getById(id).subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.cedula = ret.data;
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

  get detallesFavor() {
    let list: CedulaDetallePayload[] = [];
    
    if (this.cedula?.filial?.extranjera) {
      // Para filiales extranjeras, incluimos 'USA' en el listado de COBRAR (Favor)
      list = this.cedula?.detalles?.filter((d) => d.tipo === 'FAVOR' || d.tipo === 'USA') || [];
    } else {
      // Para filiales normales, solo 'FAVOR'
      list = this.cedula?.detalles?.filter((d) => d.tipo === 'FAVOR') || [];
    }

    if (this.searchTermFavor) {
      const term = this.searchTermFavor.toLowerCase();
      list = list.filter((d) => {
        return (
          (d.sucursalOrigenNombre && d.sucursalOrigenNombre.toLowerCase().includes(term)) ||
          (d.sucursalOtorganteNombre && d.sucursalOtorganteNombre.toLowerCase().includes(term)) ||
          (d.titular && d.titular.toLowerCase().includes(term)) ||
          (d.finado && d.finado.toLowerCase().includes(term)) ||
          (d.contrato && d.contrato.toLowerCase().includes(term)) ||
          (d.conceptoNombre && d.conceptoNombre.toLowerCase().includes(term)) ||
          (d.observacion && d.observacion.toLowerCase().includes(term))
        );
      });
    }
    return list;
  }

  get totalFavorMonto() {
    return this.detallesFavor.reduce((acc, curr) => acc + (curr.monto || 0), 0);
  }

  get totalFavorCobrado() {
    return this.detallesFavor.reduce((acc, curr) => acc + (curr.saldoEfectivamenteCobrado || 0), 0);
  }

  get detallesPagar() {
    let list = this.cedula?.detalles?.filter((d) => d.tipo === 'PAGAR') || [];
    if (this.searchTermPagar) {
      const term = this.searchTermPagar.toLowerCase();
      list = list.filter((d) => {
        return (
          (d.sucursalOrigenNombre && d.sucursalOrigenNombre.toLowerCase().includes(term)) ||
          (d.sucursalOtorganteNombre && d.sucursalOtorganteNombre.toLowerCase().includes(term)) ||
          (d.titular && d.titular.toLowerCase().includes(term)) ||
          (d.finado && d.finado.toLowerCase().includes(term)) ||
          (d.contrato && d.contrato.toLowerCase().includes(term)) ||
          (d.conceptoNombre && d.conceptoNombre.toLowerCase().includes(term)) ||
          (d.observacion && d.observacion.toLowerCase().includes(term))
        );
      });
    }
    return list;
  }

  get totalPagarMonto() {
    return this.detallesPagar.reduce((acc, curr) => acc + (curr.monto || 0), 0);
  }

  get totalPagarCobrado() {
    return this.detallesPagar.reduce((acc, curr) => acc + (curr.saldoEfectivamenteCobrado || 0), 0);
  }

  get detallesUSA() {
    // Si la filial es extranjera, no mostramos detalles USA
    if (this.cedula?.filial?.extranjera) {
      return [];
    }

    let list = this.cedula?.detalles?.filter((d) => d.tipo === 'USA') || [];
    if (this.searchTermUSA) {
      const term = this.searchTermUSA.toLowerCase();
      list = list.filter((d) => {
        return (
          (d.sucursalOrigenNombre && d.sucursalOrigenNombre.toLowerCase().includes(term)) ||
          (d.sucursalOtorganteNombre && d.sucursalOtorganteNombre.toLowerCase().includes(term)) ||
          (d.titular && d.titular.toLowerCase().includes(term)) ||
          (d.finado && d.finado.toLowerCase().includes(term)) ||
          (d.contrato && d.contrato.toLowerCase().includes(term)) ||
          (d.conceptoNombre && d.conceptoNombre.toLowerCase().includes(term)) ||
          (d.observacion && d.observacion.toLowerCase().includes(term))
        );
      });
    }
    return list;
  }

  get totalUsaMonto() {
    return this.detallesUSA.reduce((acc, curr) => acc + (curr.monto || 0), 0);
  }

  get totalUsaCobrado() {
    return this.detallesUSA.reduce((acc, curr) => acc + (curr.saldoEfectivamenteCobrado || 0), 0);
  }

  get comisionPercentage() {
    if (!this.cedula || !this.cedula.subTotalFavor || this.cedula.subTotalFavor === 0) {
      return 0;
    }
    return (this.cedula.comisionPF || 0) / this.cedula.subTotalFavor * 100;
  }

  regresar() {
    this.router.navigate(['/admin/operacion/cedulas'], {
      queryParams: this.cedula
        ? { periodoId: this.cedula.periodoId }
        : undefined,
    });
  }

  exportExcel() {
    if (!this.cedula) return;
    this.cedulaService.exportExcel(this.cedula.id);
  }
}

