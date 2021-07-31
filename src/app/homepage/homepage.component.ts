import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { fabric } from 'fabric';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';

const polling = require('light-async-polling');

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})

// Component for the Home page of the app.
export class HomepageComponent implements OnInit {
  protected _canvas?: fabric.Canvas;
  protected _clearCanvasJson = '';
  protected _isSignedOut = false;
  protected _drawingMode = true;

  public modeTitle = 'Drawing Mode';
  public brushColor = '#111111';
  public canvasLoaded = false;
  public imageUploaded = true;
  
  constructor(public authService: AuthService,
    public databaseService: DatabaseService,
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage) { }

  ngOnInit() {
    // On load of page, creating a new canvas.
    this._canvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#f2f2f2',
      isDrawingMode: true,
      selection: false,
      preserveObjectStacking: true
    });
    // Setting the canvas brush color.
    this._canvas.freeDrawingBrush.color = this.brushColor;
    // Storing the empty state JSON object for the canvas.
    this._clearCanvasJson = this._canvas.toJSON();

    // When user authentication state changes, i.e., user succesfully logs in.
    this.afAuth.onAuthStateChanged(async (user) => {
      if (user) {

        // Load the latest canvas data from database for the user.
        await this.databaseService.loadCanvasFromFirestore(this._canvas ?? null, user, () => {
          this.canvasLoaded = true;
          // Initial write to database of the canvas data.
          this.databaseService.storeCanvasDataInFirestore(this._canvas ?? null);

          // Using the polling library to store canvas data in database
          // every 5 seconds automatically.
          polling(async () => {
            this.databaseService.storeCanvasDataInFirestore(this._canvas ?? null);
            
            // Abort polling when the user signs out of the app.
            if (this._isSignedOut) {
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

  // Function to change brush color of canvas,
  // gets triggered by a button click on the app.
  async onColorChange(value: string) {
    this.brushColor = value;
    if (this._canvas != null) {
      this._canvas.freeDrawingBrush.color = this.brushColor;
    }
  }

  // Function to upload an image to the canvas and
  // upload the image to Firebase Storage for retrieval.
  imageUpload(event: any) {
    this.imageUploaded = false;
    // Retrieve logged in user.
    const user = this.authService.getUser();

    if (user != null) {
      // Construct the path of the file being uploaded.
      const currentDate = new Date();
      const filePath = `/${user.uid}/${currentDate.getTime().toString()}.png`;
      const fileRef = this.afStorage.ref(filePath);
      // Uploading the file to Firebase Storage in the designated user's bucket.
      const task = this.afStorage.upload(filePath, event.target.files[0]);

      task.snapshotChanges().pipe(
        finalize(() =>
          fileRef.getDownloadURL().subscribe(value => {
            // Get the url of the uploaded file and insert into canvas.
            this.insertImageToCanvas(value);
          })
        )
      ).subscribe();
    }
  }

  // Function to insert the uploaded image into the canvas.
  insertImageToCanvas(imageUrl: string) {
    fabric.Image.fromURL(imageUrl, (img) => {
      img.hasControls = true;
      img.hasBorders = true;
      this._canvas?.add(img);
      this.setEditMode();
    });
    this.imageUploaded = true;
  }

  // Function to toggle the 2 different modes
  // of interaction in the canvas.
  toggleModes() {
    if (this._drawingMode) {
      this.setEditMode();
    } else {
      this.setDrawingMode();
    }
  }

  // Set mode of interaction with canvas as 'Drawing' mode i.e.,
  // ability to use the brush to draw.
  setDrawingMode() {
    this.modeTitle = 'Drawing Mode';
    this._drawingMode = true;
    if (this._canvas != null) {
      this._canvas.isDrawingMode = this._drawingMode;
    }
  }

  // Set mode of interaction with canvas as 'Editing' mode i.e.,
  // ability to move and resize objects in the canvas.
  setEditMode() {
    this.modeTitle = 'Editing Mode';
    this._drawingMode = false;
    if (this._canvas != null) {
      this._canvas.isDrawingMode = this._drawingMode;
    }
  }

  // Function to clear the contents of the canvas
  // and update database of the latest empty state.
  clearCanvas() {
    if (this._canvas != null) {
      this._canvas.clear();
      this._canvas.loadFromJSON(this._clearCanvasJson, this._canvas.renderAll.bind(this._canvas));
      this.databaseService.storeCanvasDataInFirestore(this._canvas);
    }
  }

  // Function to sign/log out a user.
  signOut() {
    this._isSignedOut = true;
    this.authService.logout();
  }
}