/* import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import {
  OfferModel,
  OfferUpdateModel,
} from 'src/app/views/pages/client/offers/model-wizard';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  OfferListPayload,
  OfferPayload,
} from '../interfaces/payloads/offer.payload';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  save(model: OfferModel) {
    const url = `${this.baseUrl}/v1/offer/save`;

    return this.http.post<ApiReturn<OfferPayload>>(url, model).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  update(model: OfferUpdateModel) {
    const url = `${this.baseUrl}/v1/offer/update`;

    return this.http.post<ApiReturn<OfferPayload>>(url, model).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  getAll() {
    const url = `${this.baseUrl}/v1/offer/getAll`;

    return this.http.get<ApiReturn<OfferListPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  getByIdDetails(id: number) {
    const url = `${this.baseUrl}/v1/offer/GetById?id=${id}&details=true`;

    return this.http.get<ApiReturn<OfferPayload>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }
  getBy(id: number) {
    const url = `${this.baseUrl}/v1/offer/GetById?id=${id}&details=false`;

    return this.http.get<ApiReturn<OfferPayload>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }
}
 */
