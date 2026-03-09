import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from "@angular/forms";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface NewUser {
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-user-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './userDeleteDialog.html',
})
export class UserDeleteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: User) {}
}

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './userEditDialog.html',
})
export class UserEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: User) {
    // Clone the data so we don't mutate the original until save
    this.data = { ...data };
  }
}

@Component({
  selector: 'app-user-add-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, CommonModule],
  templateUrl: './userAddDialog.html',
})
export class UserAddDialogComponent {
  addUserForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get formValue(): NewUser {
    return this.addUserForm.value as NewUser;
  }
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatButtonModule, MatDialogModule, MatSortModule, MatPaginatorModule, MatFormFieldModule, MatInputModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  constructor(
    private api: ApiService, 
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns: string[] = ['id', 'name', 'email', 'actions'];
  dataSource = new MatTableDataSource<User>();

  ngOnInit() {
    this.api.selectAll('users').subscribe(data => {
      this.dataSource.data = data as User[];
    });
  }
  ngAfterViewInit(){
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  openDeleteDialog(user: User) {
    const dialogRef = this.dialog.open(UserDeleteDialogComponent, {
      width: '300px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.delete('users', user.id).subscribe(() => {
          this.dataSource.data = this.dataSource.data.filter(u => u.id !== user.id);
          this.snackBar.open(`User "${user.name}" deleted successfully`, 'Close', {
            duration: 3000,
          });
        });
      }
    });
  }

  openDialog(user: User) {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '400px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.update('users', user.id, result).subscribe(() => {
          const index = this.dataSource.data.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.dataSource.data[index] = result;
            this.dataSource.data = [...this.dataSource.data];
          }
          this.snackBar.open(`User "${result.name}" updated successfully`, 'Close', {
            duration: 3000,
          });
        });
      }
    });
  }

  addUser(){
    const dialogRef = this.dialog.open(UserAddDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.create('users', result).subscribe((created: any) => {
          this.dataSource.data = [...this.dataSource.data, created as User];
          this.snackBar.open(`User "${result.name}" created successfully`, 'Close', {
            duration: 3000,
          });
        });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}