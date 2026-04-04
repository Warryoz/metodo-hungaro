export interface DriverRoutePair {
  driverIndex: number;
  routeIndex: number;
  cost: number;
}

export interface MatrixCellRef {
  rowIndex: number;
  columnIndex: number;
}

export interface HungarianStep {
  id: string;
  title: string;
  description: string;
  matrix: number[][];
  candidateZeros?: MatrixCellRef[];
  selectedCells?: MatrixCellRef[];
  discardedCells?: MatrixCellRef[];
  coveredRows?: number[];
  coveredColumns?: number[];
}

export interface SimpleAssignmentComparison {
  assignment: DriverRoutePair[];
  totalCost: number;
  savings: number;
}

export interface HungarianSolution {
  assignments: DriverRoutePair[];
  totalCost: number;
}

export interface HungarianDetailedSolution extends HungarianSolution {
  steps: HungarianStep[];
  simpleComparison: SimpleAssignmentComparison;
  summary: string;
}