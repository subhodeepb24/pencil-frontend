import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';

import { AngularFireAuthModule } from "@angular/fire/auth";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginpageComponent } from './loginpage/loginpage.component';
import { AngularFireModule } from '@angular/fire';
import { HomepageComponent } from './homepage/homepage.component';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    LoginpageComponent,
    HomepageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    ColorPickerModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
