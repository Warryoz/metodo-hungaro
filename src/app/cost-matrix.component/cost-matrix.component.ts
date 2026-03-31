import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cost-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cost-matrix.component.html',
  styleUrl: './cost-matrix.component.css'
})
export class CostMatrixComponent {
  @Input({ required: true }) matrix: Array<Array<number | null>> = [];
  @Output() matrixChange = new EventEmitter<Array<Array<number | null>>>();

  onCellInput(rowIndex: number, columnIndex: number, value: string): void {
    const parsed = value.trim() === '' ? null : Number(value);
    this.matrix[rowIndex][columnIndex] = Number.isFinite(parsed) ? parsed : null;
    this.matrixChange.emit(this.matrix);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
