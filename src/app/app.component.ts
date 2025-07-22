import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
//  constructor(private translate: TranslateService) {}

// ngOnInit() {
//   const savedLang = localStorage.getItem('lang') || 'en';
//   this.translate.use(savedLang);
// }


}