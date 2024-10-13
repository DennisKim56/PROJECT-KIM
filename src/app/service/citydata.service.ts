import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RawCityData } from '../types';

@Injectable({
  providedIn: 'root',
})
export class CitydataService {
  constructor(private http: HttpClient) {}

  getUsData(): Observable<RawCityData[]> {
    let url: string = `https://6662149d63e6a0189fecac47.mockapi.io/us-cities`;
    return this.http.get<RawCityData[]>(url);
  }

  getWorldData(): Observable<RawCityData[]> {
    let url: string = `https://6662149d63e6a0189fecac47.mockapi.io/world-cities`;
    return this.http.get<RawCityData[]>(url);
  }
}
