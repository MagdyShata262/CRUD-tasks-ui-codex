import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
export interface User {
  _id: string;
  username: string;
  email: string;
  assignedTasks: number;
  role: 'user' | 'admin'; // إذا كانت القيم محصورة
  status: 'Active' | 'Inactive'; // حسب القيم المحتملة
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface UsersResponse {
  users: User[];
  total: number; // إجمالي عدد المستخدمين
  page: number; // الصفحة الحالية
  limit: number; // عدد المستخدمين في الصفحة
  totalPages: number; // إجمالي عدد الصفحات
  // يمكنك إضافة خصائص إضافية إن وُجدت مثل pagination info
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = 'http://localhost:8080/auth/users';

  constructor(private http: HttpClient) { }
  getUsers(page: number = 1, limit: number = 10, name?: string): Observable<UsersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name && name.trim() !== '') {
      params = params.set('name', name.trim());
    }

    return this.http.get<UsersResponse>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Failed to load users. Please try again later.'));
      })
    );
  }

  getUserById(id: string): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<User>(url).pipe(
      catchError(error => {
        console.error(`Error fetching user with ID ${id}:`, error);
        return throwError(() => new Error(`Failed to load user with ID ${id}.`));
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Deleting user from URL:', url);

    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Error deleting user:', error);
        if (error.status === 0) {
          console.warn('Possible CORS or network issue.');
        }
        return throwError(() => new Error('Failed to delete user.'));
      })
    );
  }






}
