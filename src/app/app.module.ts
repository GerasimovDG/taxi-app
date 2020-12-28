import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { OrderFormComponent } from './order-page/order-form.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AngularMaterialModule} from './angular-material.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AngularYandexMapsModule, YA_CONFIG, YaConfig} from 'angular8-yandex-maps';
import {AgmCoreModule} from '@agm/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {AngularFireModule} from '@angular/fire';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import { AdminLoginComponent } from './admin/components/admin-login/admin-login.component';
import { AdminMainPageComponent } from './admin/components/admin-main-page/admin-main-page.component';
import { DriverPageComponent } from './driver-page/driver-page.component';
import { DriverNearbyComponent } from './shared/components/driver-nearby/driver-nearby.component';
import {MatDialogModule} from '@angular/material/dialog';

const mapConfig: YaConfig = {
  apikey: '2ee203b8-7118-4aac-b249-8775b86c3564',
  lang: 'ru_RU',
};

const firebaseConfig = {
  apiKey: 'AIzaSyDsowi-N0_cLWIygqhsOFtgw2EnxL5IPp4',
  authDomain: 'taxiapp-95989.firebaseapp.com',
  databaseURL: 'https://taxiapp-95989-default-rtdb.firebaseio.com',
  projectId: 'taxiapp-95989',
  storageBucket: 'taxiapp-95989.appspot.com',
  messagingSenderId: '313234220946',
  appId: '1:313234220946:web:0e72797529a6d654f6034b',
  measurementId: 'G-3ELWCGQM5W'
};

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    MainPageComponent,
    MainLayoutComponent,
    OrderFormComponent,
    PageNotFoundComponent,
    AdminLoginComponent,
    AdminMainPageComponent,
    DriverPageComponent,
    DriverNearbyComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    AngularYandexMapsModule.forRoot(mapConfig),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDsowi-N0_cLWIygqhsOFtgw2EnxL5IPp4',
      libraries: ['places']
    }),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    MatDialogModule,
  ],
  providers: [
    {
      provide: YA_CONFIG,
      useValue: {
        apikey: '2ee203b8-7118-4aac-b249-8775b86c3564',
        lang: 'ru_RU',
      }
    }
  ],
  bootstrap: [AppComponent],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
