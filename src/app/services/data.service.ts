import { Injectable } from '@angular/core';
import {IUser} from '../shared/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private currUser: IUser;

  constructor() { }


  get currentUser(): IUser {
    return this.currUser;
  }
  set currentUser(user: IUser) {
    this.currUser = user;
  }
}
