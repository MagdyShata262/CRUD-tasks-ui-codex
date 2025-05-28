import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginService } from '../src/app/auth/services/login.service';

@Injectable()
export class InterceptorInterceptor implements HttpInterceptor {

  constructor(private loginService: LoginService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {


    const token = this.loginService.getAuthToken(); // Retrieve token from the service
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // Add the token to the request headers
        }
      });
    }
    return next.handle(request);
  }











}
