import { Routes } from '@angular/router';
import { UsersComponent } from './components/users/users.component';
import { TasksComponent } from './components/tasks/tasks.component';

export const routes: Routes = [
    {
        path: 'users',
        component: UsersComponent
    },
    {
        path: 'tasks',
        component: TasksComponent
    },
    {
        path: '',
        redirectTo: '/users',
        pathMatch: 'full'
    }
];
