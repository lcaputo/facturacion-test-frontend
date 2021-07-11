import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public form!: FormGroup;
  public isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [
        Validators.required
      ]],
      nit: ['', [
        Validators.required
      ]],
      email: ['', [
          Validators.required, 
          Validators.email
      ]],
      password: ['', [
          Validators.required
      ]],
      password_confirmation: ['', [
        Validators.required
      ]]
    })
  }

  onSubmit() {
    this.isLoading = true;
    console.log(this.form.value)
    this.auth.singup(this.form.value).subscribe(
        (res) => {console.log('logged !'); this.isLoading = false; this.auth.logout(); this.router.navigate(['login'])},
        (err) => {console.log(err); this.isLoading = false;}
    )
  }
    
}
