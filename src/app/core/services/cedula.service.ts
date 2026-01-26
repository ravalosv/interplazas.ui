import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { CedulaPayload } from '../interfaces/payloads/cedula.payload';
import { CedulaExcelService } from './cedula-excel.service';


@Injectable({
  providedIn: 'root',
})
export class CedulaService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cedulaExcelService: CedulaExcelService
  ) {}

  getByPeriodo(periodoId: number) {
    const url = `${this.baseUrl}/periodo/${periodoId}/cedulas`;
    return this.http
      .get<ApiReturn<CedulaPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/periodo/cedulas/${id}`;
    return this.http
      .get<ApiReturn<CedulaPayload>>(url)
      .pipe(map((ret) => ret));
  }

  exportExcel(id: number) {
    this.getById(id).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.cedulaExcelService.generateExcelFromTemplate2(ret.data);
        }
      }
    });
  }
}
