
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css'],
  imports: [RouterOutlet, RouterLink, TranslateModule, CommonModule]         
})
export class AdminSidebarComponent {
   constructor(private translate: TranslateService) {
    this.translate.use('hi');
  }

  language(lang: string) {
    this.translate.use(lang)
  }
}
