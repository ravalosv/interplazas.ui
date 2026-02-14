import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { IEmailTemplate } from '../interfaces/email-template.interface';

@Injectable({
  providedIn: 'root',
})
export class EmailTemplateService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/email-template`;

    return this.http.get<ApiReturn<IEmailTemplate[]>>(url).pipe(map((ret) => ret));
  }
}
