import { Component, OnInit } from '@angular/core';
import {IUser} from '../shared/interfaces/user';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {DataHandlerService} from '../services/data-handler.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.less']
})
export class MainLayoutComponent implements OnInit {

  isOpenDropdown = false;
  user: IUser;
  userRef: any;

  constructor(private auth: AuthService,
              private data: DataHandlerService,
              private router: Router) { }

  ngOnInit(): void {
    this.auth.user$.subscribe( user => {
      console.log(user);
      this.userRef = this.data.getUserById(user.id).valueChanges().subscribe( data => {
        console.log(data);
      });
    });
    console.log(this.userRef);
  }

  logout(event): void {
    console.log('logout');
    event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/signin']);
  }
}
