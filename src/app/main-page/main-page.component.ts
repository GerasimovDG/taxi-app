import {Component, OnInit, } from '@angular/core';
import {YaEvent} from 'angular8-yandex-maps';
import {MapsService} from '../services/maps.service';
import {AuthService} from '../services/auth.service';
import {isDriverNearby} from '../shared/constants';
import {MatDialog} from '@angular/material/dialog';
import {DriverNearbyComponent} from '../shared/components/driver-nearby/driver-nearby.component';
import {DataHandlerService} from '../services/data-handler.service';


const DELIVERY_TARIFF = 20;
const MINIMUM_COST = 500;


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.less']
})
export class MainPageComponent implements OnInit {

  map;
  isDriverNearbyDialogClosed = true;

  // @ViewChild('yaMapComponent')
  // yaMap: ElementRef;


  // myMap: ymaps.Map;

  // public routePanelParameters = {
  //   options: {
  //     showHeader: true,
  //     title: 'Расчёт стоимости маршрута',
  //   }
  // };

  // public parameters = {
  //   options: {
  //     position: {
  //       top: 45,
  //       left: 10
  //     },
  //     allowSwitch: false,
  //     reverseGeocoding: true,
  //     types: { taxi: true }
  //   },
  //   state: {
  //     type: 'taxi',
  //     fromEnabled: true,
  //     toEnabled: true
  //   }
  // };
  // public zoomControlParameters = {
  //   options: {
  //     size: 'large',
  //     float: 'none',
  //     position: {
  //       top: 45,
  //       right: 10
  //     }
  //   }
  // };

  /////////////////////////////////
  // lat = 56.299116;
  // lng = 43.982503;
  //
  // zoom = 8;
  //
  // // @ts-ignore
  // public markers: IMarker[] = [
  //   {
  //     lat: 56.299123,
  //     lng: 43.982653,
  //     label: 'A',
  //     draggable: true
  //   },
  //   {
  //     lat: 56.373858,
  //     lng: 43.215982,
  //     label: 'B',
  //     draggable: false
  //   },
  //   {
  //     lat: 56.723858,
  //     lng: 43.895982,
  //     label: 'C',
  //     draggable: true
  //   }
  // ];

  // @ViewChild('search')
  // private searchElemRef: ElementRef;

  // public lat;
  // public lng;
  // public zoom;
  // public latlongs: any = [];
  // public latLong: any = {};
  // public searchControl: FormControl;

  constructor(
    private mapService: MapsService,
    // private auth: AuthService,
    private data: DataHandlerService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getActiveDriver();
  }

  onMapReady($event: Pick<YaEvent<any>, 'target' | 'ymaps'>): void {
    console.log($event);

    this.mapService.createMap('map',
      {
        state: {
              center: [56.299116, 43.982503],
              zoom: 12,
              controls: ['zoomControl'],
              behaviors: ['drag', 'scrollZoom'],
            }
      });
  }

  onClick($event: MouseEvent): void {
    this.mapService.displayUserGeolocation();
  }


  getActiveDriver(): void {
    this.data.activeDriver$.subscribe( driver => {
      if (driver) {
        this.data.getActiveDriver().subscribe( driverWorking => {
          console.log(driverWorking);
          if (driverWorking) {
            this.mapService.createDriverMarker(driverWorking.l);
            if (isDriverNearby(driverWorking.l, this.mapService.getDeparturePointCoords()) && this.isDriverNearbyDialogClosed) {
              this.dialog.open(DriverNearbyComponent, {
                height: '130px',
                width: '400px',
              });
              this.isDriverNearbyDialogClosed = false;
            }
          } else {
            this.mapService.createDriverMarker(null);
            this.isDriverNearbyDialogClosed = true;
          }
        });
      }
    });
  }
}
