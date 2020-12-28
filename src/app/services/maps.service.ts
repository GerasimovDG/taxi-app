import {Injectable} from '@angular/core';
import {Maps} from '../shared/interfaces/maps';
import {Subject} from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class MapsService {

  private map: ymaps.Map;
  // @ts-ignore
  private userGeoLocation: ymaps.map.GeoObjects;
  private points: any[] = [null, null];

  private driverPoint: any;

  private route: any;
  private distance = new Subject<number>();
  public distance$ = this.distance.asObservable();


  clearPoints(): void {
    this.points[0] = null;
  }

  createMap( domID: string, map?: Maps): void {
    if (map) {
      this.map = new ymaps.Map(domID, map.state, map.options);
    } else {
      this.map = new ymaps.Map(domID, {
        center: [56.299116, 43.982503],
        zoom: 12,
      });
    }
  }

  displayUserGeolocation(): void {
    // @ts-ignore
    const geolocation = ymaps.geolocation;

    geolocation.get({
      provider: 'browser',
      mapStateAutoApply: true
    }).then((result) => {
      this.userGeoLocation = result.geoObjects;
      result.geoObjects.options.set('preset', 'islands#blueCircleIcon');
      this.map.geoObjects.add(result.geoObjects);
    });
  }

  private setPoint(place, index: number): void {
    // @ts-ignore
    ymaps.geocode(place, {
      results: 1
    }).then((res) => {
      // Выбираем первый результат геокодирования.
      if (this.points[index]) {
        this.map.geoObjects.remove(this.points[index]);
      }
      const firstGeoObject = res.geoObjects.get(0);
      this.points[index] = firstGeoObject;
      // Координаты геообъекта.
      const coords = firstGeoObject.geometry.getCoordinates();
      // Область видимости геообъекта.
      const bounds = firstGeoObject.properties.get('boundedBy');

      firstGeoObject.options.set('preset', 'islands#darkBlueDotIconWithCaption');
      // Получаем строку с адресом и выводим в иконке геообъекта.
      firstGeoObject.properties.set('iconCaption', firstGeoObject.getAddressLine());

      // Добавляем первый найденный геообъект на карту.
      this.map.geoObjects.add(this.points[index]);
      // Масштабируем карту на область видимости геообъекта.
      this.map.setBounds(bounds, {
        // Проверяем наличие тайлов на данном масштабе.
        checkZoomRange: true
      });

      this.buildRouteBetweenTooPoints();
    });
  }

  setDeparturePoint(place: string| number[]): void {
    this.setPoint(place, 0);
  }

  setArrivalPoint(place: string | number[]): void {
    this.setPoint(place, 1);
  }

  buildRouteBetweenTooPoints(): void {
    if (this.points[0] && this.points[1]) {
      if (this.route) {
        this.map.geoObjects.remove(this.route);
      }
      this.route = new ymaps.multiRouter.MultiRoute({
        // Описание опорных точек мультимаршрута.
        referencePoints: [
          this.points[0].geometry.getCoordinates(),
          this.points[1].geometry.getCoordinates(),
        ],
        params: {
          // Ограничение на максимальное количество маршрутов, возвращаемое маршрутизатором.
          results: 1
        }
      }, {
        // Автоматически устанавливать границы карты так, чтобы маршрут был виден целиком.
        boundsAutoApply: true,
        wayPointVisible: false
      });
      this.map.geoObjects.add(this.route);

      this.route.model.events
        .add('requestsuccess', (event) => {
          const routes = event.get('target').getRoutes();
          console.log('Found routes: ' + routes.length);
          console.log(routes[0].properties.get('distance'));
          this.distance.next(routes[0].properties.get('distance').value);

        })
        .add('requestfail', (event) => {
          console.log('Error: ' + event.get('error').message);
        });

      console.log(this.route.getActiveRoute());
    }
  }


  getDeparturePointCoords(): any {
    return this.points[0].geometry.getCoordinates();
  }

  getArrivalPointCoords(): any {
    return this.points[1].geometry.getCoordinates();
  }

  createDriverMarker(place: number[]): void {
    if (place) {
      const driverCar = new ymaps.Placemark(place, {
        hintContent: 'Собственный значок метки',
        balloonContent: 'Это красивая метка'
      }, {
        // @ts-ignore
        iconLayout: 'default#image',
        iconImageHref: '../assets/icons/icon-car.png',
        iconImageSize: [30, 30],
        iconImageOffset: [-15, -15]
      });
      if (this.driverPoint) {
        this.map.geoObjects.remove(this.driverPoint);
      }
      this.driverPoint = driverCar;
      this.map.geoObjects.add(this.driverPoint);
    } else {
      if (this.driverPoint) {
        this.map.geoObjects.remove(this.driverPoint);
      }
    }
  }
}
