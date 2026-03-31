export interface DriverRoutePair {
  driverIndex: number;
  routeIndex: number;
  cost: number;
}

export interface HungarianSolution {
  assignments: DriverRoutePair[];
  totalCost: number;
}
