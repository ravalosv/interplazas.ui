import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CedulaService } from 'src/app/core/services/cedula.service';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { CedulaExcelService } from 'src/app/core/services/cedula-excel.service';
import { CedulaPayload, CedulaDetallePayload } from 'src/app/core/interfaces/payloads/cedula.payload';
import { FilialService } from 'src/app/core/services/filial.service';
import { PeriodoService } from 'src/app/core/services/periodo.service';
import { EmailTemplateService } from 'src/app/core/services/email-template.service';
import { PeriodoPayload } from 'src/app/core/interfaces/payloads/periodo.payload';
import { ApiReturn } from 'src/app/core/interfaces/payloads/api_return';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cedula-detalle',
  templateUrl: './cedula-detalle.component.html',
  styleUrls: ['./cedula-detalle.component.scss'],
})
export class CedulaDetalleComponent implements OnInit {
  cedula: CedulaPayload | null = null;
  loading = false;
  exporting = false;
  sending = false;
  searchTermFavor = '';
  searchTermPagar = '';
  searchTermUSA = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cedulaService: CedulaService,
    private alertsService: AlertsService,
    private cedulaExcelService: CedulaExcelService,
    private filialService: FilialService,
    private periodoService: PeriodoService,
    private emailTemplateService: EmailTemplateService,
    private http: HttpClient
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
    this.exporting = true;
    this.cedulaService.getById(this.cedula.id).subscribe({
      next: (ret) => {
        this.exporting = false;
        if (ret.success) {
          this.cedulaExcelService.generateExcel(ret.data);
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.exporting = false;
        this.alertsService.error(e.error);
      }
    });
  }

  async enviarCedulaCorreo() {
    if (!this.cedula) return;
    this.sending = true;
    try {
      const cedulaRet = await firstValueFrom(this.cedulaService.getById(this.cedula.id));
      if (!cedulaRet.success) {
        this.alertsService.error(cedulaRet.error || 'Error al cargar la cédula');
        this.sending = false;
        return;
      }

      const cedula = cedulaRet.data;
      const [filialRet, periodosRet] = await Promise.all([
        firstValueFrom(this.filialService.getById(cedula.filialId)),
        firstValueFrom(this.periodoService.getAll()),
      ]);

      if (!filialRet.success) {
        this.alertsService.error(filialRet.error || 'Error al cargar la filial');
        this.sending = false;
        return;
      }

      if (!periodosRet.success) {
        this.alertsService.error(periodosRet.error || 'Error al cargar los periodos');
        this.sending = false;
        return;
      }

      const filial = filialRet.data;
      const periodo = (periodosRet.data as PeriodoPayload[]).find(p => p.id === cedula.periodoId);

      if (!periodo) {
        this.alertsService.error('Periodo no encontrado');
        this.sending = false;
        return;
      }

      const templateId = filial.cedula_template_id;
      const destinatarios = filial.cedula_destinatarios_email;

      if (!templateId) {
        this.alertsService.error('EMAIL_TEMPLATE_NOT_CONFIGURED');
        this.sending = false;
        return;
      }

      if (!destinatarios) {
        this.alertsService.error('RECIPIENTS_MISSING');
        this.sending = false;
        return;
      }

      const templateRet = await firstValueFrom(this.emailTemplateService.getById(templateId));
      if (!templateRet.success) {
        this.alertsService.error(templateRet.error || 'Error al cargar la plantilla de correo');
        this.sending = false;
        return;
      }

      const template = templateRet.data as any;

      const tags: Record<string, string> = {
        periodo: periodo.nombre || '',
        fecha_revision: periodo.fecha_revision || '',
        fecha_reenvio_cedulas: periodo.fecha_reenvio_cedulas || '',
        fecha_visto_bueno: periodo.fecha_visto_bueno || '',
        fecha_cierre_periodo: periodo.fecha_cierre_periodo || '',
      };

      const subject = this.applySubjectTags(template.titulo || '', tags);

      const excel = await this.cedulaExcelService.getExcelBlob(cedula);

      const formData = new FormData();
      formData.append('to', destinatarios);
      formData.append('subject', subject);
      formData.append('template', template.template);
      formData.append('tags', JSON.stringify(tags));
      formData.append('attachments', excel.blob, excel.fileName);

      const mailRet = await firstValueFrom(this.http.post<ApiReturn<{ sent: boolean }>>(`${environment.apiUrl}/mail`, formData));

      if (mailRet.success) {
        this.alertsService.success('Cédula enviada por correo');
      } else {
        this.alertsService.error(mailRet.error || 'Error al enviar la cédula');
      }
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e?.message || 'Error al enviar la cédula';
      this.alertsService.error(message);
    } finally {
      this.sending = false;
    }
  }

  private applySubjectTags(str: string, tags: Record<string, string>): string {
    return Object.keys(tags).reduce((acc, key) => {
      const val = tags[key] || '';
      return acc
        .replace(new RegExp(`\\{\\s*${key}\\s*\\}`, 'g'), val)
        .replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), val);
    }, str || '');
  }
}
