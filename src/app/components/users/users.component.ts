import { Component, OnInit } from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

export class UsersComponent implements OnInit{

  constructor(private api: ApiService) { }

  columns: string[] = ['id', 'name', 'email', 'actions'];
  dataSource = new MatTableDataSource<User>();

  ngOnInit() {
    this.api.selectAll('users').subscribe(data => {
      this.dataSource.data = data as User[];
    });
  }
}
