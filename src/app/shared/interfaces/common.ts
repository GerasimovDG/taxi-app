import {Driver, DriverStatus, Employee, IUser} from './user';

export interface FbAuthResponse {
  localId: string;
  idToken: string;
  expiresIn: string;
}

export interface FbUser extends IUser {
  returnSecureToken: boolean;
}

export interface FbDriver extends Driver, IUser, Employee {
  licence: string;
  car: string;
  orderId?: string;
  status: DriverStatus;
  rating: number;
  name?: string;
  email: string;
  password: string;
  phone?: number;
}
