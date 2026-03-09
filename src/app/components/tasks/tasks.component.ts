import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../users/users.component';
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
}

export interface NewTask {
  title: string;
  description: string;
  userId: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatButtonModule, MatDialogModule, MatSortModule, MatPaginatorModule, MatFormFieldModule, MatInputModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})

export class TasksComponent implements OnInit {

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns: string[] = ['id', 'title', 'description', 'completed', 'userId', 'actions'];
  dataSource = new MatTableDataSource<Task>();


  ngOnInit() {
    this.getDataSource();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  getDataSource() {
    this.api.selectAll('tasks').subscribe(data => {
      this.dataSource.data = data as Task[];
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addTask() {
    const dialogRef = this.dialog.open(TaskAddDialogComponent, {
      width: '400px',
      data: { title: '', description: '', userId: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.create('tasks', result).subscribe(() => {
          this.snackBar.open('Task added successfully', 'Close', { duration: 3000 });
          this.getDataSource();
        });
      }
    });
  }

  editTask(task: Task){
    const dialogRef = this.dialog.open(TaskEditDialogComponent, {
          width: '400px',
          data: task
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.api.update('tasks', task.id, result).subscribe(() => {
              const index = this.dataSource.data.findIndex(u => u.id === task.id);
              if (index !== -1) {
                this.dataSource.data[index] = result;
                this.dataSource.data = [...this.dataSource.data];
              }
              this.snackBar.open(`Task "${result.title}" updated successfully`, 'Close', {
                duration: 3000,
              });
            });
          }
        });
  }

}


//NEW TASK
@Component({
  selector: 'app-task-add-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, CommonModule, MatSelectModule],
  templateUrl: './taskAddDialog.html',
})

export class TaskAddDialogComponent implements OnInit {
  addTaskForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    userId: new FormControl('', Validators.required),
  });

  constructor(private api: ApiService) { }
  users: User[] = [];

  ngOnInit() {
    this.api.selectAll('users').subscribe(users => {
      this.users = users as User[];
    });
  }

  get formValue(): NewTask {
    return this.addTaskForm.value as NewTask;
  }
}


//EDIT TASK
@Component({
  selector: 'app-task-edit-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatSelectModule, CommonModule, MatCheckboxModule],
  templateUrl: './taskEditDialog.html',
})
export class TaskEditDialogComponent implements OnInit {
  users: User[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Task,
    private api: ApiService
  ) {
    this.data = { ...data };
  }

  ngOnInit() {
    this.api.selectAll('users').subscribe(users => {
      this.users = users as User[];
    });
  }
}