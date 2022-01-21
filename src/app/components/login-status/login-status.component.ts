import { Component, Inject, OnInit } from '@angular/core';
import { OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { OKTA_AUTH } from '@okta/okta-angular';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  storage: Storage = sessionStorage;

  isAuthenticated: boolean = false;
  userFullName: string  = '';

  constructor(public authStateService: OktaAuthStateService,  @Inject(OKTA_AUTH) private oktaAuth : OktaAuth) { }

  ngOnInit() {

    this.authStateService.authState$.subscribe(
      (result) => {
        this.isAuthenticated = result.isAuthenticated!;
        console.log(`Àuthentication State : ${this.isAuthenticated}`);
        this.getUserDetails();
      }
    );
    
  }

  getUserDetails() {

    if (this.isAuthenticated){

      this.oktaAuth.getUser().then(
        (res) =>{
          this.userFullName = res.name!;

          // get user's email
          const theEmail = res.email;
          // now store the email in the browsers session storage
          this.storage.setItem("userEmail", JSON.stringify(theEmail));
        }
      )
    }
  }


  logout() {

    // Terminates the session with Okta and removes current tokens.
    this.oktaAuth.signOut();
  }

}
