/* import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Usuario, UsuarioLogin } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  //ec2-18-221-61-141.us-east-2.compute.amazonaws.com
  public url = 'http://localhost:5000/rest/v1/';
  public publicUrl = 'http://localhost:5000/';
  private token = '';
  private httpOptions;
  private httpMultipartOption;
  constructor(private http: HttpClient, private auth: AuthService, private router: Router) { this.getHeaders(); }

  getHeaders() {
    this.token = sessionStorage.getItem('token');
    this.httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.token }) };
    this.httpMultipartOption = { headers: new HttpHeaders({ 'Authorization': 'Bearer ' + this.token }) }
  }

  clearSession() {
    this.auth.logout();
    swal.fire({
      title: 'Error!',
      text: 'Su sesion ha expirado',
      type: 'error'
    })
    this.router.navigate(['/login']);
  }

  //GET
  get(ruta: string) {
    if (this.auth.isAuthenticated()) { let exp = this.auth.isTokenExpired(); if (!exp) { this.getHeaders(); return this.http.get<any>(this.url.concat(ruta), this.httpOptions); } }
    this.clearSession();
  }

  //POST
  post(ruta: string, body: any) {
    if (this.auth.isAuthenticated()) { let exp = this.auth.isTokenExpired(); if (!exp) { this.getHeaders(); return this.http.post<any>(this.url.concat(ruta), body, this.httpOptions); } }
    this.clearSession();
  }

  //DELETE
  delete(ruta: string) {
    if (this.auth.isAuthenticated()) { let exp = this.auth.isTokenExpired(); if (!exp) { this.getHeaders(); return this.http.delete<any>(this.url.concat(ruta), this.httpOptions); } }
    this.clearSession();
  }

  //PUT
  put(ruta: string, body: any) {
    if (this.auth.isAuthenticated()) { let exp = this.auth.isTokenExpired(); if (!exp) { this.getHeaders(); return this.http.put<any>(this.url.concat(ruta), body, this.httpOptions); } }
    this.clearSession();
  }

  login(usuario: UsuarioLogin): Observable<any> {
    const credenciales = btoa('angularapp' + ':' + '12345');
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + credenciales,
    });
    let params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', usuario.username);
    params.set('password', usuario.password);
    return this.http.post<any>(this.publicUrl.concat('oauth/token'), params.toString(), { headers: httpHeaders });
  }

  subirImagen(Archivo: File, id): Observable<any> {
    if (this.auth.isAuthenticated()) {
      if (!this.auth.isTokenExpired()) {
        this.getHeaders();
        let formData = new FormData();
        formData.append('file', Archivo);
        formData.append('id', id);
        return this.http.post<any>(`${this.url}upload`, formData, this.httpMultipartOption);
      }
    }
    this.clearSession();
  }

  subirLogoEmpresa(Archivo: File, id): Observable<any> {
    if (this.auth.isAuthenticated()) {
      if (!this.auth.isTokenExpired()) {
        this.getHeaders();
        let formData = new FormData();
        formData.append('file', Archivo);
        formData.append('id', id);
        return this.http.post<any>(`${this.url}uploadLogoEmpresa`, formData, this.httpMultipartOption);
      }
    }
    this.clearSession();
  }

  inpustCalendarLenguaje() {
    return {
      //date
      closeText: "Cerrar",
      prevText: "<Ant",
      nextText: "Sig>",
      currentText: "Hoy",
      monthNames: ["enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
      monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun",
        "jul", "ago", "sep", "oct", "nov", "dic"],
      dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
      dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
      dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
      weekHeader: "Sm",
      dateFormat: "dd/mm/yy",
      firstDay: 1,
      isRTL: false,
      showMonthAfterYear: false,
      yearSuffix: "",
      timeOnlyTitle: 'Elegir una hora',
      timeText: 'Hora',
      hourText: 'Horas',
      minuteText: 'Minutos',
      secondText: 'Segundos',
      millisecText: 'Milisegundos',
      microsecText: 'Microsegundos',
      timezoneText: 'Uso horario',
      timeFormat: 'HH:mm',
      timeSuffix: '',
      amNames: ['a.m.', 'AM', 'A'],
      pmNames: ['p.m.', 'PM', 'P'],
    }
  }

} */