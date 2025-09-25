import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environments.prod';

@Injectable({ providedIn: 'root' })
export class AuthService {
 private baseUrl = `${environment.urlBackend}/api/auth/local`;


  constructor(private http: HttpClient) {}

  login(identifier: string, password: string) {
    return this.http.post(this.baseUrl, { identifier, password });
  }

  
  setToken(token: string) {
    localStorage.setItem('tokenAgenda', token);
  }

  getToken() {
    return localStorage.getItem('tokenAgenda');
  }

  getUserRole() {
   return this.http.get(`${environment.urlBackend}/api/users/me?populate=*`);
  }


  setRolUser( rol:string){
    return localStorage.setItem('rolUserAgenda',rol);
  }

  

  logout() {
    localStorage.removeItem('tokenAgenda');
  }
}
