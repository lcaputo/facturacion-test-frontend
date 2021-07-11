import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, HostListener, ViewChildren, QueryList } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    // providers: [MenuService]
})
export class LoginComponent implements OnInit {
    
    public form!: FormGroup;
    public isLoading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private router: Router,
        private auth: AuthService,
        private _snackBar: MatSnackBar,
    ) {    }

    ngOnInit() {
        if ( this.auth.isAuthenticated() ) {
            this.router.navigate(['dashboard'])
        }
        this.form = this.fb.group({
            email: ['', [
                Validators.required, 
                Validators.email
            ]],
            password: ['', [
                Validators.required
            ]],
        })
    }

    onSubmit() {
        this.isLoading = true;
        console.log(this.form.value)
        this.auth.login(this.form.value).subscribe(
            (res) => {
                console.log('logged !')
                this.router.navigate(['/dashboard']);
                this.openSnackBar('Bienvenidos', 'ok');
                this.isLoading = false;
            },
            (err) => {
                console.log('Error', err);
                this.openSnackBar('Error', 'ok');
                this.isLoading = false;
            }
        )
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action);
      }


}