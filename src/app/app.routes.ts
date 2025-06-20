
import { Routes } from '@angular/router';
import { CoolorderComponent } from './coolorder/coolorder.component';
import { UpdateComponent } from './update/update.component';

export const routes: Routes = [
  { path: '', component: CoolorderComponent },
  {path: 'update/:id', component: UpdateComponent},
];
