import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AssignmentResultComponent } from '../assignment-result.component/assignment-result.component';
import { CostMatrixComponent } from '../cost-matrix.component/cost-matrix.component';
import { HungarianSolution } from '../models/driver-route-assignment.model';
import { HungarianSolverService } from '../services/hungarian-solver.service';

@Component({
  selector: 'app-assignment-page',
  imports: [FormsModule, CostMatrixComponent, AssignmentResultComponent],
  templateUrl: './assignment-page.html',
  styleUrl: './assignment-page.css',
})
export class AssignmentPage {
  matrixSize = 3;
  minSize = 2;
  maxSize = 8;

  matrix: Array<Array<number | null>> = this.createMatrix(this.matrixSize);
  validationMessage = '';
  result: HungarianSolution | null = null;
  matrixUsedForResult: number[][] = [];

  constructor(private readonly hungarianSolverService: HungarianSolverService) {}

  onMatrixSizeChange(rawValue: string): void {
    const parsedSize = Number(rawValue);

    if (!Number.isInteger(parsedSize) || parsedSize < this.minSize || parsedSize > this.maxSize) {
      this.validationMessage = `El tamaño debe estar entre ${this.minSize} y ${this.maxSize}.`;
      return;
    }

    this.matrixSize = parsedSize;
    this.matrix = this.createMatrix(this.matrixSize);
    this.result = null;
    this.matrixUsedForResult = [];
    this.validationMessage = '';
  }

  onMatrixChange(matrix: Array<Array<number | null>>): void {
    this.matrix = matrix;
  }

  resolveAssignment(): void {
    if (!this.isMatrixValid()) {
      this.result = null;
      return;
    }

    const numericMatrix = this.matrix.map((row) => row.map((value) => Number(value)));

    try {
      this.result = this.hungarianSolverService.solve(numericMatrix);
      this.matrixUsedForResult = numericMatrix.map((row) => [...row]);
      this.validationMessage = '';
    } catch {
      this.result = null;
      this.validationMessage = 'No se pudo resolver la asignación. Revisa los costos ingresados.';
    }
  }

  private isMatrixValid(): boolean {
    if (this.matrix.length !== this.matrixSize) {
      this.validationMessage = 'La matriz debe tener el mismo número de filas y columnas.';
      return false;
    }

    for (let row = 0; row < this.matrix.length; row++) {
      if (!Array.isArray(this.matrix[row]) || this.matrix[row].length !== this.matrixSize) {
        this.validationMessage = 'La matriz debe ser cuadrada (N x N).';
        return false;
      }

      for (let col = 0; col < this.matrix[row].length; col++) {
        const value = this.matrix[row][col];
        if (value === null || !Number.isFinite(value)) {
          this.validationMessage = `Valor inválido en Conductor ${row + 1}, Ruta ${col + 1}.`;
          return false;
        }
      }
    }

    this.validationMessage = '';
    return true;
  }

  private createMatrix(size: number): Array<Array<number | null>> {
    return Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
  }
}

