import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environments.prod';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
 private baseUrl = `${environment.urlBackend}/api/auth/local`;
  private secretKey = environment.secretKey;


  constructor(private http: HttpClient) {}

  login(identifier: string, password: string) {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify({ identifier: identifier, password }),
      this.secretKey
    ).toString();
    return this.http.post(`${environment.urlBackend}/api/auth/encrypted-login`, { encryptedData });
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

   getRolUser(){
    return localStorage.getItem('rolUserAgenda');
  }

   setAreasUsuario(user: any) {
        const areas: number[] = [];

        if (user.area) {
          areas.push(user.area.id);
        }

        if (Array.isArray(user.areas)) {
          user.areas.forEach((a: any) => areas.push(a.id));
        }
        
        return  localStorage.setItem('AUSRAgenda',JSON.stringify(areas));
  }

  getAreasUsuario(){
    return localStorage.getItem('AUSRAgenda');
  }
  

  logout() {
    localStorage.removeItem('tokenAgenda');
  }
}
