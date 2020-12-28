export enum DriverStatus {
  free = 'free',
  waitingForClient = 'waitingForClient',
  onTheWay = 'onTheWay',
  busy = 'busy',
  offline = 'offline'
}


export interface IUser {
  id?: string;
  name?: string;
  email: string;
  password: string;
  phone?: number;
}

export interface Customer extends IUser {
  orderId?: string;
}

// tslint:disable-next-line:no-empty-interface
export interface Employee extends IUser {
  // salary: number;
}

export interface Driver extends Employee {
  licence: string;
  car: string;
  // orderId?: string;
  // status: DriverStatus;
  // rating: number;
  modered: boolean;
}

// export interface CarInfo {
//   model: string;
//   number: string;
//   color: string;
// }

// tslint:disable-next-line:no-empty-interface
export interface Administrator extends Employee {
}
