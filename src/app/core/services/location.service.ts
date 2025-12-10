import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import {
  LocationGetPayload,
  RegionGetPayload,
  SubregionGetPayload,
} from '../interfaces/payloads/location_get.payload';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRegions() {
    const url = `${this.baseUrl}/v1/location/getRegions`;

    return this.http.get<ApiReturn<RegionGetPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }
  getSubRegions(regionid: number) {
    const url = `${this.baseUrl}/v1/location/getSubRegions?regionid=${regionid}`;

    return this.http.get<ApiReturn<SubregionGetPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  getLocations(subregionid: number) {
    const url = `${this.baseUrl}/v1/location/getLocations?subregionid=${subregionid}`;

    return this.http.get<ApiReturn<LocationGetPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }
}
