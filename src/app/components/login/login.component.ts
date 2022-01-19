import { Component, Inject, OnInit } from '@angular/core';
import { OktaAuth, Tokens } from '@okta/okta-auth-js';
// @ts-ignore
import * as OktaSignIn from '@okta/okta-signin-widget';
import { OKTA_AUTH } from '@okta/okta-angular';

import myAppConfig from '../../config/my-app-config';

const DEFAULT_ORIGINAL_URI = window.location.origin;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  signIn: any;
  
  constructor(@Inject(OKTA_AUTH) public oktaAuth: OktaAuth) {
  
    this.signIn = new OktaSignIn({
      /**
       * Note: when using the Sign-In Widget for an OIDC flow, it still
       * needs to be configured with the base URL for your Okta Org. Here
       * we derive it from the given issuer for convenience.
       */
       logo: 'assets/images/logo.png',
       features: {
         registration: true
       },
       baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0],
       clientId: myAppConfig.oidc.clientId,
       redirectUri: myAppConfig.oidc.redirectUri,
       authParams: {
        pkce: true,
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes
      },
      i18n: {
        en: {
          'primaryauth.title': 'Sign in to MyShop',
        },
      },
      authClient: oktaAuth,
      useInteractionCodeFlow: myAppConfig.widget.useInteractionCodeFlow === 'true',
    });
  }
  
  ngOnInit(): void {

    this.signIn.remove();

    this.signIn.renderEl({
      el: '#okta-sign-in-widget'
    },
      (response: { status: string; }) => {
        if (response.status == 'SUCCESS') {
          this.oktaAuth.signInWithRedirect();
        }
      },
      (error: any) => {
        throw error;
      }
    );
  }

  ngOnDestroy() {
    this.signIn.remove();
  }

}
  

