import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './loginpage.component.html',
  styleUrls: ['./loginpage.component.css']
})

// Component for the Logn page of the app.
export class LoginpageComponent implements OnInit {
  constructor(private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    // On load of the login page, check if user is already logged in,
    // if yes, redirect the user to the home page of the app.
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['homepage']);
    }
  }

  // Function to trigger Google login for users.
  loginGoogle() {
    this.authService.googleLogin();
  }
}