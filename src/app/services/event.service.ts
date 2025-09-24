import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environments.prot';


@Injectable({ providedIn: 'root' })
export class EventService {

 private baseUrl = `${environment.urlBackend}/api/events`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getToken()}`
      })
    };
  }

  getEvents() {
    return this.http.get(this.baseUrl, this.getHeaders());
  }

  createEvent(payload: any) {
    return this.http.post(this.baseUrl, { data: payload }, this.getHeaders());
  }

  updateEvent(id: number, payload: any) {
    return this.http.put(`${this.baseUrl}/${id}`, { data: payload }, this.getHeaders());
  }

  approveEvent(id: number) {
    return this.http.post(`${this.baseUrl}/${id}/approve`, {}, this.getHeaders());
  }

  getAreas() {
  return this.http.get(`${environment.urlBackend}/api/areas`,this.getHeaders());
}

}
