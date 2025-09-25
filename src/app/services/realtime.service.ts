import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environments.prod';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
   private baseUrl = `${environment.urlBackend}`;
  private socket?: Socket;

  constructor(private auth: AuthService) {}

  connect() {
    this.socket = io(`${this.baseUrl}`, {
      auth: { token: this.auth.getToken() }
    });
  }

  joinRoom(room: string) {
    if (this.socket) {
      this.socket.emit('join', { room });
    }
  }

  onEventApproved(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('evento-aprobado', data => observer.next(data));
      }
    });
  }

  onEventConsidered(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('evento-considerado', data => observer.next(data));
      }
    });
  }

  onEventCanceled(): Observable<any> {
  return new Observable(observer => {
    if (this.socket) {
      this.socket.on('evento-cancelado', data => observer.next(data));
    }
  });
}

}
