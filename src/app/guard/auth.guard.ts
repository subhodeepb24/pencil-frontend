import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: 'root'
})

// AuthGuard definition for the app.
export class AuthGuard implements CanActivate {
  constructor(
    public authService: AuthService,
    public router: Router
  ) { }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    // AuthGuard prevents users who are not logged in
    // to access internal page of the app and redirects
    // them to the login page using a function 'isLoggedIn()'
    // defined in the 'auth.service.ts' file.
    if (this.authService.isLoggedIn() !== true) {
      this.router.navigate(['login']);
    }
    return true;
  }
}