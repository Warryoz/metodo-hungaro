import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HungarianDetailedSolution, HungarianStep, MatrixCellRef } from '../models/driver-route-assignment.model';

@Component({
  selector: 'app-assignment-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignment-result.component.html',
  styleUrl: './assignment-result.component.css'
})
export class AssignmentResultComponent {
  @Input({ required: true }) result: HungarianDetailedSolution | null = null;
  @Input({ required: true }) matrixUsed: number[][] = [];
  @Input({ required: true }) mode: 'rapido' | 'explicacion' = 'rapido';

  isAssignedCell(rowIndex: number, columnIndex: number): boolean {
    if (!this.result) {
      return false;
    }

    return this.result.assignments.some(
      (assignment) => assignment.driverIndex === rowIndex && assignment.routeIndex === columnIndex
    );
  }

  isStepCellHighlighted(step: HungarianStep, rowIndex: number, columnIndex: number): boolean {
    return this.containsCell(step.selectedCells, rowIndex, columnIndex);
  }

  isStepCandidateZero(step: HungarianStep, rowIndex: number, columnIndex: number): boolean {
    return this.containsCell(step.candidateZeros, rowIndex, columnIndex);
  }

  isStepDiscarded(step: HungarianStep, rowIndex: number, columnIndex: number): boolean {
    return this.containsCell(step.discardedCells, rowIndex, columnIndex);
  }

  isCoveredRow(step: HungarianStep, rowIndex: number): boolean {
    return step.coveredRows?.includes(rowIndex) ?? false;
  }

  isCoveredColumn(step: HungarianStep, columnIndex: number): boolean {
    return step.coveredColumns?.includes(columnIndex) ?? false;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private containsCell(cells: MatrixCellRef[] | undefined, rowIndex: number, columnIndex: number): boolean {
    return cells?.some((cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex) ?? false;
  }
}