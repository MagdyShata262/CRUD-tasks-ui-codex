import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PaginatedTasks, TasksService } from '../../services/tasks.service';
export interface PeriodicElement {
  title: string;
  description: string;
  deadLineDate: string;
  status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { status: 'Complete', title: 'Hydrogen', description: "1.0079", deadLineDate: "10-11-2022" },
  { status: 'In-Prossing', title: 'Helium', description: "4.0026", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Lithium', description: "6.941", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Beryllium', description: "9.0122", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Boron', description: "10.811", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Carbon', description: "12.010", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Nitrogen', description: "14.006", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Oxygen', description: "15.999", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Fluorine', description: "18.998", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Neon', description: "20.179", deadLineDate: "10-11-2022" },
];
@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit {

  tasks: any[] = [];
  total = 0;
  currentPage = 1;
  pageSize = 10;
  selectedStatus: string | undefined = 'In-Prossing';
  loading = false;










  displayedColumns: string[] = ['position', 'title', 'user', 'deadLineDate', 'status', 'actions'];
  dataSource = ELEMENT_DATA;
  tasksFilter!: FormGroup
  users: any = [
    { name: "Moahmed", id: 1 },
    { name: "Ali", id: 2 },
    { name: "Ahmed", id: 3 },
    { name: "Zain", id: 4 },
  ]

  status: any = [
    { name: "Complete", id: 1 },
    { name: "In-Prossing", id: 2 },
  ]
  constructor(public dialog: MatDialog, private fb: FormBuilder, private tasksService: TasksService) {
    // Initialize the tasksService here if needed
    // this.tasksService = new TasksService(); // Uncomment if you need to instantiate it manually

  }

  ngOnInit(): void {

    const userId = '683af7e48aa5c4a992421330'; // Replace with dynamic ID
    this.loadTasks(userId);


    this.createform()
  }

  loadTasks(userId: string): void {
    this.tasksService.getUserTasks(userId, this.currentPage, this.pageSize, this.selectedStatus).subscribe({
      next: (response: PaginatedTasks) => {
        this.tasks = response.tasks;
        this.total = response.total;
      },
      error: (err) => {
        alert(err.message);
      }
    });
  }
  createform() {
    this.tasksFilter = this.fb.group({
      title: [''],
      userId: [''],
      fromDate: [''],
      toDate: ['']
    })
  }

  getAllTasks() {

  }


  onPageChange(event: any) {
    this.updatePaginatedData(event);
  }


  updatePaginatedData(event: any) {
    const start = event.pageIndex * event.pageSize;
    const end = start + event.pageSize;
    // this.paginatedData = this.dataSource.slice(start, end);
  }


}
