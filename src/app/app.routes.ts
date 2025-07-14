import { Routes } from '@angular/router';
import { CoolorderComponent } from './order-manage/coolorder/coolorder.component';
import { UpdateComponent } from './order-manage/update/update.component';
import { OrderListComponent } from './order-manage/order-list/order-list.component';
import { ReadOrderComponent } from './order-manage/read-order/read-order.component';
import { CopyOrderComponent } from './order-manage/copy-order/copy-order.component';
import { ChangeRequestComponent } from './order-manage/change-request/change-request.component';
import { ChangeRequestListComponent } from './order-manage/change-request-list/change-request-list.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminSidebarComponent } from './admin/admin-sidebar/admin-sidebar.component';

export const routes: Routes = [
{
  path: '', 
  component: AdminSidebarComponent,
  children: [
    { path: '', redirectTo: 'admin-dashboard', pathMatch: 'full' },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'coolorder', component: CoolorderComponent },
    { path: 'update/:id', component: UpdateComponent },
    { path: 'order-list', component: OrderListComponent },
    { path: 'order-detail', component: OrderListComponent },
    { path: 'read-order/:id', component: ReadOrderComponent },
    { path: 'change-request-list/:id', component: ChangeRequestListComponent },
    { path: 'copy-order/:id', component: CopyOrderComponent },
    { path: 'change-request/:id', component: ChangeRequestComponent },
  ]
}

];
