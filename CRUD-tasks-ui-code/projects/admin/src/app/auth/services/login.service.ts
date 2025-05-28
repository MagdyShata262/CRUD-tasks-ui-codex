import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, retry, tap, throwError } from 'rxjs';
export interface CreateAccountRequest {
  email: string;
  password: string;
  username: string;
  role: string;
  token?: string;
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  deleted?: boolean;
  isActive?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:8080/auth';



  // BehaviorSubject to manage the token state
  private _authToken = new BehaviorSubject<string | null>(
    localStorage.getItem('auth_token')
  );

  // Public observable for components to subscribe to
  public asAuth$ = this._authToken.asObservable();
  // Method to set token in both localStorage and BehaviorSubject
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this._authToken.next(token);
  }

  // Method to get the current token
  getAuthToken(): string | null {
    return this._authToken.getValue();
  }


  logout(): void {
    localStorage.removeItem('auth_token');
    this._authToken.next(null);
  }


  constructor(private http: HttpClient) { }

  createAccount(userData: CreateAccountRequest) {


    return this.http.post(`${this.apiUrl}/login`, userData).pipe(
      tap((res: any) => {
        if (res?.token) {
          this.setAuthToken(res.token); // Store the token in local storage
        }
      }),


      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError) // then handle the error
    );;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }







}
