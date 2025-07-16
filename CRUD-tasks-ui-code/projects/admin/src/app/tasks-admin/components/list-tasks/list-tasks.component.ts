// ✅ list-tasks.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, map, merge, tap, BehaviorSubject } from 'rxjs';
import { TasksService, User } from '../../services/tasks.service';

// Define Task interface if not already imported
export interface Task {
  // Add other properties as needed
  deadline: Date | string;
  title: string;
  status: string;
  [key: string]: any;
}
import { ToastrService } from 'ngx-toastr';
import { UsersService } from '../../../manage-users/services/users.service';
import { AddTaskComponent } from '../add-task/add-task.component';


@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['position', 'title', 'users', 'deadline', 'status', 'actions'];
  originalData: Task[] = [];
  dataSource = new MatTableDataSource<Task>(this.originalData);
  tasksFilter!: FormGroup;
  private searchSubject = new BehaviorSubject<string>('');
  loading: boolean = false;
  errorMessage!: string;
  allUsers: User[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private tasksService: TasksService,
    private userservice: UsersService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadTasks();
    this.loadUsers();
    this.setupUnifiedFiltering();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  createForm(): void {
    this.tasksFilter = this.fb.group({
      fromDate: [null],
      toDate: [null],
      status: ['']
    });
  }

  loadTasks(): void {
    this.tasksService.getTasks().subscribe({
      next: (response: any) => {
        this.dataSource.data = response.tasks;
        this.originalData = response.tasks.map((task: Task) => ({
          ...task,
          deadline: new Date(task.deadline)
        }));
      },
      error: () => this.toastr.error('Failed to load tasks')
    });
  }

  loadUsers(): void {
    this.userservice.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users.map((user: any) => ({
          ...user,
          password: user.password ?? ''
        }));
      },
      error: () => this.toastr.error('Failed to load users')
    });
  }

  getUsernameById(userId: string): string {
    const user = this.allUsers.find(u => u._id === userId);
    return user ? user.username : 'N/A';
  }

  setupUnifiedFiltering(): void {
    merge(
      this.searchSubject.pipe(map(search => ({ type: 'search', value: search }))),
      merge(
        (this.tasksFilter.get('fromDate') as FormControl).valueChanges,
        (this.tasksFilter.get('toDate') as FormControl).valueChanges
      ).pipe(map(_ => ({ type: 'date', value: null }))),
      this.tasksFilter.get('status')!.valueChanges.pipe(
        map(status => ({ type: 'status', value: status }))
      )
    )
      .pipe(
        debounceTime(300),
        tap(() => this.applyUnifiedFilter())
      )
      .subscribe();
  }

  applyUnifiedFilter(): void {
    let filteredTasks = [...this.originalData];
    const search = this.searchSubject.getValue()?.toLowerCase().trim() || '';
    const status = this.tasksFilter.get('status')?.value || '';
    const fromDate = this.tasksFilter.get('fromDate')?.value;
    const toDate = this.tasksFilter.get('toDate')?.value;

    if (search) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(search)
      );
    }

    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }

    if (fromDate && toDate) {
      const start = new Date(fromDate); start.setHours(0, 0, 0, 0);
      const end = new Date(toDate); end.setHours(23, 59, 59, 999);

      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate >= start && taskDate <= end;
      });
    }

    this.dataSource.data = filteredTasks;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value.trim().toLowerCase());
  }

  addTask(): void {
    const dialogRef = this.dialog.open(AddTaskComponent, { width: '750px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadTasks();
        this.toastr.success('Task added successfully!');
      }
    });
  }

  updateTask(task: Task): void {
    const dialogRef = this.dialog.open(AddTaskComponent, {
      width: '750px',
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadTasks();
      }
    });
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasksService.deleteTask(taskId).subscribe({
        next: () => {
          this.toastr.success('Task deleted successfully!');
          this.loadTasks();
        },
        error: () => {
          this.toastr.error('Failed to delete task.');
        }
      });
    }
  }

  getTaskStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }
}

