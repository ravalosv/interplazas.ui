import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import { EventoService } from 'src/app/core/services/evento.service';
import { EventoPayload } from 'src/app/core/interfaces/payloads/evento.payload';
import { AlertsService } from 'src/app/core/services/alerts.service';

@Component({
  selector: 'app-event-edit',
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.scss'],
})
export class EventEditComponent implements OnInit, OnDestroy {
  eventoId: string | null = '';
  evento: EventoPayload | null = null;

  constructor(
    private route: ActivatedRoute,
    private eventoService: EventoService,
    private alertsService: AlertsService,
    private encryptionService: EncryptionService
  ) {}

  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.eventoId = this.route.snapshot.paramMap.get('id');
    this.eventoId = this.encryptionService.decrypt(this.eventoId!);

    this.loadData();
  }

  loadData() {
    if (this.eventoId) {
      this.eventoService.getEventos('todos', this.eventoId, true).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.evento = ret.data[0];
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => {
          this.alertsService.error(e);
        },
        complete: () => {},
      });
    } else {
    }
  }
}
