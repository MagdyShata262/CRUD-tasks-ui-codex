import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
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
  private readonly apiUrl = 'http://localhost:8080/auth/users';
  private readonly apiUrl2 = 'http://localhost:8080/auth/user';
  private readonly apiUrl3 = 'http://localhost:8080/auth/user-status';

  constructor(private http: HttpClient) {}

  // ✅ BehaviorSubject (يمكنك إلغاءه إذا لم يكن ضرورياً)
  private usersSubject = new BehaviorSubject<UsersResponse | null>(null);
  public users$ = this.usersSubject.asObservable();

  /**
   * ✅ Get users with pagination and optional search.
   */
  getUsers(page: number, limit: number, search: string = ''): Observable<UsersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UsersResponse>(`${this.apiUrl}`, { params });
  }
getAllUsers(): Observable<User[]> {
  return this.http.get<UsersResponse>(this.apiUrl).pipe(
    map(response => response.users) // لأن الاستجابة فيها users[]
  );
}

  /**
   * ✅ Get a single user by ID.
   */
  getUserById(id: string): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<User>(url).pipe(
      catchError(error => {
        console.error(`Error fetching user with ID ${id}:`, error);
        return throwError(() => new Error(`Failed to load user with ID ${id}.`));
      })
    );
  }

  /**
   * ✅ Delete user by ID.
   */
  deleteUser(id: string): Observable<void> {
    const url = `${this.apiUrl2}/${id}`;
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

  /**
   * ✅ Update user status (Activate / Deactivate).
   */
  updateUserStatus(id: string, status: 'Active' | 'Inactive'): Observable<User> {
    const url = this.apiUrl3;
    const body = { status, id };
    console.log('Updating user status at URL:', url);
    console.log('Request Body:', body);

    return this.http.put<{ message: string; user: User }>(url, body).pipe(
      map(response => response.user),
      catchError(this.handleError)
    );
  }

  /**
   * ❗ Shared error handler
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error Code: ${error.status}, Message: ${error.error.message || 'Unknown error'}`;
    }

    console.error('HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
