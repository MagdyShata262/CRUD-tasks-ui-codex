import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AddTaskComponent } from '../add-task/add-task.component';
import { TasksService } from '../../services/tasks.service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, debounceTime, finalize, map, merge, of, Subject, tap } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
export interface PeriodicElement {
  title: string;
  user: string;
  deadLineDate: string;
  status: string;
}
// Remove local TaskResponse and Task interfaces and import them from the shared location
import { TaskResponse, Task } from '../../services/tasks.service';
@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})

export class ListTasksComponent implements OnInit {

  displayedColumns: string[] = ['position', 'title', 'username', 'deadline', 'status', 'actions'];
  originalData: Task[] = [];
  dataSource = new MatTableDataSource<Task>(this.originalData);

  tasksFilter!: FormGroup;

  // Search
  private searchSubject = new BehaviorSubject<string>('');

  constructor(
    public dialog: MatDialog,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private tasksService: TasksService
  ) { }

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.createForm();
    this.loadTasks();

    this.setupUnifiedFiltering();
    this.dataSource.paginator = this.paginator;
    console.log('this.dataSource.paginator', this.dataSource.paginator);
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    console.log('Paginator assigned:', this.paginator);
     this.loadTasks(); // Load tasks after view init
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

  // Called from input field
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value.trim().toLowerCase());
  }





  addTask() {
    const dialogRef = this.dialog.open(AddTaskComponent, {
      width: '750px',

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.loadTasks();
        console.log(result);
        this.toastr.success('Task added successfully!');
      }
    });
  }




  getTaskStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }





  updateTask(task: any): void {
    const dialogRef = this.dialog.open(AddTaskComponent, {
      width: '750px',
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.loadTasks();

      }
    });


  }




  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasksService.deleteTask(taskId).subscribe({
        next: (response) => {
          console.log('Task deleted successfully', response);
          this.toastr.success('Task deleted successfully!');
          this.loadTasks(); // Refresh the task list
          // Optionally trigger a refresh of the task list
        },
        error: (err) => {
          console.error('Error deleting task:', err);
          alert('Failed to delete task.');
        }
      });
    }
  }

}
