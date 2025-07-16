import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns: string[] = ['position', 'username', 'email', 'assignedTasks', 'actions'];
  dataSource = new MatTableDataSource<User>();
  loading = false;
  errorMessage = '';
  totalUsers = 0;
  searchQuery = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private usersSubscription!: Subscription;

  constructor(
    private usersService: UsersService,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Optional custom filter predicate
    this.dataSource.filterPredicate = (data: User, filter: string) =>
      data.username.toLowerCase().includes(filter) ||
      data.email.toLowerCase().includes(filter);

    // Subscribe once to user updates
    this.usersSubscription = this.usersService.users$.subscribe({
      next: (response) => {
        if (!response) return;
        this.dataSource.data = response.users;
        this.totalUsers = response.total;
        if (this.paginator) {
          this.paginator.length = this.totalUsers;
        }
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.errorMessage = 'Failed to load users.';
        this.loading = false;
      }
    });

    this.loadUsers(); // Initial load
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  loadUsers(page: number = 1, limit: number = 10): void {
    this.loading = true;
    this.usersService.getUsers(page, limit); // Triggers BehaviorSubject update
  }

  onPageChange(event: any): void {
    const page = event.pageIndex + 1;
    const limit = event.pageSize;
    this.loadUsers(page, limit);
  }

  onSearch(): void {
    this.loadUsers(1, 10);
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  applyFilter(): void {
    const filterValue = this.searchQuery.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

  onToggleStatus(user: User): void {
    this.loading = true;
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';

    this.usersService.updateUserStatus(user._id, newStatus).subscribe({
      next: (updatedUser) => {
        const index = this.dataSource.data.findIndex(u => u._id === updatedUser._id);
        if (index !== -1) {
          const updatedData = [...this.dataSource.data];
          updatedData[index] = updatedUser;
          this.dataSource.data = updatedData;
        }
        this.loading = false;
        alert('✅ Status updated successfully');
      },
      error: (err) => {
        this.loading = false;
        alert(`❌ Failed to update status: ${err.message}`);
      }
    });
  }
}
