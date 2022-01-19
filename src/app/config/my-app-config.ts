export default {

    oidc: {
        //clientId: '<<UPDATE-WITH-YOUR-APP-CLIENT-ID>>',
        //issuer: 'https://<<UPDATE-WITH-YOUR-DEV-DOMAIN>>/oauth2/default',
        clientId: '0oa3lf77axrYkDdvs5d7',
        issuer: 'https://dev-38652625.okta.com/oauth2/default',
        redirectUri: 'http://localhost:4200/login/callback',
        scopes: ['openid', 'profile', 'email']
    },
    widget: {
        useInteractionCodeFlow: `false`
    }
}