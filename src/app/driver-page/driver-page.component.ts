import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DataHandlerService} from '../services/data-handler.service';
import {DriverAuthService} from '../services/driver-auth.service';

@Component({
  selector: 'app-driver-page',
  templateUrl: './driver-page.component.html',
  styleUrls: ['./driver-page.component.less']
})
export class DriverPageComponent implements OnInit {

  userId: string;
  driver: any;

  updateForm: FormGroup;

  constructor(private route: ActivatedRoute,
              private driverAuth: DriverAuthService,
              private data: DataHandlerService,
              ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.params.id;


    // this.auth.user$.subscribe( data => {
    //   console.log(data);
    // });

    if (!this.driverAuth.userRef) {
      this.data.getDriverById(this.userId).snapshotChanges().subscribe(data => {
        this.driver = data.payload.toJSON();
        this.driver['$key'] = data.key;
        console.log(this.driver);

        this.updateForm.controls.name.setValue(this.driver.name);
        this.updateForm.controls.email.setValue(this.driver.email);
        this.updateForm.controls.phone.setValue(this.driver.phone);
        this.updateForm.controls.licence.setValue(this.driver.licence);
        this.updateForm.controls.car.setValue(this.driver.car);
      });
    } else {

      this.driverAuth.userRef.snapshotChanges().subscribe(data => {
        this.driver = data.payload.toJSON();
        this.driver['$key'] = data.key;
        console.log(this.driver);

        this.updateForm.controls.name.setValue(this.driver.name);
        this.updateForm.controls.email.setValue(this.driver.email);
        this.updateForm.controls.phone.setValue(this.driver.phone);
        this.updateForm.controls.licence.setValue(this.driver.licence);
        this.updateForm.controls.car.setValue(this.driver.car);
      });
    }

    this.updateForm = this.buildUpdateForm();
  }

  updateDriver(): void {
    console.log('sub');
    if (this.updateForm.invalid) {
      return;
    }

    const updatedDriver: any = {
      email: this.updateForm.value.email,
      name: this.updateForm.value.name,
      phone: this.updateForm.value.phone,
      licence: this.updateForm.value.licence,
      car: this.updateForm.value.car,
      modered: this.driver.modered,
    };

    this.data.updateDriverById(this.userId, updatedDriver);
  }

  private buildUpdateForm(): FormGroup {
    return new FormGroup({
      name: new FormControl( null, [Validators.required]),
      email: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      phone: new FormControl(null, [Validators.required]),
      licence: new FormControl(null, [Validators.required]),
      car: new FormControl(null, [Validators.required])
    });
  }
}
