import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { User, UserProfile } from '../shared/models/user.interface';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AppService {
  //ec2-18-221-61-141.us-east-2.compute.amazonaws.com
  public url = environment.API_URL;
  public publicUrl = environment.BASE_URL;
  private token = '';
  private httpOptions: any;
  private httpMultipartOption: any;
  constructor(private http: HttpClient, private auth: AuthService, private router: Router) { this.getHeaders(); }

  // GENERAR ENCABEZADOS CON EL TOKEN INCRUSTADO
  getHeaders() {
    this.token = sessionStorage.getItem('user')!;
    this.httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' +  JSON.parse(this.token).token }) };
  }

  // CERRAR SESIÓN
  clearSession() {
    this.auth.logout();
    // REDIRIGIR AL LOGIN
    this.router.navigate(['/login']);
    swal.fire('Error', 'Su sesión ha expirado', 'error');
  }
  
  // OPTIMIZACIÓN DE FUNCIONES PARA HACER PETICIONES HTTP

  //GET
  get(ruta: string):any {
      if (this.auth.isAuthenticated()) { 
        let exp = this.auth.isTokenExpired();
        if (!exp) { 
          this.getHeaders(); 
          return this.http.get<any>(this.url.concat(ruta), this.httpOptions)
        }
      }
      this.clearSession();
  }

  //POST
  post(ruta: string, body: any):any {
    if (this.auth.isAuthenticated()) { 
      let exp = this.auth.isTokenExpired(); 
      if (!exp) { 
        this.getHeaders(); 
        return this.http.post<any>(this.url.concat(ruta), body, this.httpOptions); 
      }
    }
    this.clearSession();
  }

  //DELETE
  delete(ruta: string):any {
    if (this.auth.isAuthenticated()) { 
      let exp = this.auth.isTokenExpired();
      if (!exp) { 
        this.getHeaders(); 
        return this.http.delete<any>(this.url.concat(ruta), this.httpOptions); 
      }
    }
    this.clearSession();
  }

  //PATCH
  patch(ruta: string, body: any):any {
    if (this.auth.isAuthenticated()) { 
      let exp = this.auth.isTokenExpired(); 
      if (!exp) { 
        this.getHeaders(); 
        return this.http.patch<any>(this.url.concat(ruta), body, this.httpOptions)
      }
    }
    this.clearSession();
  }



}