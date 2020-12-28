import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {IUser} from '../shared/interfaces/user';
import {FbAuthResponse} from '../shared/interfaces/common';
import {User} from '../shared/classes/user.class';
import {AngularFireDatabase, AngularFireList, AngularFireObject} from '@angular/fire/database';
import {ActivatedRoute} from '@angular/router';
// @ts-ignore
const geofire = require('geofire');

@Injectable({
  providedIn: 'root'
})
export abstract class AuthService {

  user: IUser;
  user$: Subject<User> = new Subject<User>();

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
  userRef: AngularFireObject<any> = null;


  constructor(protected http: HttpClient,
              protected db: AngularFireDatabase,
              private route: ActivatedRoute,
              ) {
    this.driversRef = db.list('/Users/Drivers');
    this.clientsRef = db.list('/Users/Customers');


    db.object('/Users/Customers/' + 'l827xBIxu4W7hp3wptolLHyzG2K3').valueChanges().subscribe( data => {
      console.log(data);
    });
  }

  abstract login(user: IUser): Observable<any>;


  logout(): void {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  protected setToken(response: FbAuthResponse): void {
    if (response) {
      console.log(response);
      const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000);
      localStorage.setItem('tb-token', response.idToken);
      localStorage.setItem('tb-token-exp', expDate.toString());
    } else {
      localStorage.clear();
    }
  }
}
