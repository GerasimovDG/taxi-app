import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MapsService} from '../services/maps.service';
import {CalculatorService} from '../services/calculator.service';
import {defaultIfEmpty} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.less'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class OrderFormComponent implements OnInit, OnDestroy {

  public cost = 0;
  subscription$: Subscription = new Subscription();

  activeDriver: any;

  submitText = 'Заказать такси';

  userId: string;

  constructor(
    private mapService: MapsService,
    public auth: AuthService,
    private calculatorService: CalculatorService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.cost = null;
    this.mapService.clearPoints();
    this.userId = this.route.snapshot.params.id;

    this.subscription$.add(this.mapService.distance$.pipe(defaultIfEmpty()).subscribe(distance => {
      console.log(distance);
      if (distance) {
        this.cost = this.calculatorService.calculateTripCost(distance);
      } else {
        this.cost = null;
      }
      this.cdRef.detectChanges();

      console.log(this.cost);
    }));

    this.auth.activeDriver$.subscribe( data => {
      this.activeDriver = data;
      if (!data) {
        this.submitText = 'Заказать такси';
      }
    });
  }


  submit(): void {
    this.submitText = 'Поиск такси...';
    // this.mapService.displayUserGeolocation();
    const startCoords = this.mapService.getDeparturePointCoords();
    const endCoords = this.mapService.getArrivalPointCoords();

    const customerRequest = {
      customerRideId: this.userId,
      destination: 'Destination',
      destinationLat: endCoords[0],
      destinationLng: endCoords[1],
    };

    this.auth.findNearestDriver(customerRequest, startCoords);
  }

  setDeparturePoint($event): void {
    const place = ($event.target.value).trim();
    if (place) {
      this.mapService.setDeparturePoint(place);
    }
  }

  setArrivalPoint($event): void {
    const place = ($event.target.value).trim();
    if (place) {
      this.mapService.setArrivalPoint(place);
    }
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }

  cancelOrder(): void {
    this.auth.cancelOrder(this.userId);
  }
}
