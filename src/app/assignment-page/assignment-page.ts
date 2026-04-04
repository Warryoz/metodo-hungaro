import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AssignmentResultComponent } from '../assignment-result.component/assignment-result.component';
import { CostMatrixComponent } from '../cost-matrix.component/cost-matrix.component';
import { HungarianDetailedSolution } from '../models/driver-route-assignment.model';
import { HungarianSolverService } from '../services/hungarian-solver.service';

type ViewMode = 'rapido' | 'explicacion';

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
  mode: ViewMode = 'rapido';

  matrix: Array<Array<number | null>> = this.createMatrix(this.matrixSize);
  validationMessage = '';
  result: HungarianDetailedSolution | null = null;
  matrixUsedForResult: number[][] = [];

  private readonly basicExample = [
    [9, 2, 7],
    [6, 4, 3],
    [5, 8, 1],
  ];

  private readonly intermediateExample = [
    [10, 19, 8, 15],
    [10, 18, 7, 17],
    [13, 16, 9, 14],
    [12, 19, 8, 18],
  ];

  constructor(private readonly hungarianSolverService: HungarianSolverService) {}

  onMatrixSizeChange(rawValue: string): void {
    const parsedSize = Number(rawValue);

    if (!Number.isInteger(parsedSize) || parsedSize < this.minSize || parsedSize > this.maxSize) {
      this.validationMessage = `El tamaño debe estar entre ${this.minSize} y ${this.maxSize}.`;
      return;
    }

    this.matrixSize = parsedSize;
    this.matrix = this.createMatrix(this.matrixSize);
    this.clearResult();
    this.validationMessage = '';
  }

  onModeChange(newMode: ViewMode): void {
    this.mode = newMode;
  }

  onMatrixChange(matrix: Array<Array<number | null>>): void {
    this.matrix = matrix;
    this.validationMessage = '';
  }

  loadBasicExample(): void {
    this.applyExample(this.basicExample);
  }

  loadIntermediateExample(): void {
    this.applyExample(this.intermediateExample);
  }

  generateRandomMatrix(): void {
    const generated = Array.from({ length: this.matrixSize }, () =>
      Array.from({ length: this.matrixSize }, () => Math.floor(Math.random() * 20) + 1)
    );
    this.matrix = generated;
    this.clearResult();
    this.validationMessage = '';
  }

  resolveAssignment(): void {
    const numericMatrix = this.buildNumericMatrix();

    if (!numericMatrix) {
      this.clearResult();
      return;
    }

    try {
      const optimal = this.hungarianSolverService.solve(numericMatrix);
      const detailed =
        this.mode === 'explicacion'
          ? this.hungarianSolverService.solveWithExplanation(numericMatrix)
          : null;

      this.result = {
        ...optimal,
        simpleComparison:
          detailed?.simpleComparison ??
          this.hungarianSolverService.buildSimpleComparison(numericMatrix, optimal),
        summary:
          detailed?.summary ??
          this.hungarianSolverService.buildAcademicSummary(optimal, numericMatrix.length),
        steps: detailed?.steps ?? [],
      };

      this.matrixUsedForResult = numericMatrix.map((row) => [...row]);
      this.validationMessage = '';
    } catch {
      this.clearResult();
      this.validationMessage = 'No se pudo resolver la asignación. Revisa los costos ingresados.';
    }
  }

  private applyExample(example: number[][]): void {
    this.matrixSize = example.length;
    this.matrix = example.map((row) => [...row]);
    this.clearResult();
    this.validationMessage = '';
  }

  private buildNumericMatrix(): number[][] | null {
    if (this.matrix.length !== this.matrixSize) {
      this.validationMessage = 'La matriz debe tener el mismo número de filas y columnas.';
      return null;
    }

    const numericMatrix: number[][] = [];

    for (let row = 0; row < this.matrix.length; row++) {
      if (!Array.isArray(this.matrix[row]) || this.matrix[row].length !== this.matrixSize) {
        this.validationMessage = 'La matriz debe ser cuadrada (N x N).';
        return null;
      }

      const numericRow: number[] = [];

      for (let col = 0; col < this.matrix[row].length; col++) {
        const value = this.matrix[row][col];

        if (value === null || value === undefined || String(value).trim() === '') {
          this.validationMessage = `El campo Conductor ${row + 1}, Ruta ${col + 1} no puede estar vacío.`;
          return null;
        }

        const numericValue = Number(value);

        if (!Number.isFinite(numericValue)) {
          this.validationMessage = `Valor inválido en Conductor ${row + 1}, Ruta ${col + 1}.`;
          return null;
        }

        numericRow.push(numericValue);
      }

      numericMatrix.push(numericRow);
    }

    return numericMatrix;
  }

  private clearResult(): void {
    this.result = null;
    this.matrixUsedForResult = [];
  }

  private createMatrix(size: number): Array<Array<number | null>> {
    return Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
  }
}

