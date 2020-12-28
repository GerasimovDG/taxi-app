import { Injectable } from '@angular/core';

// const MIN_COST = 60;


@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  constructor() { }


  calculateTripCost(distance: number): number {
    const cost = Math.ceil(distance / 60);
   // return cost > MIN_COST ? cost : MIN_COST;
    return cost;
  }
}
