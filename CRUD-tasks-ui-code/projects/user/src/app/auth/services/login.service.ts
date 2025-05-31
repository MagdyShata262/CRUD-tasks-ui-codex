import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string; // e.g., 'user' or 'admin'
}
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:8080/auth';
  constructor(private http: HttpClient) { }


  createAccountUser(payload: UserRegistration): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/createAccount`, payload).pipe(
      tap((response) => {
        console.log('Raw response:', response);
        if (response.success) {
          localStorage.setItem('authToken', response.data.token); // Example token handling
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error Code: ${error.status}, Message: ${error.error.message || error.statusText}`;
    }
    console.error('Error during registration:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

}
