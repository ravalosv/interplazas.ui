import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginModel } from 'src/app/core/interfaces/models/auth';
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
      userName: [environment.user, [Validators.required]],
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

    var model: LoginModel = {
      UserName: this.loginForm.get('userName')!.value,
      password: this.loginForm.get('password')!.value,
    };

    this.authService.login(model.UserName, model.password).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.alertsService.success('Bienvenido!');

          if (this.returnUrl != '' && this.returnUrl != '/') {
            this.router.navigate([this.returnUrl]);
          } else {
            if (this.authService.isAdmin()) {
              this.router.navigate(['admin/events/list']);
            } else {
              this.router.navigate(['client/events/list']);
            }
          }
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
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
