import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError, map } from 'rxjs';

export interface TaskFormData {
  title: string;
  userId: number | string;
  deadline?: string;
  description?: string;
  image?: File | null;
}
export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  assignedTasks: number;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Task {
  _id: string;
  title: string;

  username: string

  userId: User;
  image: string;
  description: string;
  deadline: Date;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TaskResponse {
  tasks: Task[];
  totalItems: number;
}
export interface TaskFilters {
  title?: string;
  userId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}


@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(private http: HttpClient) { }


  private apiUrl2 = 'http://localhost:8080/tasks/add-task';
  private apiUrl = 'http://localhost:8080/tasks';

  getTasks() {
    return this.http.get<TaskResponse>(`${this.apiUrl}/all-tasks`);
  }

  // getTasks(filters: TaskFilters): Observable<TaskResponse> {
  //   let params = new HttpParams();

  //   if (filters.title) params = params.set('title', filters.title);
  //   if (filters.userId) params = params.set('userId', filters.userId);
  //   if (filters.status) params = params.set('status', filters.status);
  //   if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
  //   if (filters.toDate) params = params.set('toDate', filters.toDate);
  //   if (filters.page) params = params.set('page', filters.page.toString());
  //   if (filters.limit) params = params.set('limit', filters.limit.toString());

  //   return this.http.get<TaskResponse>(`${this.apiUrl}/all-tasks`, { params }).pipe(
  //     map(response => ({
  //       tasks: response.tasks || [],
  //       totalItems: response.totalItems || 0
  //     }))
  //   );
  // }


  getTaskById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/task/${id}`);
  }

  createTask(task: any) {
    return this.http.post<any>(`${this.apiUrl}/create-task`, task);
  }

  // updateTask(id: number, task: any) {
  //   return this.http.put<any>(`${this.apiUrl}/edit-task/${id}`, task);
  // }
  updateTask(id: number, task: TaskFormData): Observable<any> {
    const body = new FormData();

    body.append('title', task.title);
    body.append('userId', task.userId.toString());

    if (task.deadline) {
      body.append('deadline', task.deadline);
    }

    if (task.description) {
      body.append('description', task.description);
    }

    if (task.image instanceof File) {
      body.append('image', task.image, task.image.name);
    }

    return this.http.put(`${this.apiUrl}/edit-task/${id}`, body);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-task/${id}`).pipe(
      tap(() => {
        console.log(`Task with ID ${id} deleted successfully`);
      })
    );
  }


  // addTask(task: any): Observable<any> {
  //   return this.http.post(this.apiUrl, task);
  // }

  addTask(formData: TaskFormData): Observable<any> {
    const body = new FormData();

    body.append('title', formData.title);
    body.append('userId', formData.userId.toString());

    if (formData.deadline) {
      body.append('deadline', formData.deadline);
    }

    if (formData.description) {
      body.append('description', formData.description);
    }

    if (formData.image) {
      body.append('image', formData.image, formData.image.name);
    }

    return this.http.post(this.apiUrl2, body);
  }





  // Handle errors
  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error('Error fetching tasks. Please try again later.'));
  }






}
// Compare this snippet from CRUD-tasks-ui-code/projects/admin/src/app/tasks-admin/components/task-list/task-list.component.ts:
// import { Component, OnInit } from '@angular/core';
// import { TasksService } from '../../services/tasks.service';
