import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from "@angular/fire/auth";
import firebase from 'firebase/app';
import 'rxjs/add/operator/switchMap';
import { User } from './models/user';

@Injectable()
export class AuthService {
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router) {

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

  async googleLogin() {
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider)
      .then(async value => {

        let existingUser = false;
        if (value.user != null) {
          existingUser = await this.checkIfUserExistsInDatabase(value.user.uid);
        }

        if (!existingUser) {
          this.setUserDataInDatabase(value.user);
        }
        this.router.navigateByUrl('/homepage');
      })
      .catch(error => {
        console.log('Something went wrong: ', error);
      });
  }

  private oAuthLogin(provider: any) {
    return this.afAuth.signInWithPopup(provider);
  }

  getUser(): firebase.User | null {
    return firebase.auth().currentUser ?? null;
  }

  isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    return (user.emailVerified != null) ? true : false;
  }

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

  async checkIfUserExistsInDatabase(uid: string): Promise<boolean> {
    const existingUser = await this.afs.doc(`users/${uid}`).get().toPromise();
    return existingUser.exists;
  }

  logout() {
    this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['/']);
    });
  }
}