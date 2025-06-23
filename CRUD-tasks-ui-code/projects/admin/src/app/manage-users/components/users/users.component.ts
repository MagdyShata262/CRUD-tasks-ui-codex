import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User, UsersService } from '../../services/users.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';







@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default, // 👈 Add this
})
export class UsersComponent implements OnInit {


  onPageChange(event: PageEvent): void {
    const page = event.pageIndex + 1;
    const limit = event.pageSize;
    this.loadUsers(page, limit);
  }
  onSearch() {
    this.loadUsers(1, 10);
  }

  displayedColumns: string[] = ['position', 'username', 'email', 'assignedTasks', 'actions'];
  dataSource = new MatTableDataSource<User>();
  loading = false;
  errorMessage = '';
  totalUsers = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  searchQuery: string = '';


  constructor(private usersService: UsersService,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
    this.dataSource.sort = this.sort;
  }




  loadUsers(page: number = 1, limit: number = 10): void {
    this.loading = true;
    this.usersService.getUsers(page, limit).subscribe({
      next: (response) => {
        console.log('API Response:', response);

        // Assign user list to dataSource
        this.dataSource.data = response.users;

        // Update paginator if needed (for large datasets)
        this.totalUsers = response.total;

        // Reconnect paginator & sort after data change
        if (this.paginator) {
          this.paginator.length = this.totalUsers;
          this.paginator.pageIndex = page - 1; // because paginator starts at 0
        }

        this.loading = false;
        this.cdRef.detectChanges(); // ensure view updates
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.errorMessage = 'Failed to load users.';
        this.loading = false;
      }
    });
  }


  deleteUser(user: User): void {
    if (!confirm(`Are you sure you want to delete ${user.username}?`)) {
      return;
    }

    this.usersService.deleteUser(user._id).subscribe({
      next: () => {
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        this.loadUsers(); // Refresh table
      },
      error: (err) => {
        this.snackBar.open(`Error deleting user: ${err.message}`, 'Close');
      }
    });
  }


  applyFilter(): void {
    this.dataSource.filter = this.searchQuery.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}









