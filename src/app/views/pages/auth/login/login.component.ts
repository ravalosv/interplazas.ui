import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: UntypedFormGroup;
  returnUrl: any;

  private isUsernameValid = true;
  private isPasswordValid = true;

  loginUser = {
    usernameOrEmailAddress: environment.user, //'admin_dev',
    password: environment.pass, //'admindev.123',
  };

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private alertsService: AlertsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [environment.user, [Validators.required, Validators.email]],
      password: [environment.pass, [Validators.required]],
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onLoggedin(e: Event) {
    e.preventDefault();

    if (this.loginForm.invalid) {
      for (const i in this.loginForm.controls) {
        if (this.loginForm.controls[i].invalid) {
          this.loginForm.controls[i].markAsDirty();
          this.loginForm.controls[i].updateValueAndValidity();
        }
      }

      return;
    }

    const email = this.loginForm.get('email')!.value;
    const password = this.loginForm.get('password')!.value;

    this.authService.login(email, password).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.alertsService.success('Bienvenido!');

          if (this.returnUrl != '' && this.returnUrl != '/') {
            this.router.navigate([this.returnUrl]);
          } else {
            if (this.authService.isAdmin()) {
              this.router.navigate(['admin/operacion/servicios']);
            } else {
              this.router.navigate(['client/servicios']);
            }
          }
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e.error);
      },
      complete: () => {},
    });
  }

  validate(): boolean {
    this.isUsernameValid = true;
    this.isPasswordValid = true;

    if (
      !this.loginUser.usernameOrEmailAddress ||
      this.loginUser.usernameOrEmailAddress.length === 0
    ) {
      this.isUsernameValid = false;
    }

    if (!this.loginUser.password || this.loginUser.password.length === 0) {
      this.isPasswordValid = false;
    }

    return this.isPasswordValid && this.isUsernameValid;
  }
}
