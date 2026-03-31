import { Injectable } from '@angular/core';
import { DriverRoutePair, HungarianSolution } from '../models/driver-route-assignment.model';

@Injectable({ providedIn: 'root' })
export class HungarianSolverService {
  solve(costMatrix: number[][]): HungarianSolution {
  this.validateSquareMatrix(costMatrix);

  const size = costMatrix.length;

  // Dual potentials used by the Hungarian algorithm.
  const rowPotential = new Array<number>(size + 1).fill(0);
  const columnPotential = new Array<number>(size + 1).fill(0);

  // matchedRowByColumn[col] = row currently assigned to this column.
  // Index 0 is a dummy column used internally by the algorithm.
  const matchedRowByColumn = new Array<number>(size + 1).fill(0);

  // previousColumn[col] helps reconstruct the augmenting path.
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

private addRowToMatching(
  rowToAssign: number,
  costMatrix: number[][],
  rowPotential: number[],
  columnPotential: number[],
  matchedRowByColumn: number[],
  previousColumn: number[]
): void {
  // Start from the dummy column. It temporarily "holds" the row we are trying to assign.
  matchedRowByColumn[0] = rowToAssign;

  let currentColumn = 0;

  // minReducedCostByColumn[col] = best reduced cost found so far for reaching this column.
  const minReducedCostByColumn = new Array<number>(costMatrix.length + 1).fill(Number.POSITIVE_INFINITY);

  // visitedColumns[col] = whether this column is already part of the current search tree.
  const visitedColumns = new Array<boolean>(costMatrix.length + 1).fill(false);

  do {
    visitedColumns[currentColumn] = true;

    // The row currently associated with the column we are expanding from.
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

    // Update dual potentials so that at least one new column becomes reachable with zero slack.
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

  // Reconstruct and apply the augmenting path.
  do {
    const parentColumn = previousColumn[currentColumn];
    matchedRowByColumn[currentColumn] = matchedRowByColumn[parentColumn];
    currentColumn = parentColumn;
  } while (currentColumn !== 0);
}

private buildSolution(
  costMatrix: number[][],
  matchedRowByColumn: number[]
): HungarianSolution {
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
      cost
    });

    totalCost += cost;
  }

  assignments.sort((left, right) => left.driverIndex - right.driverIndex);

  return {
    assignments,
    totalCost
  };
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
