import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginRequest, LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user'] // يمكنك جعله اختيارياً أو ثابتًا حسب الحاجة
    });
  }
  get f() {
    return this.loginForm.controls;
  }

  /**
    * Handle form submission
    */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'يرجى ملء الحقول المطلوبة بشكل صحيح.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData: LoginRequest = this.loginForm.value;

    this.loginService.login(loginData).pipe(
      tap(() => {
        console.log('Login successful!');
      }),
      catchError((err) => {
        this.errorMessage = 'بيانات الدخول غير صحيحة أو حدث خطأ في الخادم.';
        return throwError(() => new Error(this.errorMessage));
      })
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/tasks']); // Redirect after login
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
