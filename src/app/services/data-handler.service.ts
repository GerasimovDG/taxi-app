import { Injectable } from '@angular/core';
import {FbAuthResponse} from '../shared/interfaces/common';
import {Observable, of, Subject} from 'rxjs';
import {AngularFireDatabase, AngularFireList, AngularFireObject} from '@angular/fire/database';
import {take, takeUntil} from 'rxjs/operators';
import {getDistance} from '../shared/constants';

// @ts-ignore
const geofire = require('geofire');

@Injectable({
  providedIn: 'root'
})
export class DataHandlerService {
  driversRef: AngularFireList<any> = null;
  clientsRef: AngularFireList<any> = null;
  historyRef: AngularFireList<any> = null;

  activeDriver$ = new Subject<any>();
  activeDriverID = '';

  constructor(private db: AngularFireDatabase) {
    this.driversRef = db.list('/Users/Drivers');
    this.clientsRef = db.list('/Users/Customers');
    this.historyRef = db.list('/history');
  }

  getUserById(id: string): AngularFireObject<any> {
    return this.db.object('/Users/Customers/' + id);
  }

  getDriverById(id: string): AngularFireObject<any> {
    return this.db.object('/Users/Drivers/' + id);
  }

  updateDriverById(id: string, driver: any): void {
    this.driversRef.update( id, driver);
  }

  findNearestDriver(customerRequest: any, startCoords: number[]): any {
    const componentDestroyed = new Subject();
    let minDistance = 999999;
    let driversA = [];
    let nearestDriverKey = '';
    const driversAvailableRef = this.db.list('/driversAvailable');
    driversAvailableRef.snapshotChanges()
      // .pipe(take(1))
      .pipe(takeUntil(componentDestroyed))
      .subscribe( drivers => {
        driversA = [];
        drivers.forEach( driver => {
          const item = driver.payload.toJSON();
          item['$key'] = driver.key;
          driversA.push(item);
        });

        driversA.forEach( driver => {
          const distance = getDistance(
            [customerRequest.destinationLat, customerRequest.destinationLng],
            [driver.l['0'], driver.l['1']]
          );
          // const distance = this.getDistance(
          //   {lat: customerRequest.destinationLat, lng: customerRequest.destinationLng},
          //   {lat: driver.l['0'], lng: driver.l['1']}
          // );
          console.log(distance);
          if (distance < minDistance) {
            nearestDriverKey = driver['$key'];
            minDistance = distance;
          }
        });
        console.log(nearestDriverKey);
        if (nearestDriverKey) {
          this.activeDriverID = nearestDriverKey;
          this.getDriverById(this.activeDriverID).valueChanges().pipe(take(1))
            .subscribe( driver => {
              const activeDriver = {...driver, $key: nearestDriverKey};
              this.activeDriver$.next(activeDriver);
            });
          console.log(minDistance);

          componentDestroyed.next();
          componentDestroyed.complete();


          console.log(this.driversRef);

          const customerRequestRef = this.db.list('/customerRequest');
          const geoFire = new geofire.GeoFire(customerRequestRef.query);
          // @ts-ignore
          // console.log(geoFire);
          geoFire.set(customerRequest.customerRideId, startCoords).then( resp => {
            console.log(resp);
          }).catch( err => {
            console.warn(err);
          });
          this.driversRef.update( nearestDriverKey, {customerRequest});


          this.hasRideEnded();
        }
      });
  }

  cancelOrder(customerID: string): any {
    if (this.activeDriverID) {
      const driverCustomerRequest = this.db.object('/Users/Drivers/' + this.activeDriverID + '/customerRequest');
      driverCustomerRequest.remove();
    }

    const customerRequestRef = this.db.list('/customerRequest');
    const geoFire = new geofire.GeoFire(customerRequestRef.query);
    if (geoFire) {
      geoFire.remove(customerID);
    }
    this.activeDriverID = null;
    this.activeDriver$.next(null);
  }


  private hasRideEnded(): void {
    if (this.activeDriverID) {

      const isCustomerRequestExistRef = this.db.object(
        '/Users/Drivers/' + this.activeDriverID + '/customerRequest/customerRideId').valueChanges();

      isCustomerRequestExistRef.subscribe( data => {
        if (!data) {
          this.activeDriverID = null;
          this.activeDriver$.next(null);
        }
      });
    }

  }

  getActiveDriver(): Observable<any> {
    if (this.activeDriverID) {
      return this.db.object('/driversWorking/' + this.activeDriverID).valueChanges();
    } else {
      return of(null);
    }
  }

  getAllDrivers(): AngularFireList<any> {
    // return this.driversRef;
    return this.db.list('/Users/Drivers');
  }

  getAllCustomers(): AngularFireList<any> {
    return this.clientsRef;
  }

  getHistory(): AngularFireList<any> {
    return this.historyRef;
  }
}
