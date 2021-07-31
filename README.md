# Pencil Frontend Task

## Codebase Overview

The project consists of following components:

### 1. Components:

    - app.component: This is the root component of the app
    - login.component: This is the component corresponding to the login/sign-in part of the app
    - homepage.component: This is the component corresponding to the page where user can use the canvas

### 2. Services:

    - auth.service: Service file containing all the authentication related functions
    - database.service: Service file containing all the database (Firestore) related functions

### 3. Guards:

    - auth.guard: Guard file preventing not logged in users to access internal pages (homepage) of the app.

### 4. Models:

    - user: Interface for the user data object
    - canvas_data: Interface for the canvas data object


## Points To Note

- The canvas data gets synced with the database every 5 seconds.
- When a user logs in, the canvas will get loaded with the data from the last session of the user.
- The user can toggle between 2 modes of interaction with the canvas, 'Drawing Mode' and 'Editing Mode':
    - In 'Drawing Mode', the user is able to write anything on the canvas using the canvas stroke.
    - In 'Editing Mode', the user should be able to move objects and uploaded images on the canvas.
- The user can change the stroke color of the canvas using the 'Choose Color' input section in the homepage. If user is in 'Editing Mode', it automatically gets toggled to 'Drawing Mode' to allow users to write on the canvas.
- The user can clear the canvas by clicking on the 'Clear Canvas' button in the homepage.
- The user can upload images on the canvas using the 'Upload Image' button in the homepage. If user is in 'Drawing Mode', it automatically gets toggled to 'Editing Mode' to allow users to resize and move the image.
- In 'Editing Mode', the user can select any object/image on the canvas and delete it using the 'Delete Selected Object' button in the homepage.
- The user can sign out of the app using the 'Sign Out' button in the homepage.