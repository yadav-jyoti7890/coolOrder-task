
import { Routes } from '@angular/router';
import { CoolorderComponent } from './order-manage/coolorder/coolorder.component';
import { UpdateComponent } from './order-manage/update/update.component';
import { OrderListComponent } from './order-manage/order-list/order-list.component';

export const routes: Routes = [
  { path: '', component: CoolorderComponent },
  {path: 'update/:id', component: UpdateComponent},
  {path: 'order-list', component: OrderListComponent},

];
