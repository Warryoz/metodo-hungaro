import { Injectable } from '@angular/core';
import {
  DriverRoutePair,
  HungarianDetailedSolution,
  HungarianSolution,
  HungarianStep,
  MatrixCellRef,
  SimpleAssignmentComparison,
} from '../models/driver-route-assignment.model';

@Injectable({ providedIn: 'root' })
export class HungarianSolverService {
  solve(costMatrix: number[][]): HungarianSolution {
    this.validateSquareMatrix(costMatrix);

    const size = costMatrix.length;

    const rowPotential = new Array<number>(size + 1).fill(0);
    const columnPotential = new Array<number>(size + 1).fill(0);
    const matchedRowByColumn = new Array<number>(size + 1).fill(0);
    const previousColumn = new Array<number>(size + 1).fill(0);

    for (let rowToAssign = 1; rowToAssign <= size; rowToAssign++) {
      this.addRowToMatching(
        rowToAssign,
        costMatrix,
        rowPotential,
        columnPotential,
        matchedRowByColumn,
        previousColumn
      );
    }

    return this.buildSolution(costMatrix, matchedRowByColumn);
  }

  solveWithExplanation(costMatrix: number[][]): HungarianDetailedSolution {
    this.validateSquareMatrix(costMatrix);

    const original = this.cloneMatrix(costMatrix);
    const rowReduced = this.reduceRows(original);
    const columnReduced = this.reduceColumns(rowReduced);

    const steps: HungarianStep[] = [
      {
        id: 'original',
        title: '1) Matriz original',
        description: 'Matriz inicial de costos. Cada fila es un conductor y cada columna una ruta.',
        matrix: this.cloneMatrix(original),
      },
      {
        id: 'row-reduction',
        title: '2) Reducción por filas',
        description:
          'A cada fila se le resta su valor mínimo para crear al menos un cero por conductor.',
        matrix: this.cloneMatrix(rowReduced),
        candidateZeros: this.getZeroCells(rowReduced),
      },
      {
        id: 'column-reduction',
        title: '3) Reducción por columnas',
        description:
          'A cada columna se le resta su valor mínimo para aumentar los ceros candidatos a asignación.',
        matrix: this.cloneMatrix(columnReduced),
        candidateZeros: this.getZeroCells(columnReduced),
      },
    ];

    let workingMatrix = this.cloneMatrix(columnReduced);
    let zeroMatching = this.findZeroMatching(workingMatrix);
    const cover = this.findMinimumLineCover(workingMatrix);

    steps.push({
      id: 'zero-cover',
      title: '4) Cobertura de ceros',
      description:
        'Se cubren los ceros con el menor número de líneas (filas/columnas). Esto indica si ya es posible asignar.',
      matrix: this.cloneMatrix(workingMatrix),
      candidateZeros: this.getZeroCells(workingMatrix),
      coveredRows: cover.rows,
      coveredColumns: cover.columns,
    });

    if (zeroMatching.length !== workingMatrix.length) {
      const adjusted = this.adjustMatrixWithCover(workingMatrix, cover.rows, cover.columns);
      workingMatrix = adjusted;
      zeroMatching = this.findZeroMatching(workingMatrix);

      steps.push({
        id: 'matrix-adjustment',
        title: '5) Ajuste de matriz',
        description:
          'Como no había asignación completa, se resta el menor valor no cubierto y se ajustan intersecciones cubiertas.',
        matrix: this.cloneMatrix(workingMatrix),
        candidateZeros: this.getZeroCells(workingMatrix),
        coveredRows: cover.rows,
        coveredColumns: cover.columns,
      });
    }

    const optimal = this.solve(original);
    const selectedCells = optimal.assignments.map((item) => ({
      rowIndex: item.driverIndex,
      columnIndex: item.routeIndex,
    }));

    const discardedCells = this.getZeroCells(workingMatrix).filter(
      (cell) => !selectedCells.some((selected) => this.sameCell(selected, cell))
    );

    steps.push({
      id: 'final-selection',
      title: '6) Selección final de asignaciones',
      description:
        'Se elige una combinación de ceros sin repetir fila ni columna, obteniendo el costo mínimo total.',
      matrix: this.cloneMatrix(workingMatrix),
      candidateZeros: this.getZeroCells(workingMatrix),
      selectedCells,
      discardedCells,
    });

    const simpleComparison = this.buildSimpleComparison(original, optimal);

    return {
      ...optimal,
      steps,
      simpleComparison,
      summary: this.buildAcademicSummary(optimal, original.length),
    };
  }

  buildSimpleComparison(
    costMatrix: number[][],
    optimal: HungarianSolution
  ): SimpleAssignmentComparison {
    const assignment: DriverRoutePair[] = [];
    let totalCost = 0;

    for (let index = 0; index < costMatrix.length; index++) {
      const cost = costMatrix[index][index];
      assignment.push({ driverIndex: index, routeIndex: index, cost });
      totalCost += cost;
    }

    return {
      assignment,
      totalCost,
      savings: totalCost - optimal.totalCost,
    };
  }

  buildAcademicSummary(result: HungarianSolution, matrixSize: number): string {
    const combination = result.assignments
      .map((item) => `Conductor ${item.driverIndex + 1} → Ruta ${item.routeIndex + 1}`)
      .join(', ');

    return `La combinación óptima es ${combination}. El costo total mínimo obtenido es ${result.totalCost}. La solución respeta la restricción uno a uno: ${matrixSize} conductores asignados a ${matrixSize} rutas sin repeticiones.`;
  }

  private addRowToMatching(
    rowToAssign: number,
    costMatrix: number[][],
    rowPotential: number[],
    columnPotential: number[],
    matchedRowByColumn: number[],
    previousColumn: number[]
  ): void {
    matchedRowByColumn[0] = rowToAssign;

    let currentColumn = 0;
    const minReducedCostByColumn = new Array<number>(costMatrix.length + 1).fill(
      Number.POSITIVE_INFINITY
    );
    const visitedColumns = new Array<boolean>(costMatrix.length + 1).fill(false);

    do {
      visitedColumns[currentColumn] = true;
      const currentRow = matchedRowByColumn[currentColumn];

      let smallestSlack = Number.POSITIVE_INFINITY;
      let nextColumn = 0;

      for (let candidateColumn = 1; candidateColumn <= costMatrix.length; candidateColumn++) {
        if (visitedColumns[candidateColumn]) {
          continue;
        }

        const reducedCost =
          costMatrix[currentRow - 1][candidateColumn - 1] -
          rowPotential[currentRow] -
          columnPotential[candidateColumn];

        if (reducedCost < minReducedCostByColumn[candidateColumn]) {
          minReducedCostByColumn[candidateColumn] = reducedCost;
          previousColumn[candidateColumn] = currentColumn;
        }

        if (minReducedCostByColumn[candidateColumn] < smallestSlack) {
          smallestSlack = minReducedCostByColumn[candidateColumn];
          nextColumn = candidateColumn;
        }
      }

      for (let column = 0; column <= costMatrix.length; column++) {
        if (visitedColumns[column]) {
          rowPotential[matchedRowByColumn[column]] += smallestSlack;
          columnPotential[column] -= smallestSlack;
        } else {
          minReducedCostByColumn[column] -= smallestSlack;
        }
      }

      currentColumn = nextColumn;
    } while (matchedRowByColumn[currentColumn] !== 0);

    do {
      const parentColumn = previousColumn[currentColumn];
      matchedRowByColumn[currentColumn] = matchedRowByColumn[parentColumn];
      currentColumn = parentColumn;
    } while (currentColumn !== 0);
  }

  private buildSolution(costMatrix: number[][], matchedRowByColumn: number[]): HungarianSolution {
    const assignments: DriverRoutePair[] = [];
    let totalCost = 0;

    for (let column = 1; column <= costMatrix.length; column++) {
      const row = matchedRowByColumn[column];

      if (row === 0) {
        continue;
      }

      const driverIndex = row - 1;
      const routeIndex = column - 1;
      const cost = costMatrix[driverIndex][routeIndex];

      assignments.push({
        driverIndex,
        routeIndex,
        cost,
      });

      totalCost += cost;
    }

    assignments.sort((left, right) => left.driverIndex - right.driverIndex);

    return {
      assignments,
      totalCost,
    };
  }

  private reduceRows(matrix: number[][]): number[][] {
    return matrix.map((row) => {
      const minValue = Math.min(...row);
      return row.map((value) => value - minValue);
    });
  }

  private reduceColumns(matrix: number[][]): number[][] {
    const reduced = this.cloneMatrix(matrix);

    for (let column = 0; column < reduced.length; column++) {
      let minValue = Number.POSITIVE_INFINITY;
      for (let row = 0; row < reduced.length; row++) {
        minValue = Math.min(minValue, reduced[row][column]);
      }
      for (let row = 0; row < reduced.length; row++) {
        reduced[row][column] -= minValue;
      }
    }

    return reduced;
  }

  private getZeroCells(matrix: number[][]): MatrixCellRef[] {
    const zeros: MatrixCellRef[] = [];

    for (let row = 0; row < matrix.length; row++) {
      for (let column = 0; column < matrix[row].length; column++) {
        if (matrix[row][column] === 0) {
          zeros.push({ rowIndex: row, columnIndex: column });
        }
      }
    }

    return zeros;
  }

  private findZeroMatching(matrix: number[][]): MatrixCellRef[] {
    const size = matrix.length;
    const usedColumns = new Array<boolean>(size).fill(false);
    const selectedColumnByRow = new Array<number>(size).fill(-1);

    const search = (row: number): boolean => {
      if (row === size) {
        return true;
      }

      for (let column = 0; column < size; column++) {
        if (matrix[row][column] !== 0 || usedColumns[column]) {
          continue;
        }

        usedColumns[column] = true;
        selectedColumnByRow[row] = column;

        if (search(row + 1)) {
          return true;
        }

        usedColumns[column] = false;
        selectedColumnByRow[row] = -1;
      }

      return false;
    };

    search(0);

    return selectedColumnByRow
      .map((columnIndex, rowIndex) => ({ rowIndex, columnIndex }))
      .filter((cell) => cell.columnIndex >= 0);
  }

  private findMinimumLineCover(matrix: number[][]): { rows: number[]; columns: number[] } {
    const size = matrix.length;
    let bestRows: number[] = [];
    let bestColumns: number[] = [];
    let bestCount = Number.POSITIVE_INFINITY;

    for (let rowMask = 0; rowMask < 1 << size; rowMask++) {
      const rowCount = this.countBits(rowMask);
      if (rowCount > bestCount) {
        continue;
      }

      for (let columnMask = 0; columnMask < 1 << size; columnMask++) {
        const lines = rowCount + this.countBits(columnMask);
        if (lines >= bestCount) {
          continue;
        }

        if (this.areAllZerosCovered(matrix, rowMask, columnMask)) {
          bestCount = lines;
          bestRows = this.maskToIndexes(rowMask, size);
          bestColumns = this.maskToIndexes(columnMask, size);
        }
      }
    }

    return { rows: bestRows, columns: bestColumns };
  }

  private adjustMatrixWithCover(
    matrix: number[][],
    coveredRows: number[],
    coveredColumns: number[]
  ): number[][] {
    const adjusted = this.cloneMatrix(matrix);
    const coveredRowSet = new Set(coveredRows);
    const coveredColumnSet = new Set(coveredColumns);

    let minUncovered = Number.POSITIVE_INFINITY;

    for (let row = 0; row < adjusted.length; row++) {
      for (let column = 0; column < adjusted[row].length; column++) {
        const isUncovered = !coveredRowSet.has(row) && !coveredColumnSet.has(column);
        if (isUncovered) {
          minUncovered = Math.min(minUncovered, adjusted[row][column]);
        }
      }
    }

    if (!Number.isFinite(minUncovered)) {
      return adjusted;
    }

    for (let row = 0; row < adjusted.length; row++) {
      for (let column = 0; column < adjusted[row].length; column++) {
        const rowCovered = coveredRowSet.has(row);
        const columnCovered = coveredColumnSet.has(column);

        if (!rowCovered && !columnCovered) {
          adjusted[row][column] -= minUncovered;
        } else if (rowCovered && columnCovered) {
          adjusted[row][column] += minUncovered;
        }
      }
    }

    return adjusted;
  }

  private areAllZerosCovered(matrix: number[][], rowMask: number, columnMask: number): boolean {
    for (let row = 0; row < matrix.length; row++) {
      for (let column = 0; column < matrix[row].length; column++) {
        if (matrix[row][column] !== 0) {
          continue;
        }

        const rowCovered = (rowMask & (1 << row)) !== 0;
        const columnCovered = (columnMask & (1 << column)) !== 0;

        if (!rowCovered && !columnCovered) {
          return false;
        }
      }
    }

    return true;
  }

  private maskToIndexes(mask: number, size: number): number[] {
    const indexes: number[] = [];
    for (let index = 0; index < size; index++) {
      if ((mask & (1 << index)) !== 0) {
        indexes.push(index);
      }
    }
    return indexes;
  }

  private countBits(mask: number): number {
    let count = 0;
    let value = mask;

    while (value > 0) {
      count += value & 1;
      value >>= 1;
    }

    return count;
  }

  private cloneMatrix(matrix: number[][]): number[][] {
    return matrix.map((row) => [...row]);
  }

  private sameCell(left: MatrixCellRef, right: MatrixCellRef): boolean {
    return left.rowIndex === right.rowIndex && left.columnIndex === right.columnIndex;
  }

  private validateSquareMatrix(costMatrix: number[][]): void {
    if (!Array.isArray(costMatrix) || costMatrix.length === 0) {
      throw new Error('La matriz de costos debe ser cuadrada y tener al menos una fila.');
    }

    const size = costMatrix.length;

    for (const row of costMatrix) {
      if (!Array.isArray(row) || row.length !== size) {
        throw new Error('La matriz de costos debe ser cuadrada.');
      }
      for (const cell of row) {
        if (!Number.isFinite(cell)) {
          throw new Error('La matriz contiene valores inválidos.');
        }
      }
    }
  }
}