import { Component, signal } from '@angular/core';
import { AssignmentPage } from './assignment-page/assignment-page'
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [AssignmentPage],
  styleUrl: './app.css'
})
export class App {}
