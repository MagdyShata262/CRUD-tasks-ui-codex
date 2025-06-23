import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from '../../auth/services/login.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
// task.model.ts


export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
export interface PaginatedTasks {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}
@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = 'http://localhost:8080/tasks/user-tasks';
  constructor(private http: HttpClient, private loginService: LoginService) { }

  getUserTasks(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<PaginatedTasks> {
    const token = localStorage.getItem('auth_token'); // Or use your loginService.getToken()

    if (!token) {
      console.warn('No authentication token found.');
      return throwError(() => new Error('Authentication token missing.'));
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `${this.apiUrl}/${userId}`;

    return this.http.get<PaginatedTasks>(url, { headers, params }).pipe(
      tap((response) => {
        console.log('Fetched tasks successfully:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching tasks:', error);

        if (error.status === 401) {
          console.warn('User is not authorized. Redirecting to login...');
          // Optionally redirect to login page
        } else if (error.status === 400) {
          console.warn('Invalid request parameters:', error.error.message || error.message);
        } else if (error.status >= 500) {
          console.error('Server error. Please try again later.');
        }

        return throwError(() => new Error(error.error.message || 'Failed to load tasks.'));
      })
    );
  }







  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

}


