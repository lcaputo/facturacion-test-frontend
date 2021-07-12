import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { UserResponse, UserProfile, User } from '../shared/models/user.interface';
import { catchError, map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

const helper = new JwtHelperService();

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user = new BehaviorSubject<UserResponse>(null!);

  constructor(
    private http: HttpClient, 
    private router: Router,
    ) {
    this.checkToken();
  }
  get user$(): Observable<UserResponse> {
    return this.user.asObservable();
  }

  get userValue(): UserResponse {
    return this.user.getValue();
  }


  login(authData: User): Observable<UserResponse | void> {
    return this.http
      .post<UserResponse>(`${environment.API_URL}/login`, authData)
      .pipe(
        map((user: UserResponse) => {
          this.saveInSessionStorage(user);
          this.user.next(user);
          console.log(user);
          return user;
        }),
        catchError((err) => this.handlerError(err))
      );
  }

  logout(): void {
    sessionStorage.removeItem('user');
    this.user.next(null!);
    this.router.navigate(['/login']);
  }

  private checkToken(): void {
    // OBTENER USUARIO DEL SESSION STORAGE
    const user = JSON.parse(sessionStorage.getItem('user')!) || null;

    // VALIDAR QUE NO ESTE VACIO
    if (user) {
      // VALIDAR EL TOKEN CON AYUDA DE JWTHELPER
      const isExpired = helper.isTokenExpired(user.token);

      if (isExpired) {
        this.logout();
      } else {
        this.user.next(user);
      }
    }
  }

  public isTokenExpired() {
    // VERIFICAR QUE EL TOKEN NO HAYA EXPIRADO
    const user = JSON.parse(sessionStorage.getItem('user') || '');
    if (user) {
      const isExpired = helper.isTokenExpired(user.token);
      if (isExpired) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  // GUARDAR TOKEN EN EL SESSION STORAGE DEL NAVEGADOR
  private saveInSessionStorage(user: UserResponse): void {
    const { userId, message, ...rest } = user;
    sessionStorage.setItem('user', JSON.stringify(rest));
  }

  private handlerError(err:any): Observable<never> {
    let errorMessage = 'An errror occured retrienving data';
    if (err) {
      errorMessage = `Error: code ${err.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }


  singup(data: UserProfile): Observable<UserResponse | void> {
    return this.http
      .post<UserResponse>(`${environment.API_URL}/singup`, data)
      .pipe(
        map((user: UserResponse) => {
          this.saveInSessionStorage(user);
          console.log(user);
          return user;
        }),
        catchError((err) => this.handlerError(err))
      );
  }

  // VALIDAR SI EXISTE UN TOKEN ALMACENADO
  isAuthenticated(): boolean {
    const user = sessionStorage.getItem('user');
    console.log('usuario',user)
    return (user !== null && user !== '') ? true : false;
  }


}