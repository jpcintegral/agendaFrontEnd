import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environments.prod';


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

  updateEvent(documentId: string, data: any) {
    return this.http.put(`${this.baseUrl}/${documentId}`, { data });
  }

   deleteEvent(documentId : string){
     return  this.http.delete(`${this.baseUrl}/${documentId}`,this.getHeaders());
   }

  approveEvent(documentId: string) {
    return this.http.post(`${this.baseUrl}/${documentId}/approve`, {}, this.getHeaders());
  }

  getAreas() {
  return this.http.get(`${environment.urlBackend}/api/areas`,this.getHeaders());
}

}
