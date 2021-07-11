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
          this.saveLocalStorage(user);
          this.user.next(user);
          console.log(user);
          return user;
        }),
        catchError((err) => this.handlerError(err))
      );
  }

  logout(): void {
    localStorage.removeItem('user');
    this.user.next(null!);
    this.router.navigate(['/login']);
  }

  private checkToken(): void {
    const user = JSON.parse(localStorage.getItem('user')!) || null;

    if (user) {
      const isExpired = helper.isTokenExpired(user.token);

      if (isExpired) {
        this.logout();
      } else {
        this.user.next(user);
      }
    }
  }

  private saveLocalStorage(user: UserResponse): void {
    const { userId, message, ...rest } = user;
    localStorage.setItem('user', JSON.stringify(rest));
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
          this.saveLocalStorage(user);
          console.log(user);
          return user;
        }),
        catchError((err) => this.handlerError(err))
      );
  }

  isAuthenticated(): boolean {
    const user = localStorage.getItem('user');
    console.log('usuario',user)
    return (user !== null && user !== '') ? true : false;
  }


}