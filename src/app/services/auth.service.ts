import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environments.prot';

@Injectable({ providedIn: 'root' })
export class AuthService {
 private baseUrl = `${environment.urlBackend}/api/auth/local`;


  constructor(private http: HttpClient) {}

  login(identifier: string, password: string) {
    return this.http.post(this.baseUrl, { identifier, password });
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUserRole() {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded.role || null;
  }

  logout() {
    localStorage.removeItem('token');
  }
}
