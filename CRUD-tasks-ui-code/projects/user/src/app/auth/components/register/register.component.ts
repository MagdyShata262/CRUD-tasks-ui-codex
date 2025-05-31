import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoginService, UserRegistration } from '../../services/login.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private loginService: LoginService, private router: Router, private snackBar: MatSnackBar) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['user', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void { }

  // onSubmit(): void {
  //   if (this.registerForm.valid) {
  //     this.isLoading = true;
  //     const payload: UserRegistration = this.registerForm.value;

  //     this.loginService.createAccountUser(payload).subscribe({
  //       next: (res: any) => {
  //         console.log('Registration successful!', res);
  //         this.isLoading = false;
  //         if (res.success) {
  //           this.router.navigate(['/auth/login']);
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Registration failed:', err.message);
  //         this.isLoading = false;
  //       }
  //     });
  //   } else {
  //     this.registerForm.markAllAsTouched();
  //   }
  // }
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const formValue = this.registerForm.value;
      const payload: UserRegistration = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword,
        role: formValue.role
      };

      this.loginService.createAccountUser(payload).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.success) {
            this.snackBar.open('Account created successfully!', 'Close', {
              duration: 6000,
              panelClass: ['snackbar-success']
            });
            this.router.navigate(['/auth/login']);
          } else {
            this.snackBar.open('Something went wrong. Try again.', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Registration failed. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }




}
