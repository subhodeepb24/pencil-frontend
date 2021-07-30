import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { fabric } from 'fabric';
import firebase from 'firebase/app';
import 'rxjs/add/operator/switchMap';

import { CanvasData } from './models/canvas_data';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor(
    private afs: AngularFirestore,
    private router: Router
  ) { }

  async loadCanvasFromFirestore(canvas: fabric.Canvas | null, user: firebase.User, callback: Function) {
    if (user != null) {
      const existingCanvasDocuments = await this.retrieveExistingCanvasDocuments(user.uid);

      if (existingCanvasDocuments.size > 0) {
        const latestCanvasDocument = existingCanvasDocuments.docs[0];
        const canvasJsonData = latestCanvasDocument.get('data');
        
        if (canvas != null) {
          canvas.loadFromJSON(canvasJsonData, () => {
            callback();
          });
        }
      } else {
        callback();
      }
    }
  }

  async storeCanvasDataInFirestore(canvas: fabric.Canvas | null) {
    const user = firebase.auth().currentUser;

    if (user != null) {
      let canvasData: CanvasData;
      const existingCanvasDocuments = await this.retrieveExistingCanvasDocuments(user.uid);

      if (existingCanvasDocuments.size > 0 && canvas != null) {
        canvasData = {
          last_modified_at: new Date(),
          data: JSON.stringify(canvas.toJSON())
        };

        const latestCanvasDocument = existingCanvasDocuments.docs[0].ref;
        latestCanvasDocument.update(canvasData);

      } else {

        if (canvas != null) {
          canvasData = {
            created_at: new Date(),
            last_modified_at: new Date(),
            data: JSON.stringify(canvas.toJSON())
          };

          const userDoc: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
          const userRef = userDoc.ref;
          await userRef.collection('canvas_data').add(canvasData);
        }
      }
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  async retrieveExistingCanvasDocuments(uid: string): Promise<firebase.firestore.QuerySnapshot> {
    const userDoc: AngularFirestoreDocument<any> = this.afs.doc(`users/${uid}`);
    const userRef = userDoc.ref;
    return userRef.collection('canvas_data')
      .orderBy("last_modified_at", "desc").get();
  }
}
