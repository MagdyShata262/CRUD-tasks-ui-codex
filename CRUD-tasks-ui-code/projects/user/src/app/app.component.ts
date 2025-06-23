import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './auth/services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }
  logout(): void {
    const confirmed = confirm('هل أنت متأكد أنك تريد تسجيل الخروج؟');
    if (confirmed) {
      this.loginService.logout();
      this.router.navigate(['/login']);
    }
  }

  title = 'angulartasks';
}
