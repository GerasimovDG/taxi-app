import {Customer, Driver, DriverStatus, IUser} from '../interfaces/user';

export class User implements IUser {
  email: string;
  id?: string;
  name?: string;
  password: string;
  phone?: number;

  constructor(user: IUser) {
    this.email = user.email;
    this.password = user.password;
    this.name = user.name;
    this.id = user.id;
    this.phone = user.phone;
  }
}

export class CCustomer extends User implements Customer {
  email: string;
  id?: string;
  name?: string;
  password: string;
  phone?: number;
  // orderId?: string;

  constructor(user: Customer) {
    super(user);
    // this.orderId = user.orderId || '';
  }
}

export class CDriver extends User implements Driver {
  // salary = 0;
  car: string;
  licence: string;
  // orderId: string;
  modered: boolean;

  constructor(user: Driver) {
    super(user);
    this.car = user.car;
    this.licence = user.licence;
    this.modered = false;
  }

}
