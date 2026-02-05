import { Component, OnInit } from '@angular/core';
import { EstadoCuentaService } from 'src/app/core/services/estado-cuenta.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { FilialService } from 'src/app/core/services/filial.service';
import { SucursalService } from 'src/app/core/services/sucursal.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx-js-style';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss']
})
export class MovimientosComponent implements OnInit {
  movimientos: any[] = [];
  loading = false;
  filtro = '';
  private datePipe = new DatePipe('en-US');

  // Modal props
  isVisible = false;
  isOkLoading = false;
  validateForm!: FormGroup;
  modalTitle = 'Nuevo Movimiento';
  editingMovimientoId: number | null = null;
  editDisabled = false;
  minMonto: number = 0;

  // Lists
  tiposMovimiento: any[] = [];
  grupos: any[] = [];
  filiales: any[] = [];
  sucursales: any[] = [];
  
  // All Data for Filtering
  allFiliales: any[] = [];
  allSucursales: any[] = [];

  constructor(
    private estadoCuentaService: EstadoCuentaService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private grupoService: GrupoService,
    private filialService: FilialService,
    private sucursalService: SucursalService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.initForm();
    this.loadLists();
  }

  initForm() {
    this.validateForm = this.fb.group({
      fecha: [new Date(), [Validators.required]],
      tipoMovimientoId: [null, [Validators.required]],
      grupoId: [null, [Validators.required]],
      filialId: [null],
      sucursalId: [null],
      montoMXN: [0, [Validators.required]],
      montoUSD: [0, [Validators.required]],
      observacion: [''],
      referencia: ['']
    });

    this.validateForm.get('tipoMovimientoId')?.valueChanges.subscribe(val => {
        this.updateMinMonto(val);
    });
  }

  updateMinMonto(typeId: number) {
    const type = this.tiposMovimiento.find(t => t.id === typeId);
    if (type && type.nombre === 'SALDO_INICIAL') {
        this.minMonto = -1000000000; // Allow negatives
    } else {
        this.minMonto = 0; // Only positives
    }
  }

  loadLists() {
    this.estadoCuentaService.getTiposMovimiento().subscribe(data => {
      this.tiposMovimiento = (data || []).filter((t: any) => t.nombre !== 'SALDO_MENSUAL');
    });
    this.grupoService.getAll().subscribe(res => { if(res.success) this.grupos = res.data; });
    this.filialService.getAll().subscribe(res => { 
        if(res.success) {
            this.allFiliales = res.data;
            this.filiales = []; // Start empty until group selected
        }
    });
    this.sucursalService.getAll().subscribe(res => { 
        if(res.success) {
            this.allSucursales = res.data; 
            this.sucursales = []; // Start empty until filial selected
        }
    });
  }

  onGrupoChange(grupoId: number) {
    this.validateForm.patchValue({ filialId: null, sucursalId: null });
    if (grupoId) {
        this.filiales = this.allFiliales.filter(f => f.grupoId === grupoId);
    } else {
        this.filiales = [];
    }
    this.sucursales = [];
  }

  onFilialChange(filialId: number) {
    this.validateForm.patchValue({ sucursalId: null });
    if (filialId) {
        this.sucursales = this.allSucursales.filter(s => s.filialId === filialId);
    } else {
        this.sucursales = [];
    }
  }

  showModal(): void {
    this.modalTitle = 'Nuevo Movimiento';
    this.editingMovimientoId = null;
    this.editDisabled = false;
    this.validateForm.enable();
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset({
        fecha: new Date(),
        montoMXN: 0,
        montoUSD: 0
    });
  }

  handleOk(): void {
    if (this.validateForm.valid) {
      this.isOkLoading = true;
      const request$ = this.editingMovimientoId
        ? this.estadoCuentaService.updateMovimiento(this.editingMovimientoId, this.validateForm.value)
        : this.estadoCuentaService.createMovimiento(this.validateForm.value);
      request$.subscribe({
        next: (res) => {
          this.isVisible = false;
          this.isOkLoading = false;
          if (res.success) {
            this.message.success(this.editingMovimientoId ? 'Movimiento actualizado correctamente' : 'Movimiento creado correctamente');
            this.loadData();
            this.handleCancel();
          } else {
            this.message.error(res.error || (this.editingMovimientoId ? 'Error al actualizar movimiento' : 'Error al crear movimiento'));
          }
        },
        error: (err) => {
          this.isOkLoading = false;
          this.message.error(this.editingMovimientoId ? 'Error al actualizar movimiento' : 'Error al crear movimiento');
          console.error(err);
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  showEditModal(movimiento: any): void {
    this.modalTitle = 'Editar Movimiento';
    this.editingMovimientoId = movimiento.id;
    this.isVisible = true;

    const grupoId = movimiento.grupoId || null;
    const filialId = movimiento.filialId || null;
    const sucursalId = movimiento.sucursalId || null;

    this.validateForm.patchValue({
      fecha: movimiento.fecha ? new Date(movimiento.fecha) : new Date(),
      tipoMovimientoId: movimiento.tipoMovimientoId || movimiento.tipoMovimiento?.id || null,
      grupoId,
      filialId: null,
      sucursalId: null,
      montoMXN: movimiento.montoMXN ?? 0,
      montoUSD: movimiento.montoUSD ?? 0,
      observacion: movimiento.observacion || '',
      referencia: movimiento.referencia || ''
    });

    this.updateMinMonto(this.validateForm.get('tipoMovimientoId')?.value);

    this.onGrupoChange(grupoId);
    if (filialId) {
      this.validateForm.patchValue({ filialId });
      this.onFilialChange(filialId);
      if (sucursalId) {
        this.validateForm.patchValue({ sucursalId });
      }
    }

    const nombreTipo = movimiento.tipoMovimiento?.nombre || '';
    this.editDisabled = nombreTipo === 'SALDO_MENSUAL';
    if (this.editDisabled) {
      this.validateForm.disable();
    } else {
      this.validateForm.enable();
    }
  }

  loadData() {
    this.loading = true;
    this.estadoCuentaService.getAllMovimientos().subscribe({
      next: (data) => {
        this.movimientos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  get movimientosFiltrados(): any[] {
    const termino = this.filtro.toLowerCase().trim();
    if (!termino) {
      return this.movimientos;
    }
    return this.movimientos.filter((m) => {
      const periodo = m.periodo?.nombre?.toLowerCase() || '';
      const grupo = m.grupoNombre?.toLowerCase() || '';
      const filial = m.filialNombre?.toLowerCase() || '';
      const sucursal = m.sucursalNombre?.toLowerCase() || '';
      const tipo = m.tipoMovimiento?.nombre?.toLowerCase() || '';
      const observacion = m.observacion?.toLowerCase() || '';
      
      return periodo.includes(termino) ||
             grupo.includes(termino) ||
             filial.includes(termino) ||
             sucursal.includes(termino) ||
             tipo.includes(termino) ||
             observacion.includes(termino);
    });
  }

  exportToExcel() {
    const data = this.movimientosFiltrados.map(m => ({
      'Fecha': this.datePipe.transform(m.fecha, 'dd/MM/yyyy'),
      'Periodo': m.periodo?.nombre,
      'Grupo': m.grupoNombre,
      'Filial': m.filialNombre,
      'Sucursal': m.sucursalNombre,
      'Monto MXN': m.montoMXN,
      'Monto USD': m.montoUSD,
      'Tipo Movimiento': m.tipoMovimiento?.nombre,
      'Observación': m.observacion
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 12 }, // Fecha
      { wch: 20 }, // Periodo
      { wch: 25 }, // Grupo
      { wch: 25 }, // Filial
      { wch: 25 }, // Sucursal
      { wch: 15 }, // Monto MXN
      { wch: 15 }, // Monto USD
      { wch: 20 }, // Tipo
      { wch: 40 }, // Observacion
    ];
    worksheet['!cols'] = colWidths;

    const workbook = { Sheets: { 'Movimientos': worksheet }, SheetNames: ['Movimientos'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(blob, 'movimientos_estado_cuenta.xlsx');
  }

  // Funciones de ordenamiento
  sortFecha = (a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
  sortPeriodo = (a: any, b: any) => (a.periodo?.nombre || '').localeCompare(b.periodo?.nombre || '');
  sortGrupo = (a: any, b: any) => (a.grupoNombre || '').localeCompare(b.grupoNombre || '');
  sortFilial = (a: any, b: any) => (a.filialNombre || '').localeCompare(b.filialNombre || '');
  sortSucursal = (a: any, b: any) => (a.sucursalNombre || '').localeCompare(b.sucursalNombre || '');
  sortMontoMXN = (a: any, b: any) => (a.montoMXN || 0) - (b.montoMXN || 0);
  sortMontoUSD = (a: any, b: any) => (a.montoUSD || 0) - (b.montoUSD || 0);
  sortTipo = (a: any, b: any) => (a.tipoMovimiento?.nombre || '').localeCompare(b.tipoMovimiento?.nombre || '');
  sortObservacion = (a: any, b: any) => (a.observacion || '').localeCompare(b.observacion || '');
}
