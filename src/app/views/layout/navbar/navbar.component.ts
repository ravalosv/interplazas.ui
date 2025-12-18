import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject,
  Renderer2,
  TemplateRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { IUser } from 'src/app/core/interfaces/user.type';
import { IAvisoPayload } from 'src/app/core/interfaces/payloads/aviso.payload';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  currentUser: IUser;
  notificaciones: IAvisoPayload[] = [];
  notificacionesSinLeer: boolean = false;

  formAviso!: FormGroup;
  tituloModal: string = 'Aviso';
  avisoVisto: boolean = false;
  currentAviso: IAvisoPayload | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private authService: AuthenticationService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user!;
    });

    this.initForm();
  }

  initForm() {
    this.formAviso = this.fb.group({
      titulo: ['', []],
      descripcion: ['', []],
    });
  }

  /**
   * Sidebar toggle on hamburger button click
   */
  toggleSidebar(e: Event) {
    e.preventDefault();
    this.document.body.classList.toggle('sidebar-open');
  }

  /**
   * Logout
   */
  onLogout(e: Event) {
    e.preventDefault();
    this.authService.logout();
  }

  onClickNotificacion(content: TemplateRef<any>, aviso: IAvisoPayload) {
    this.tituloModal = aviso.titulo;
    this.formAviso.get('descripcion')?.setValue(aviso.descripcion);
    this.avisoVisto = aviso.visto;
    this.currentAviso = aviso;

    this.modalService
      .open(content, { size: 'md' })
      .result.then((result) => {})
      .catch((res) => {});
  }
}
