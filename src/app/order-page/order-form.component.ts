import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MapsService} from '../services/maps.service';
import {defaultIfEmpty} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {calculateTripCost} from '../shared/constants';
import {DataHandlerService} from '../services/data-handler.service';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.less'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class OrderFormComponent implements OnInit, OnDestroy {
  subscription$: Subscription = new Subscription();

  public cost = 0;
  public submitText = 'Заказать такси';
  public activeDriver: any;

  userId: string;

  constructor(
    private mapService: MapsService,
    // public auth: AuthService,
    public data: DataHandlerService,
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
        this.cost = calculateTripCost(distance);
      } else {
        this.cost = null;
      }
      this.cdRef.detectChanges();

      console.log(this.cost);
    }));

    this.data.activeDriver$.subscribe( data => {
      this.activeDriver = data;
      if (!data) {
        this.submitText = 'Заказать такси';
      }
    });
  }


  submit(): void {
    this.submitText = 'Поиск такси...';

    const startCoords = this.mapService.getDeparturePointCoords();
    const endCoords = this.mapService.getArrivalPointCoords();

    const customerRequest = {
      customerRideId: this.userId,
      destination: 'Destination',
      destinationLat: endCoords[0],
      destinationLng: endCoords[1],
    };

    this.data.findNearestDriver(customerRequest, startCoords);
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

  cancelOrder(): void {
    this.data.cancelOrder(this.userId);
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }
}
