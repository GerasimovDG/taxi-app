import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {User} from '../../shared/classes/user.class';
import {HttpClient} from '@angular/common/http';
import {AngularFireDatabase, AngularFireList, AngularFireObject} from '@angular/fire/database';
import {IUser} from '../../shared/interfaces/user';
import {FbAuthResponse, FbUser} from '../../shared/interfaces/common';
import {environment} from '../../../environments/environment';
import {tap} from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService extends AuthService {

  // historyRef: AngularFireList<any> = null;
  // driversRef: AngularFireList<any> = null;
  // clientsRef: AngularFireList<any> = null;

  user$: Subject<User> = new Subject<User>();

  adminRef: AngularFireObject<any> = null;

  // get token(): string {
  //   const expDate = new Date(localStorage.getItem('fb-token-exp'));
  //   if (new Date() > expDate) {
  //     this.logout();
  //     return null;
  //   }
  //   return localStorage.getItem('fb-token');
  // }

  // constructor(private http: HttpClient,
  //             private db: AngularFireDatabase) {
  //   // this.driversRef = db.list('/Users/Drivers');
  //   // this.clientsRef = db.list('/Users/Customers');
  //   // this.historyRef = db.list('/history');
  // }

  // private setToken(response: FbAuthResponse): void {
  //   if (response) {
  //     console.log(response);
  //     const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000);
  //     localStorage.setItem('tb-token', response.idToken);
  //     localStorage.setItem('tb-token-exp', expDate.toString());
  //   } else {
  //     localStorage.clear();
  //   }
  // }

  login(user: IUser): Observable<any> {
    const fbUser: FbUser = {...user, returnSecureToken: true};
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, fbUser)
      .pipe(
        tap(this.setToken),
        tap( (response: FbAuthResponse) => {
          this.user$.next({...user, id: response.localId});
          this.adminRef = this.db.object('Users/Administrators/' + response.localId);
        })
      );
  }

  // logout(): void {
  //   this.setToken(null);
  // }
  //
  // isAuthenticated(): boolean {
  //   return !!this.token;
  // }

}
