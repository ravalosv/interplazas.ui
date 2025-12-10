import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  EmployeeSearchPayload,
  EmployeeTypePayload,
} from '../interfaces/payloads/employee.payload';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

export enum employeeTypeEnum {
  Internal = 1,
  External = 2,
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEmployeeTypes() {
    const url = `${this.baseUrl}/v1/employees/GetEmployeeTypes`;

    return this.http.get<ApiReturn<EmployeeTypePayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  getEmployeeTypeById(id: number) {
    const url = `${this.baseUrl}/v1/employees/GetEmployeeTypeById?id=${id}`;

    return this.http.get<ApiReturn<EmployeeTypePayload>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  search(valueToSearch: string, type: employeeTypeEnum) {
    const url = `${this.baseUrl}/v1/employees/Search?q=${valueToSearch}&type=${type}`;

    return this.http.get<ApiReturn<EmployeeSearchPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }
}
