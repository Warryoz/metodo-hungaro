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

  isAssignedCell(rowIndex: number, columnIndex: number): boolean {
    if (!this.result) {
      return false;
    }

    return this.result.assignments.some(
      (assignment) =>
        assignment.driverIndex === rowIndex && assignment.routeIndex === columnIndex
    );
  }

  trackByIndex(index: number): number {
    return index;
  }
}
