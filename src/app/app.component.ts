import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoolorderComponent } from './order-manage/coolorder/coolorder.component';
import { HttpClientModule } from '@angular/common/http';
import { LoaderService } from './services/loader.service';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, RouterOutlet, AdminDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'coolOrder-task';


}
