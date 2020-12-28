// import { google } from '@agm/core/services/google-maps-types';
import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {MapsAPILoader} from '@agm/core';
import {FormControl} from '@angular/forms';
import {YaEvent} from 'angular8-yandex-maps';
import {MapsService} from '../services/maps.service';
import {AuthService} from '../services/auth.service';
import {isDriverNearby} from '../shared/constants';
import {MatDialog} from '@angular/material/dialog';
import {DriverNearbyComponent} from '../shared/components/driver-nearby/driver-nearby.component';
// import {} from 'googlemaps'


const DELIVERY_TARIFF = 20;
const MINIMUM_COST = 500;


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.less']
})
export class MainPageComponent implements OnInit {

  map;
  myMap: ymaps.Map;
  isDriverNearbyDialogClosed = true;


  @ViewChild('yaMapComponent')
  yaMap: ElementRef;

  public routePanelParameters = {
    options: {
      showHeader: true,
      title: 'Расчёт стоимости маршрута',
    }
  };

  public parameters = {
    options: {
      position: {
        top: 45,
        left: 10
      },
      allowSwitch: false,
      reverseGeocoding: true,
      types: { taxi: true }
    },
    state: {
      type: 'taxi',
      fromEnabled: true,
      toEnabled: true
    }
  };
  public zoomControlParameters = {
    options: {
      size: 'large',
      float: 'none',
      position: {
        top: 45,
        right: 10
      }
    }
  };

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

  @ViewChild('search')
  private searchElemRef: ElementRef;

  public lat;
  public lng;
  public zoom;
  public latlongs: any = [];
  public latLong: any = {};
  public searchControl: FormControl;

  constructor(
    private mapService: MapsService,
    private auth: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // this.lat = 56.299116;
    // this.lng = 43.982503;
    // this.zoom = 8;
    //
    // this.mapsApiLoader.load().then( () => {
    //   const autoComplete = new google.maps.places.Autocomplete(this.searchElemRef.nativeElement, {
    //     types: [],
    //     componentRestrictions: {country: 'IN'}
    //   });
    //   autoComplete.addListener('place_changed', () => {
    //     this.ngZone.run(() => {
    //       const place: google.maps.places.PlaceResult = autoComplete.getPlace();
    //       if (place.geometry === undefined || place.geometry === null) {
    //         return;
    //       }
    //
    //       const lanLong = {
    //         latitude: place.geometry.location.lat,
    //         longitude : place.geometry.location.lng
    //       };
    //
    //       this.latlongs.push(lanLong);
    //       this.searchControl.reset();
    //     });
    //   });
    // });
    this.getActiveDriver();
  }

  private setCurrentPosition(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.zoom = 8;
      });
    }
  }


    // if (google) {
    //   google.maps.event.addDomListener(window, 'load', function (listener) {
    //     setDestination();
    //     initMap();
    //   });
    //
    //   console.log('aaaaaaaa');
    //   const fromPlaces = google.maps.places.Autocomplete(document.getElementById('from_places'));
    //
    //   google.maps.event.addListener(fromPlaces, 'place_changed', () => {
    //     const fromPlace = fromPlaces.getPlace();
    //     let fromAddress = fromPlace.formatted_address();
    //     let origin = document.getElementById('origin');
    //     // origin.value = fromAddress;
    //     origin.innerText = fromAddress;
    //   });
    // }



  public onRoutePanelLoad(event: any): void {
    const routePanel = event.instance.routePanel;
    console.log(event);

    routePanel.options.set({
      types: { auto: true }
    });

    // Получим ссылку на маршрут.
    routePanel.getRouteAsync()
      .then((route: any) => {
        // Зададим максимально допустимое число маршрутов, возвращаемых мультимаршрутизатором.
        route.model.setParams({ results: 1 }, true);

        // Повесим обработчик на событие построения маршрута.
        route.model.events.add('requestsuccess', () => {
          const activeRoute = route.getActiveRoute();

          if (activeRoute) {
            // Получим протяженность маршрута.
            const length = route.getActiveRoute().properties.get('distance');
            // Вычислим стоимость доставки.
            const price = this.calculate(Math.round(length.value / 1000));
            // Создадим макет содержимого балуна маршрута.
            const balloonContentLayout = event.ymaps.templateLayoutFactory.createClass(`
              <span>Расстояние: ${length.text}.</span><br/>
              <span style="font-weight: bold; font-style: italic">Стоимость доставки: ${price} р.</span>
            `);

            // Зададим этот макет для содержимого балуна.
            route.options.set('routeBalloonContentLayout', balloonContentLayout);
            // Откроем балун.
            activeRoute.balloon.open();
          }
        });
      });
  }

  // Функция, вычисляющая стоимость доставки.
  public calculate(routeLength): number {
    return (100 * Math.max(routeLength * DELIVERY_TARIFF, MINIMUM_COST));
  }

  mapClicked($event: any): void {
    console.dir($event);
    // this.markers.push({
    //   lat: $event.coords.lat,
    //   lng: $event.coords.lng,
    //   draggable: true
    // });
  }

  clickedMarker(label: string, i: number): void {

  }

  // markerDragEnd(m: IMarker, $event: any): void {
  //
  // }
  // mapReady($event: any) {
  //   this.map = $event;
  // }

  // private displayRoute(travelMode, origin, destination, directionsService, directionsDisplay): void {
  //   directionsService.route({
  //     origin: origin,
  //     destination: destination,
  //     travelMode: travelMode,
  //     avoidTolls: true
  //   }, (response, status) => {
  //     if (status === 'OK') {
  //       directionsDisplay.setMap(map);
  //       directionsDisplay.setDirections(response);
  //     } else {
  //       directionsDisplay.setMap(null);
  //       directionsDisplay.setDirections(null);
  //       alert("AAAAAAAAA" + status);
  //     }
  //   });
  // }
  onMapReady($event: Pick<YaEvent<any>, 'target' | 'ymaps'>): void {
    console.log($event);
    console.log(this.yaMap);

    this.mapService.createMap('map',
      {
        state: {
              center: [56.299116, 43.982503],
              zoom: 12,
              controls: ['zoomControl'],
              behaviors: ['drag', 'scrollZoom'],
            }
      });
    // this.myMap = new ymaps.Map('map', {
    //     center: [56.299116, 43.982503],
    //     zoom: 12,
    //     // controls: ['zoomControl'],
    //     behaviors: ['drag'],
    //   });


    // const placemark = new ymaps.Placemark([56.2995, 43.982503], {
    //   hintContent: 'placemark',
    //   balloonContent: 'balooon'
    // });
    // this.myMap.geoObjects.add(new ymaps.Placemark([56.299116, 43.982503], {
    //   balloonContent: 'цвет <strong>воды пляжа бонди</strong>'
    // }));
    // this.myMap.geoObjects.add(new ymaps.Placemark([56.3, 43.982503], {
    //   balloonContent: 'цвет <strong>воды пляжа бонди</strong>'
    // }));




  }

  onClick($event: MouseEvent): void {
    this.mapService.displayUserGeolocation();
  }


  getActiveDriver(): void {
    this.auth.activeDriver$.subscribe( driver => {
      if (driver) {
        this.auth.getActiveDriver().subscribe( driverWorking => {
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
