import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AngularFirestore } from '@angular/fire/firestore';

import { AngularFireAuthModule } from "@angular/fire/auth";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginpageComponent } from './loginpage/loginpage.component';
import { AngularFireModule } from '@angular/fire';
import { ProfileComponent } from './profile/profile.component';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    LoginpageComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
