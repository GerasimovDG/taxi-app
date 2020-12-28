import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, Observable, of, Subject, Subscription} from 'rxjs';
import {IUser} from '../shared/interfaces/user';
import {environment} from '../../environments/environment';
import {switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {FbAuthResponse, FbUser} from '../shared/interfaces/common';
import {CDriver, User} from '../shared/classes/user.class';
import {FirebaseApp} from '@angular/fire';
import {AngularFireDatabase, AngularFireList, AngularFireObject} from '@angular/fire/database';
import {ActivatedRoute} from '@angular/router';
import { getDistance } from '../shared/constants';
// @ts-ignore
const geofire = require('geofire');

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: IUser;
  user$: Subject<User> = new Subject<User>();
  activeDriver$ = new Subject<any>();

  destroy$ = false;

  get token(): string {
    const expDate = new Date(localStorage.getItem('fb-token-exp'));
    if (new Date() > expDate) {
      this.logout();
      return null;
    }
    return localStorage.getItem('fb-token');
  }

  driversRef: AngularFireList<any> = null;
  clientsRef: AngularFireList<any> = null;
  // customerRequestRef: AngularFireList<any> = null;
  userRef: AngularFireObject<any> = null;

  // geoFire: any;
  activeDriverID = '';

  constructor(private http: HttpClient,
              private db: AngularFireDatabase,
              private route: ActivatedRoute,
              ) {
    this.driversRef = db.list('/Users/Drivers');
    this.clientsRef = db.list('/Users/Customers');
    // this.customerRequestRef = db.list('/customerRequest');
    // this.geoFire = new geofire.GeoFire(this.customerRequestRef.query);

    db.object('/Users/Customers/' + 'l827xBIxu4W7hp3wptolLHyzG2K3').valueChanges().subscribe( data => {
      console.log(data);
    });
  }

  login(user: IUser): Observable<any> {
    const fbUser: FbUser = {...user, returnSecureToken: true};
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, fbUser)
      .pipe(
        tap(this.setToken),
        tap( (response: FbAuthResponse) => {
          this.user$.next({...user, id: response.localId});
          this.userRef = this.db.object('Users/Customers/' + response.localId);
        })
      );
  }

  loginDriver(user: IUser): Observable<any> {
    const fbUser: FbUser = {...user, returnSecureToken: true};
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, fbUser)
      .pipe(
        tap(this.setToken),
        tap( (response: FbAuthResponse) => {
          console.log(response);
          this.user$.next({...user, id: response.localId});
          this.userRef = this.db.object('Users/Drivers/' + response.localId);
        })
      );
  }


  logout(): void {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private setToken(response: FbAuthResponse): void {
    if (response) {
      console.log(response);
      const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000);
      localStorage.setItem('tb-token', response.idToken);
      localStorage.setItem('tb-token-exp', expDate.toString());
    } else {
      localStorage.clear();
    }
  }

  register(user: User): Observable<any> {
    delete user.id;
    const fbUser: IUser = {
      email: user.email,
      password: user.password
    };
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.apiKey}`, fbUser)
      .pipe(
        tap(this.setToken),
        tap( (response) => {
          const userData = {...user};
          delete userData.password;
          if ((userData as CDriver).licence) {
            this.driversRef.update( response.localId, userData);
          } else {
            this.clientsRef.update( response.localId, userData);
          }
        })
      );
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


  private getDistance( point1: any, point2): number {
    return Math.sqrt(Math.pow((point1.lat - point2.lat), 2) + Math.pow((point1.lng - point2.lng), 2));
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
      const isCustomerRequestExistRef = this.db.object('/Users/Drivers/' + this.activeDriverID + '/customerRequest/customerRideId').valueChanges();
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
}
