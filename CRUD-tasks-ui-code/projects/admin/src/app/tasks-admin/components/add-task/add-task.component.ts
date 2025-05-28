import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TaskFormData, TasksService } from '../../services/tasks.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
export interface TaskDialogData {
  task?: Task;
}
@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent implements OnInit {

  taskForm!: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  constructor(private toastr: ToastrService, private fb: FormBuilder
    , public matDialog: MatDialog, private taskService: TasksService,
    public dialogRef: MatDialogRef<AddTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: any
  ) { }

  users: any = [
    { name: "Moahmed", id: '67ff8fc87aec83dab6ed9fd2' },
    { name: "Ali", id: 2 },
    { name: "Ahmed", id: 3 },
    { name: "Zain", id: 4 },
  ]



  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: [this.data?.title || '', Validators.required],
      userId: [this.data?.userId?._id || '', Validators.required],
      deadline: [this.data?.deadline || '', Validators.required],
      description: [this.data?.description || ''],
      image: [this.data?.image || null]

    });
    // If an image exists, create a preview URL



  }
  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      this.toastr.warning('Please fill out all required fields.');
      return;
    }

    const formValues = this.taskForm.value;

    const taskData: TaskFormData = {
      title: formValues.title,
      userId: formValues.userId,
      deadline: formValues.deadline,
      description: formValues.description || '',
      image: this.selectedFile || null
    };

    if (this.data?.id) {
      this.updateTask(this.data.id, taskData);
    } else {
      this.createTask(taskData);
    }
  }
  createTask(taskData: TaskFormData): void {
    this.taskService.addTask(taskData).subscribe({
      next: () => {
        this.toastr.success('Task created successfully');

      },
      error: (err) => {
        console.error('Error creating task:', err);
        this.toastr.error('Failed to create task');
      }
    });
  }

  updateTask(id: number, taskData: TaskFormData): void {
    this.taskService.updateTask(id, taskData).subscribe({
      next: () => {
        this.toastr.success('Task updated successfully');

      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.toastr.error('Failed to update task');
      }
    });
  }



  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Optional: Show file preview if it's an image
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);

      // Set file in form control
      this.taskForm.patchValue({
        image: this.selectedFile
      });
    }
  }

  onCancel(): void {
    if (this.taskForm.dirty) {
      const confirmDialog = this.matDialog.open(ConfirmationDialogComponent);

      confirmDialog.afterClosed().subscribe(result => {
        if (result === true) {
          this.dialogRef.close(); // Close main dialog after confirmation
        }
      });
    } else {
      this.dialogRef.close(); // Form not dirty, close directly
    }
  }

}



