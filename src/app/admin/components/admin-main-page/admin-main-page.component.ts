import { Component, OnInit } from '@angular/core';
import {IUser} from '../../../shared/interfaces/user';
import {Router} from '@angular/router';
import {AdminServiceService} from '../../services/admin-service.service';
import {MapsService} from '../../../services/maps.service';

@Component({
  selector: 'app-admin-main-page',
  templateUrl: './admin-main-page.component.html',
  styleUrls: ['./admin-main-page.component.less']
})
export class AdminMainPageComponent implements OnInit {

  isHistoryDisplayed = false;
  isDriversListDisplayed = true;
  isCustomersListDisplayed = false;


  isOpenDropdown = false;
  user: IUser;
  userRef: any;

  drivers: any;
  customers: any;
  history: any;

  constructor(private auth: AdminServiceService,
              private router: Router,
              private mapService: MapsService,
              ) { }

  ngOnInit(): void {
    this.auth.user$.subscribe( user => {
      console.log(user);
      // this.userRef = this.auth.getUserById(user.id).valueChanges().subscribe( data => {
      //   console.log(data);
      // });
    });

    this.auth.getHistory().valueChanges().subscribe( history => {
      console.log(history);
      this.history = history;
    });

    // this.auth.getAllDrivers().valueChanges().subscribe( data => {
    //   console.log(data);
    // });

    this.auth.getAllDrivers().snapshotChanges().subscribe(data => { // Using snapshotChanges() method to retrieve list of data along with metadata($key)
      const users = [];
      data.forEach(item => {
        const a = item.payload.toJSON();
        a['$key'] = item.key;
        users.push(a);
      });
      this.drivers = users;
      console.log(users);
    });

    this.auth.getAllCustomers().snapshotChanges().subscribe(data => { // Using snapshotChanges() method to retrieve list of data along with metadata($key)
      const users = [];
      data.forEach(item => {
        const a = item.payload.toJSON();
        a['$key'] = item.key;
        users.push(a);
      });
      this.customers = users;
      console.log(users);
    });

  }


  logout(event): void {
    console.log('logout');
    event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/signin']);
  }

  toggleDriversList(): void {
    this.isDriversListDisplayed = !this.isDriversListDisplayed;
  }

  confirmDriver(driver: any): void {
    console.log(driver);
    const updatedDriver = {...driver, modered: true};
    this.auth.updateDriver(updatedDriver);

  }

  blockDriver(driver: any): void {
    console.log(driver);
    const updatedDriver = {...driver, modered: false};
    this.auth.updateDriver(updatedDriver);
  }

  // deleteDriver(driver: any): void {
  //   this.auth.deleteDriver(driver);
  //   console.log(driver);
  // }
  init(): void {
    this.mapService.createMap('map',
      {
        state: {
          center: [56.299116, 43.982503],
          zoom: 12,
          // controls: ['zoomControl'],
          behaviors: ['drag'],
        }
      });
  }

  getRoute(location: any): void {
    this.mapService.setDeparturePoint([location.from.lat, location.from.lng]);
    this.mapService.setArrivalPoint([location.to.lat, location.to.lng]);
    this.mapService.buildRouteBetweenTooPoints();
  }

  toggleHistory(): void {
    this.isHistoryDisplayed = !this.isHistoryDisplayed;
  }

  toggleCustomers(): void {
    this.isCustomersListDisplayed = !this.isCustomersListDisplayed;
  }
}
