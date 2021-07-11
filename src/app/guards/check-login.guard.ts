import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public auth: AuthService, public router: Router) {}
  canActivate(): boolean {
    if (this.auth.isAuthenticated()) {
      console.log('true')
      return true  
    }
    console.log('false')
    this.router.navigate(['login'])
    return true;
  }
}