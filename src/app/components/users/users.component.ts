import { Component, Inject, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";

export interface User {
  id: string;
  name: string;
  email: string;
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
  selector: 'app-users',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  constructor(
    private api: ApiService, 
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  columns: string[] = ['id', 'name', 'email', 'actions'];
  dataSource = new MatTableDataSource<User>();

  ngOnInit() {
    this.api.selectAll('users').subscribe(data => {
      this.dataSource.data = data as User[];
    });
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
}
