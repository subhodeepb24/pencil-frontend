import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import 'rxjs/add/operator/switchMap';

import { User } from '../models/user';

@Injectable()
export class AuthService {
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router) {

    // Storing the logged in user details in 'localStorage'.
    this.afAuth.authState.subscribe(user => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        JSON.parse(localStorage.getItem('user') ?? '{}');
      } else {
        localStorage.setItem('user', '{}');
        JSON.parse(localStorage.getItem('user') ?? '{}');
      }
    });
  }

  // Function to trigger Google login for user.
  async googleLogin() {

    // Setting authorization persistence setting.
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider)
      .then(async value => {

        let existingUser = false;
        if (value.user != null) {
          // Check if logging in user already exists in database.
          existingUser = await this.checkIfUserExistsInDatabase(value.user.uid);
        }

        // If logging in user doesn't exist in database,
        // create a new user record.
        if (!existingUser) {
          this.setUserDataInDatabase(value.user);
        }
        // Navigate the user to the homepage of the app.
        this.router.navigateByUrl('/homepage');
      })
      .catch(error => {
        console.log('Something went wrong: ', error);
      });
  }

  private oAuthLogin(provider: any) {
    return this.afAuth.signInWithPopup(provider);
  }

  // Helper function to retrieve the current logged in user.
  getUser(): firebase.User | null {
    return firebase.auth().currentUser ?? null;
  }

  // Helper function to check if a user is logged in
  // by checking the 'localStorage'.
  isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    return (user.emailVerified != null) ? true : false;
  }

  // Helper function to create a new user record in database.
  setUserDataInDatabase(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      created_at: new Date()
    };
    return userRef.set(userData, {
      merge: true
    });
  }

  // Helper function to check if a user exists in database.
  async checkIfUserExistsInDatabase(uid: string): Promise<boolean> {
    const existingUser = await this.afs.doc(`users/${uid}`).get().toPromise();
    return existingUser.exists;
  }

  // Function to log out a user.
  logout() {
    this.afAuth.signOut().then(() => {
      // Clear out the user details from 'localStorage'.
      localStorage.removeItem('user');
      // Navigate to the login page of the app.
      this.router.navigate(['/']);
    });
  }
}