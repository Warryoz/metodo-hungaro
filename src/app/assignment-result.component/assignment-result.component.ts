import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HungarianSolution } from '../models/driver-route-assignment.model';


@Component({
  selector: 'app-assignment-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignment-result.component.html',
  styleUrl: './assignment-result.component.css'
})
export class AssignmentResultComponent {
  @Input({ required: true }) result: HungarianSolution | null = null;
  @Input({ required: true }) matrixUsed: number[][] = [];

  trackByIndex(index: number): number {
    return index;
  }
}
