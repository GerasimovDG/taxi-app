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
  private departurePoint: any;
  private arrivalPoint: any;

  private driverPoint: any;

  private route: any;
  private distance = new Subject<number>();
  public distance$ = this.distance.asObservable();


  clearPoints(): void {
    this.departurePoint = null;
    this.arrivalPoint = null;
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

    // Сравним положение, вычисленное по ip пользователя и
    // положение, вычисленное средствами браузера.
    // geolocation.get({
    //   provider: 'yandex',
    //   mapStateAutoApply: true
    // }).then((result) => {
    //   console.log(result);
    //   // Красным цветом пометим положение, вычисленное через ip.
    //   result.geoObjects.options.set('preset', 'islands#redCircleIcon');
    //   result.geoObjects.get(0).properties.set({
    //     balloonContentBody: 'Мое местоположение'
    //   });
    //   this.map.geoObjects.add(result.geoObjects);
    // });

    geolocation.get({
      provider: 'browser',
      mapStateAutoApply: true
    }).then((result) => {
      console.log(result);
      this.userGeoLocation = result.geoObjects;
      // Синим цветом пометим положение, полученное через браузер.
      // Если браузер не поддерживает эту функциональность, метка не будет добавлена на карту.
      result.geoObjects.options.set('preset', 'islands#blueCircleIcon');
      this.map.geoObjects.add(result.geoObjects);
    });
  }

  private setPoint(place, point): void {
    console.log(place);
    // Поиск координат центра Нижнего Новгорода.
    // @ts-ignore
    ymaps.geocode(place, {
      /**
       * Опции запроса
       * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/geocode.xml
       */
      // Сортировка результатов от центра окна карты.
      // boundedBy: myMap.getBounds(),
      // strictBounds: true,
      // Вместе с опцией boundedBy будет искать строго внутри области, указанной в boundedBy.
      // Если нужен только один результат, экономим трафик пользователей.
      results: 1
    }).then((res) => {
      // Выбираем первый результат геокодирования.
      if (point) {
        this.map.geoObjects.remove(point);
      }
      const firstGeoObject = res.geoObjects.get(0);
      point = firstGeoObject;
      // Координаты геообъекта.
      const coords = firstGeoObject.geometry.getCoordinates();
      // Область видимости геообъекта.
      const bounds = firstGeoObject.properties.get('boundedBy');

      firstGeoObject.options.set('preset', 'islands#darkBlueDotIconWithCaption');
      // Получаем строку с адресом и выводим в иконке геообъекта.
      firstGeoObject.properties.set('iconCaption', firstGeoObject.getAddressLine());

      // Добавляем первый найденный геообъект на карту.

      this.map.geoObjects.add(point);
      // Масштабируем карту на область видимости геообъекта.
      this.map.setBounds(bounds, {
        // Проверяем наличие тайлов на данном масштабе.
        checkZoomRange: true
      });

      /**
       * Все данные в виде javascript-объекта.
       */
      console.log('Все данные геообъекта: ', firstGeoObject.properties.getAll());
      /**
       * Метаданные запроса и ответа геокодера.
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/GeocoderResponseMetaData.xml
       */
      console.log('Метаданные ответа геокодера: ', res.metaData);
      /**
       * Метаданные геокодера, возвращаемые для найденного объекта.
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/GeocoderMetaData.xml
       */
      console.log('Метаданные геокодера: ', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData'));
      /**
       * Точность ответа (precision) возвращается только для домов.
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/precision.xml
       */
      console.log('precision', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData.precision'));
      /**
       * Тип найденного объекта (kind).
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/kind.xml
       */
      console.log('Тип геообъекта: %s', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData.kind'));
      console.log('Название объекта: %s', firstGeoObject.properties.get('name'));
      console.log('Описание объекта: %s', firstGeoObject.properties.get('description'));
      console.log('Полное описание объекта: %s', firstGeoObject.properties.get('text'));
      /**
       * Прямые методы для работы с результатами геокодирования.
       * @see https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeocodeResult-docpage/#getAddressLine
       */
      console.log('\nГосударство: %s', firstGeoObject.getCountry());
      console.log('Населенный пункт: %s', firstGeoObject.getLocalities().join(', '));
      console.log('Адрес объекта: %s', firstGeoObject.getAddressLine());
      console.log('Наименование здания: %s', firstGeoObject.getPremise() || '-');
      console.log('Номер здания: %s', firstGeoObject.getPremiseNumber() || '-');

      /**
       * Если нужно добавить по найденным геокодером координатам метку со своими стилями и контентом балуна, создаем новую метку по координатам найденной и добавляем ее на карту вместо найденной.
       */
      /**
       var myPlacemark = new ymaps.Placemark(coords, {
             iconContent: 'моя метка',
             balloonContent: 'Содержимое балуна <strong>моей метки</strong>'
             }, {
             preset: 'islands#violetStretchyIcon'
             });

       myMap.geoObjects.add(myPlacemark);
       */
      this.buildRouteBetweenTooPoints();
    });
  }

  setDeparturePoint(place: string| number[]): void {
    // @ts-ignore
    ymaps.geocode(place, {
      /**
       * Опции запроса
       * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/geocode.xml
       */
      // Сортировка результатов от центра окна карты.
      // boundedBy: myMap.getBounds(),
      // strictBounds: true,
      // Вместе с опцией boundedBy будет искать строго внутри области, указанной в boundedBy.
      // Если нужен только один результат, экономим трафик пользователей.
      results: 1
    }).then((res) => {
      // Выбираем первый результат геокодирования.
      if (this.departurePoint) {
        this.map.geoObjects.remove(this.departurePoint);
      }
      const firstGeoObject = res.geoObjects.get(0);
      this.departurePoint = firstGeoObject;
      // Координаты геообъекта.
      const coords = firstGeoObject.geometry.getCoordinates();
      // Область видимости геообъекта.
      const bounds = firstGeoObject.properties.get('boundedBy');

      firstGeoObject.options.set('preset', 'islands#darkBlueDotIconWithCaption');
      // Получаем строку с адресом и выводим в иконке геообъекта.
      firstGeoObject.properties.set('iconCaption', firstGeoObject.getAddressLine());

      // Добавляем первый найденный геообъект на карту.

      this.map.geoObjects.add(this.departurePoint);
      // Масштабируем карту на область видимости геообъекта.
      this.map.setBounds(bounds, {
        // Проверяем наличие тайлов на данном масштабе.
        checkZoomRange: true
      });

      /**
       * Все данные в виде javascript-объекта.
       */
      console.log('Все данные геообъекта: ', firstGeoObject.properties.getAll());
      /**
       * Метаданные запроса и ответа геокодера.
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/GeocoderResponseMetaData.xml
       */
      console.log('Метаданные ответа геокодера: ', res.metaData);
      /**
       * Метаданные геокодера, возвращаемые для найденного объекта.
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/GeocoderMetaData.xml
       */
      console.log('Метаданные геокодера: ', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData'));
      /**
       * Точность ответа (precision) возвращается только для домов.
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/precision.xml
       */
      console.log('precision', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData.precision'));
      /**
       * Тип найденного объекта (kind).
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/kind.xml
       */
      console.log('Тип геообъекта: %s', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData.kind'));
      console.log('Название объекта: %s', firstGeoObject.properties.get('name'));
      console.log('Описание объекта: %s', firstGeoObject.properties.get('description'));
      console.log('Полное описание объекта: %s', firstGeoObject.properties.get('text'));
      /**
       * Прямые методы для работы с результатами геокодирования.
       * @see https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeocodeResult-docpage/#getAddressLine
       */
      console.log('\nГосударство: %s', firstGeoObject.getCountry());
      console.log('Населенный пункт: %s', firstGeoObject.getLocalities().join(', '));
      console.log('Адрес объекта: %s', firstGeoObject.getAddressLine());
      console.log('Наименование здания: %s', firstGeoObject.getPremise() || '-');
      console.log('Номер здания: %s', firstGeoObject.getPremiseNumber() || '-');

      /**
       * Если нужно добавить по найденным геокодером координатам метку со своими стилями и контентом балуна, создаем новую метку по координатам найденной и добавляем ее на карту вместо найденной.
       */
      /**
       var myPlacemark = new ymaps.Placemark(coords, {
             iconContent: 'моя метка',
             balloonContent: 'Содержимое балуна <strong>моей метки</strong>'
             }, {
             preset: 'islands#violetStretchyIcon'
             });

       myMap.geoObjects.add(myPlacemark);
       */
      this.buildRouteBetweenTooPoints();
    });
  }

  setArrivalPoint(place: string | number[]): void {
    // @ts-ignore
    ymaps.geocode(place, {
      /**
       * Опции запроса
       * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/geocode.xml
       */
      // Сортировка результатов от центра окна карты.
      // boundedBy: myMap.getBounds(),
      // strictBounds: true,
      // Вместе с опцией boundedBy будет искать строго внутри области, указанной в boundedBy.
      // Если нужен только один результат, экономим трафик пользователей.
      results: 1
    }).then((res) => {
      // Выбираем первый результат геокодирования.
      if (this.arrivalPoint) {
        this.map.geoObjects.remove(this.arrivalPoint);
      }
      const firstGeoObject = res.geoObjects.get(0);
      this.arrivalPoint = firstGeoObject;
      // Координаты геообъекта.
      const coords = firstGeoObject.geometry.getCoordinates();
      // Область видимости геообъекта.
      const bounds = firstGeoObject.properties.get('boundedBy');

      firstGeoObject.options.set('preset', 'islands#darkBlueDotIconWithCaption');
      // Получаем строку с адресом и выводим в иконке геообъекта.
      firstGeoObject.properties.set('iconCaption', firstGeoObject.getAddressLine());

      // Добавляем первый найденный геообъект на карту.

      this.map.geoObjects.add(this.arrivalPoint);
      // Масштабируем карту на область видимости геообъекта.
      this.map.setBounds(bounds, {
        // Проверяем наличие тайлов на данном масштабе.
        checkZoomRange: true
      });

      /**
       * Все данные в виде javascript-объекта.
       */
      console.log('Все данные геообъекта: ', firstGeoObject.properties.getAll());
      /**
       * Метаданные запроса и ответа геокодера.
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/GeocoderResponseMetaData.xml
       */
      console.log('Метаданные ответа геокодера: ', res.metaData);
      /**
       * Метаданные геокодера, возвращаемые для найденного объекта.
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/GeocoderMetaData.xml
       */
      console.log('Метаданные геокодера: ', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData'));
      /**
       * Точность ответа (precision) возвращается только для домов.
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/precision.xml
       */
      console.log('precision', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData.precision'));
      /**
       * Тип найденного объекта (kind).
       * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/kind.xml
       */
      console.log('Тип геообъекта: %s', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData.kind'));
      console.log('Название объекта: %s', firstGeoObject.properties.get('name'));
      console.log('Описание объекта: %s', firstGeoObject.properties.get('description'));
      console.log('Полное описание объекта: %s', firstGeoObject.properties.get('text'));
      /**
       * Прямые методы для работы с результатами геокодирования.
       * @see https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeocodeResult-docpage/#getAddressLine
       */
      console.log('\nГосударство: %s', firstGeoObject.getCountry());
      console.log('Населенный пункт: %s', firstGeoObject.getLocalities().join(', '));
      console.log('Адрес объекта: %s', firstGeoObject.getAddressLine());
      console.log('Наименование здания: %s', firstGeoObject.getPremise() || '-');
      console.log('Номер здания: %s', firstGeoObject.getPremiseNumber() || '-');

      // /**
      //  * Если нужно добавить по найденным геокодером координатам метку со своими стилями и контентом балуна,
      //  * создаем новую метку по координатам найденной и добавляем ее на карту вместо найденной.
      //  */
      // /**
      //  var myPlacemark = new ymaps.Placemark(coords, {
      //        iconContent: 'моя метка',
      //        balloonContent: 'Содержимое балуна <strong>моей метки</strong>'
      //        }, {
      //        preset: 'islands#violetStretchyIcon'
      //        });
      //
      //  myMap.geoObjects.add(myPlacemark);
      //  */
      this.buildRouteBetweenTooPoints();
    });
  }

  buildRouteBetweenTooPoints(): void {
    if (this.departurePoint && this.arrivalPoint) {
      if (this.route) {
        this.map.geoObjects.remove(this.route);
        // this.distance
      }
      this.route = new ymaps.multiRouter.MultiRoute({
        // Описание опорных точек мультимаршрута.
        referencePoints: [
          this.departurePoint.geometry.getCoordinates(),
          this.arrivalPoint.geometry.getCoordinates()
        ],
        // Параметры маршрутизации.
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
        .add('requestfail', (event) =>{
          console.log('Error: ' + event.get('error').message);
        });

      // // Создаем кнопки для управления мультимаршрутом.
      // const trafficButton = new ymaps.control.Button({
      //     data: { content: "Учитывать пробки" },
      //     options: { selectOnClick: true }
      //   });
      // const viaPointButton = new ymaps.control.Button({
      //     data: { content: "Добавить транзитную точку" },
      //     options: { selectOnClick: true }
      //   });
      //
      // // Объявляем обработчики для кнопок.
      // trafficButton.events.add('select', () => {
      //   /**
      //    * Задаем параметры маршрутизации для модели мультимаршрута.
      //    * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRouteModel.xml#setParams
      //    */
      //   multiRoute.model.setParams({ avoidTrafficJams: true }, true);
      // });
      //
      // trafficButton.events.add('deselect', () => {
      //   multiRoute.model.setParams({ avoidTrafficJams: false }, true);
      // });
      //
      // viaPointButton.events.add('select', () => {
      //   const referencePoints = multiRoute.model.getReferencePoints();
      //   referencePoints.splice(1, 0, "Москва, ул. Солянка, 7");
      //   /**
      //    * Добавляем транзитную точку в модель мультимаршрута.
      //    * Обратите внимание, что транзитные точки могут находится только
      //    * между двумя путевыми точками, т.е. не могут быть крайними точками маршрута.
      //    * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRouteModel.xml#setReferencePoints
      //    */
      //   multiRoute.model.setReferencePoints(referencePoints, [1]);
      // });
      //
      // viaPointButton.events.add('deselect', () => {
      //   const referencePoints = multiRoute.model.getReferencePoints();
      //   referencePoints.splice(1, 1);
      //   multiRoute.model.setReferencePoints(referencePoints, []);
      // });
      //
      // // Создаем карту с добавленными на нее кнопками.
      // const myMap = new ymaps.Map('map', {
      //   center: [55.750625, 37.626],
      //   zoom: 7,
      //   controls: [trafficButton, viaPointButton]
      // }, {
      //   buttonMaxWidth: 300
      // });
      console.log(this.route.getActiveRoute());

      // Добавляем мультимаршрут на карту.

    }
  }

  getPlaceByCoordinate(): any {
      // @ts-ignore
      ymaps.geocode([56.28864427117307, 44.06713390073902], {

        // Сортировка результатов от центра окна карты.
        // boundedBy: myMap.getBounds(),
        // strictBounds: true,
        // Вместе с опцией boundedBy будет искать строго внутри области, указанной в boundedBy.
        // Если нужен только один результат, экономим трафик пользователей.
        results: 1
      }).then( data => {
        console.log(data);
      });
  }


  getDeparturePointCoords(): any {
    return this.departurePoint.geometry.getCoordinates();
  }

  getArrivalPointCoords(): any {
    return this.arrivalPoint.geometry.getCoordinates();
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
