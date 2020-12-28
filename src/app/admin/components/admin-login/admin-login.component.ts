import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {IUser} from '../../../shared/interfaces/user';
import {Router} from '@angular/router';
import {AdminService} from '../../services/admin.service';
import {FbAuthResponse} from '../../../shared/interfaces/common';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.less']
})
export class AdminLoginComponent implements OnInit {

  disableBtn = false;
  isErrorLogin = false;
  loginForm: FormGroup;

  constructor(private auth: AdminService,
              private router: Router) { }

  ngOnInit(): void {

    this.loginForm = new FormGroup({
      email: new FormControl( null, [Validators.required]),
      password: new FormControl(null, [
          Validators.required,
          Validators.minLength(6),
        ])
    });

    // this.auth.user$.subscribe( data => {
    //   console.log(data);
    // });

  }

  submitLogin(): void {
    this.isErrorLogin = false;
    if (this.loginForm.invalid) {
      return;
    }
    this.disableBtn = true;

    const user: IUser = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.auth.login(user).subscribe( (data: FbAuthResponse) => {
      console.log(data);
      console.log(this.auth.adminRef);
      this.loginForm.reset();
      this.disableBtn = false;
      this.router.navigate(['/admin', data.localId]);
    }, error => {
      this.disableBtn = false;
      this.isErrorLogin = true;
    });
  }
}
