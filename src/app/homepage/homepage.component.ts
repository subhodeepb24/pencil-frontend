import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { fabric } from 'fabric';
import { Router } from '@angular/router';
import { CanvasData } from '../models/canvas_data';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})

export class HomepageComponent implements OnInit {
  protected _canvas?: fabric.Canvas;
  public color = '#111111';
  public savedJson = '';
  public clearCanvasJson = '';

  constructor(public authService: AuthService,
    private router: Router,
    private afs: AngularFirestore) { }

  ngOnInit() {
    this._canvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#f2f2f2',
      isDrawingMode: true,
      selection: false,
      preserveObjectStacking: true,
    });
    this._canvas.freeDrawingBrush.color = this.color;
    this.clearCanvasJson = this._canvas.toJSON();
    
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.loadCanvasFromFirestore();
      } else {
        this.router.navigateByUrl('/login');
      }
    });
  }

  async loadCanvasFromFirestore() {
    const user = firebase.auth().currentUser;

    if (user != null) {
      const existingCanvasDocuments = await this.retrieveExistingCanvasDocuments(user.uid);

      if (existingCanvasDocuments.size > 0) {
        const latestCanvasDocument = existingCanvasDocuments.docs[0];
        const canvasJsonData = latestCanvasDocument.get('data');
        if (this._canvas != null) {
          this._canvas.loadFromJSON(canvasJsonData, this.onJsonLoaded);
        }
      }
    }
  }

  onJsonLoaded() {
    console.log('JSON Loaded');
  }

  clearCanvas() {
    if (this._canvas != null) {
      this._canvas.clear();
      this._canvas.loadFromJSON(this.clearCanvasJson, this._canvas.renderAll.bind(this._canvas));
    }
  }

  async onColorChange(value: string) {
    this.color = value;
    if (this._canvas != null) {
      this._canvas.freeDrawingBrush.color = this.color;
      this.savedJson = this._canvas.toJSON();
      this._canvas.loadFromJSON(this.savedJson, this.onJsonLoaded);
    }
  }

  async storeCanvasDataInFirestore() {
    const user = firebase.auth().currentUser;

    if (user != null) {
      let canvasData: CanvasData;
      const existingCanvasDocuments = await this.retrieveExistingCanvasDocuments(user.uid);

      if (existingCanvasDocuments.size > 0) {
        canvasData = {
          last_modified_at: new Date(),
          data: JSON.stringify(this._canvas?.toJSON())
        };

        const latestCanvasDocument = existingCanvasDocuments.docs[0].ref;
        latestCanvasDocument.update(canvasData);
      } else {
        canvasData = {
          created_at: new Date(),
          last_modified_at: new Date(),
          data: JSON.stringify(this._canvas?.toJSON())
        };

        const userDoc: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
        const userRef = userDoc.ref;
        await userRef.collection('canvas_data').add(canvasData);
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

  signOut() {
    this.authService.logout();
  }
}