import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from "@angular/fire/auth";
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/switchMap';
import { User } from './models/user';

@Injectable()
export class AuthService {
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router) { }

  googleLogin() {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider)
      .then(async value => {

        let existingUser = false;
        if (value.user != null) {
          existingUser = await this.checkIfUserExists(value.user.uid);
        }

        if (!existingUser) {
          this.setUserData(value.user);
        }
        this.router.navigateByUrl('/homepage');
      })
      .catch(error => {
        console.log('Something went wrong: ', error);
      });
  }

  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  private oAuthLogin(provider: any) {
    return this.afAuth.signInWithPopup(provider);
  }

  setUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    }
    return userRef.set(userData, {
      merge: true
    })
  }

  async checkIfUserExists(uid: string): Promise<boolean> {
    const existingUser = await this.afs.doc(`users/${uid}`).get().toPromise();
    return existingUser.exists;
  }
}