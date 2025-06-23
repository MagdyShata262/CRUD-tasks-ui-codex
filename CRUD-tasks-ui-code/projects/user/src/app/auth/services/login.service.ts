import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, retry, tap, throwError } from 'rxjs';
export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string; // e.g., 'user' or 'admin'
}

export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  userId?: string; // Optional, depending on your API response
  // أضف خصائص أخرى حسب رد الـ API مثل user info إن وُجد
}



@Injectable({
  providedIn: 'root'
})
export class LoginService {


  constructor(private http: HttpClient) { }
  private apiUrl = 'http://localhost:8080/auth';

  private apiUrl2 = 'http://localhost:8080/auth/login';
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











  // BehaviorSubject لتخزين حالة المستخدم بعد تسجيل الدخول
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getUserFromLocalStorage());
  public currentUser$ = this.currentUserSubject.asObservable(); // observable لاستخدامه في مكونات أخرى

  get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }


  private getUserFromLocalStorage(): LoginResponse | null {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }



  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.currentUserSubject.next(null);
  }
  isLoggedIn(): boolean {
    return !!this.currentUserValue?.token;
  }

  autoLogin(): void {
    const user = this.getUserFromLocalStorage();
    if (user && user.token) {
      this.currentUserSubject.next(user);
    }
  }



  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  getUserId(): string | null {
    const user = this.getUserFromLocalStorage();
    return user ? user.userId || null : null;
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl2, data).pipe(
      retry(2),
      tap((response: LoginResponse) => {
        console.log('Login successful', response);
        // خزن البيانات في localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response));
        // حدّث الـ BehaviorSubject
        this.currentUserSubject.next(response);
      }),
      catchError(this.handleError)
    );
  }
  // login(data: LoginRequest): Observable<LoginResponse> {
  //   return this.http.post<LoginResponse>(this.apiUrl2, data).pipe(
  //     retry(2), // Retry up to 2 times on error
  //     tap((response: LoginResponse) => {
  //       // Optional: Do something with the response, e.g., store token
  //       console.log('Login successful', response);
  //       localStorage.setItem('auth_token', response.token);
  //     }),
  //     catchError(this.handleError)
  //   );
  // }



}
