import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './auth/services/login.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public authService: LoginService, private router: Router, private translate: TranslateService) {    // يمكن قراءة اللغة من localStorage

  }
  title = 'angulartasks';
  logout(): void {
    console.log('User logged out');
    this.authService.logout(); // Call the logout method from the service
    // Add your logout logic here, e.g., clearing tokens, redirecting, etc.
  }


  ngOnInit() {
    const savedLang = localStorage.getItem('lang') || this.translate.getBrowserLang();
    const defaultLang = ['en', 'ar'].includes(savedLang) ? savedLang : 'en';
    this.changeLang(defaultLang);
  }

  changeLang(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

}
