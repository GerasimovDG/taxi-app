import {Component, OnInit} from '@angular/core';
import {MatOptionSelectionChange} from '@angular/material/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Driver, DriverStatus, IUser} from '../shared/interfaces/user';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {CCustomer, CDriver, User} from '../shared/classes/user.class';
import {take} from 'rxjs/operators';
import {FbAuthResponse} from '../shared/interfaces/common';


export const USER_TYPE = {
  CLIENT: 'Client',
  DRIVER: 'Driver'
};



@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.less']
})
export class LoginPageComponent implements OnInit {

  isErrorLogin = false;
  isOpenRegisterForm = false;
  isRegisterDriver = false;
  selectedRole = 'Client';

  loginForm: FormGroup;
  registerForm: FormGroup;
  disableBtn = false;


  constructor(private auth: AuthService,
              private router: Router) { }

  ngOnInit(): void {

    this.loginForm = new FormGroup({
      email: new FormControl( null,
        [
          Validators.required,
        ]),
      password: new FormControl(null,
        [
          Validators.required,
          Validators.minLength(6),
        ])
    });

    this.registerForm = new FormGroup({
      name: new FormControl( null,
        [
          Validators.required,
        ]),
      email: new FormControl( null,
        [
          Validators.required,
        ]),
      password: new FormControl(null,
        [
          Validators.required,
          Validators.minLength(6),
        ]),
      phone: new FormControl(null,
        [
          Validators.required,
          Validators.minLength(10),
        ]),
      // userType: new FormControl(null,
      //   [
      //     Validators.required,
      //     Validators.minLength(10),
      //   ]),
      // ...(this.selectedRole === USER_TYPE.DRIVER) ? {
      licence: new FormControl(null,
          []),
      car: new FormControl(null, []),
        // carModel: new FormControl(null,
        //   []),
        // carNumber: new FormControl(null,
        //   []),
        // carColor: new FormControl(null,
        //   []),
      //  } : {}
    });
  }

  openRegistrationForm(): void {
    this.isOpenRegisterForm = true;
  }

  openLoginForm(): void {
    this.isOpenRegisterForm = false;
  }

  chooseUserType(selectedOption: MatOptionSelectionChange): void {
    console.log(selectedOption.source.value);
    this.isRegisterDriver = selectedOption.source.value === 'Водитель';
    console.log(this.isRegisterDriver);
  }

  submitLogin(): void {
    this.isErrorLogin = false;
    console.log('sub');
    if (this.loginForm.invalid) {
      return;
    }
    this.disableBtn = true;

    const user: IUser = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.auth.login(user).subscribe( (resp: FbAuthResponse) => {
      this.loginForm.reset();
      this.disableBtn = false;
      this.router.navigate(['/order', resp.localId]);
    }, error => {
      this.disableBtn = false;
      this.isErrorLogin = true;
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      return;
    }

    let user: User;
    if (this.selectedRole === USER_TYPE.CLIENT) {
      user = new CCustomer({
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        phone: this.registerForm.value.phone,
        name: this.registerForm.value.name,
      });
    } else {
      user = new CDriver({
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        phone: this.registerForm.value.phone,
        name: this.registerForm.value.name,
        licence: this.registerForm.value.licence,
        car: this.registerForm.value.car,
        modered: false,
      });
    }

    this.auth.register(user)
      .pipe(take(1))
      .subscribe( resp => {
        console.log(resp);
        this.registerForm.reset();
        this.disableBtn = false;
        if (this.selectedRole === USER_TYPE.CLIENT) {
          this.router.navigate(['/order', resp.localId]);
        } else {
          this.router.navigate(['/driver', resp.localId]);
        }
      });
  }

  loginDriver(): void {
    this.isErrorLogin = false;
    console.log(';ogin');
    if (this.loginForm.invalid) {
      return;
    }
    this.disableBtn = true;

    const user: IUser = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.auth.loginDriver(user).subscribe( (fbUser: FbAuthResponse) => {
      console.log(fbUser);
      this.loginForm.reset();
      this.disableBtn = false;
      this.router.navigate(['/driver', fbUser.localId]);
    }, error => {
      this.disableBtn = false;
      this.isErrorLogin = true;
    });
  }
}
