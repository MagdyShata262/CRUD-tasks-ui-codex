import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateAccountRequest, LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
interface CreateAccountResponse {
  token: string; // Add other properties if needed
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  adminLabel!: string;
  userLabel!: string;



  constructor(private fb: FormBuilder, private loginService: LoginService, private toastr: ToastrService, private route: ActivatedRoute,
    private router: Router, private translate: TranslateService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['admin', [Validators.required]], // Default role set to 'user'
    });

    // يمكن قراءة اللغة من localStorage
    // const lang = localStorage.getItem('lang') || 'en';
    // translate.setDefaultLang('en');
    // translate.use(lang);

  }


  ngOnInit() {
    this.adminLabel = this.translate.instant('LOGIN.ADMIN');
    this.userLabel = this.translate.instant('LOGIN.USER');

    const savedLang = localStorage.getItem('lang') || this.translate.getBrowserLang();
    const defaultLang = ['en', 'ar'].includes(savedLang) ? savedLang : 'en';
    this.changeLang(defaultLang);
  }






  // Define the response type

  changeLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }
  // Update the onSubmit method
  onSubmit() {
    if (this.loginForm.valid) {

      this.isLoading = true;
      const credentials: CreateAccountRequest = {
        ...this.loginForm.value,

      };

      this.loginService.createAccount(credentials).subscribe({
        next: (response) => {

          console.log(response);
          // this.toastr.success('Login successful!');
          this.toastr.success(this.translate.instant('TOASTR.LOGIN_SUCCESS'));
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          this.toastr.error(err.message || this.translate.instant('TOASTR.LOGIN_FAILED'));
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

}
