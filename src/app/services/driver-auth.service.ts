import { Injectable } from '@angular/core';
import {AuthService} from './auth.service';
import {IUser} from '../shared/interfaces/user';
import {Observable} from 'rxjs';
import {FbAuthResponse, FbUser, Registration} from '../shared/interfaces/common';
import {environment} from '../../environments/environment';
import {tap} from 'rxjs/operators';
import {CDriver, User} from '../shared/classes/user.class';

@Injectable({
  providedIn: 'root'
})
export class DriverAuthService extends AuthService implements Registration {

  // constructor() { }

  login(user: IUser): Observable<any> {
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
          this.driversRef.update( response.localId, userData);
        })
      );
  }
}
