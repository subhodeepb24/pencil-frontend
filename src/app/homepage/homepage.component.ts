import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { fabric } from 'fabric';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../auth.service';
import { DatabaseService } from '../database.service';

const polling = require('light-async-polling');

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
  public signedOut = false;
  public selectedFile?: File;
  public drawingMode = true;
  public modeTitle = 'Drawing Mode';
  public canvasLoaded = false;
  public imageUploaded = true;

  constructor(public authService: AuthService,
    public databaseService: DatabaseService,
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage) { }

  ngOnInit() {
    this._canvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#f2f2f2',
      isDrawingMode: true,
      selection: false,
      preserveObjectStacking: true
    });
    this._canvas.freeDrawingBrush.color = this.color;
    this.clearCanvasJson = this._canvas.toJSON();

    this.afAuth.onAuthStateChanged(async (user) => {
      if (user) {

        await this.databaseService.loadCanvasFromFirestore(this._canvas ?? null, user, () => {
          this.canvasLoaded = true;
          this.databaseService.storeCanvasDataInFirestore(this._canvas ?? null);

          polling(async () => {
            this.databaseService.storeCanvasDataInFirestore(this._canvas ?? null);
            if (this.signedOut) {
              return true;
            } else {
              return false;
            }
          }, 5000);
        });

      } else {
        console.log('onAuthStateChanged user not logged in.');
      }
    });
  }

  async onColorChange(value: string) {
    this.color = value;
    if (this._canvas != null) {
      this._canvas.freeDrawingBrush.color = this.color;
    }
  }

  imageUpload(event: any) {
    this.imageUploaded = false;
    this.selectedFile = event.target.files[0];
    const user = this.authService.getUser();

    if (user != null) {
      const currentDate = new Date();
      const filePath = `/${user.uid}/${currentDate.getTime().toString()}.png`;
      const fileRef = this.afStorage.ref(filePath);
      const task = this.afStorage.upload(filePath, event.target.files[0]);

      task.snapshotChanges().pipe(
        finalize(() =>
          fileRef.getDownloadURL().subscribe(value => {
            this.insertImageToCanvas(value);
          })
        )
      ).subscribe();
    }
  }

  insertImageToCanvas(imageUrl: string) {
    fabric.Image.fromURL(imageUrl, (img) => {
      img.hasControls = true;
      img.hasBorders = true;
      this._canvas?.add(img);
      this.setEditMode();
    });
    this.imageUploaded = true;
  }

  toggleModes() {
    if (this.drawingMode) {
      this.setEditMode();
    } else {
      this.setDrawingMode();
    }
  }

  setDrawingMode() {
    this.modeTitle = 'Drawing Mode';
    this.drawingMode = true;
    if (this._canvas != null) {
      this._canvas.isDrawingMode = this.drawingMode;
    }
  }

  setEditMode() {
    this.modeTitle = 'Edit Mode';
    this.drawingMode = false;
    if (this._canvas != null) {
      this._canvas.isDrawingMode = this.drawingMode;
    }
  }

  clearCanvas() {
    if (this._canvas != null) {
      this._canvas.clear();
      this._canvas.loadFromJSON(this.clearCanvasJson, this._canvas.renderAll.bind(this._canvas));
      this.databaseService.storeCanvasDataInFirestore(this._canvas);
    }
  }

  signOut() {
    this.signedOut = true;
    this.authService.logout();
  }
}