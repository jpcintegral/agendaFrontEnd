import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <<<<< IMPORTAR
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
  imports: [
    CommonModule,           
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class LoginComponent {
  form: FormGroup;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  logout() {
    localStorage.removeItem('tokenAgenda');
    localStorage.removeItem('rolUserAgenda');
     localStorage.removeItem('AUSRAgenda');
  }
  submit() {
    if (!this.form.valid) return;
    this.logout();
    const { identifier, password } = this.form.value;
    this.auth.login(identifier, password).subscribe({
      next: (res: any) => {
        this.auth.setToken(res.jwt);
        this.auth.getUserRole().subscribe((res: any) => {
        
            this.auth.setAreasUsuario(res)
            this.auth.setRolUser(res.role.name);
            this.router.navigate(['/events']);
         
     });
        
        
      },
      error: err => (this.error = 'Usuario o contraseña incorrectos')
    });
  }
}
