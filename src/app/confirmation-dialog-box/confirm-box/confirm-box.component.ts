import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-box',
  imports: [MatDialogModule,MatButtonModule,MatIconModule],
  templateUrl: './confirm-box.component.html',
  styleUrl: './confirm-box.component.css'
})
export class ConfirmBoxComponent {

}
