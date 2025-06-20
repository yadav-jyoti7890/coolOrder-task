import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoolorderComponent } from './coolorder/coolorder.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'coolOrder-task';
}
