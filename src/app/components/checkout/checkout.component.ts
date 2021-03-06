import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { PaymentOrder } from 'src/app/common/payment-order';
import { PaymentResult } from 'src/app/common/payment-result';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { MyShopFormService } from 'src/app/services/my-shop-form.service';
import { MyShopValidators } from 'src/app/validators/my-shop-validators';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;

   // initialize Stripe API
   stripe = Stripe(environment.stripePublishableKey);

   paymentInfo: PaymentInfo = new PaymentInfo();
   cardElement: any;
   displayError: any = "";

   // Paument order for MultiSafePay
   paymentOrder: PaymentOrder = new PaymentOrder();
   
    /** The Window object from Document defaultView - for redurect to external Url */
    get window(): Window { return this.document.defaultView || window; }
  

   isDisabled: boolean = false;

  constructor(private formBuilder: FormBuilder, private myShopFormService: MyShopFormService,
              private cartService: CartService, private checkoutService: CheckoutService, private router: Router,
              @Inject(DOCUMENT) readonly document: Document) { }

  ngOnInit(): void {

     // setup Stripe payment form
     this.setupStripePaymentForm();

    this.reviewCartDetails();

    // read user's email from browsers storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl( '', [Validators.required, Validators.minLength(2), MyShopValidators.notOnlyWhitespace] ),
        lastName: new FormControl( '', [Validators.required, Validators.minLength(2), MyShopValidators.notOnlyWhitespace] ), 
        email: new FormControl( theEmail, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')] )
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), 
                                     MyShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), 
                                   MyShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), 
                                      MyShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), 
                                     MyShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), 
                                   MyShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), 
                                      MyShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        /*
        cardType: new FormControl('', [Validators.required]),
        nameOnCard:  new FormControl('', [Validators.required, Validators.minLength(2), 
                                          MyShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
        */
      })
    });

    /*
    // populate creditCard Months (0-based, so add 1)
    const startMonth: number = new Date().getMonth() + 1;
    console.log("StartMonth : " + startMonth);

    this.myShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Credit Card Months retrieved : " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // populate creditCard Years
    this.myShopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Credit Card Years retrieved : " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );
    */

    // populate countries

    this.myShopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );

  }
  setupStripePaymentForm() {
    
    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // Create a card element ... and hide the zip-code field
    this.cardElement = elements.create('card', { hidePostalCode: true });

    // Add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    // Add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event: { complete: any; error: { message: any; }; }) => {

      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        // show validation error to customer
        this.displayError.textContent = event.error.message;
      }

    });
  }

  reviewCartDetails() {
    
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

  }

  onSubmit() {

    console.log('On Submit ...');
    console.log("Handling the submit button");

    /* if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    } */
    
    console.log("The email address is " + this.checkoutFormGroup.get('customer')!.value.email);
    console.log(this.checkoutFormGroup.get('customer')?.value);

    console.log("The shipping address country is " + this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log("The shipping address state is " + this.checkoutFormGroup.get('shippingAddress')?.value.state.name);
  
     // set up order
     let order = new Order();
     order.totalPrice = this.totalPrice;
     order.totalQuantity = this.totalQuantity;
 
     // get cart items
     const cartItems = this.cartService.cartItems;
 
     // create orderItems from cartItems
     // - long way
     /*
     let orderItems: OrderItem[] = [];
     for (let i=0; i < cartItems.length; i++) {
       orderItems[i] = new OrderItem(cartItems[i]);
     }
     */
 
     // - short way of doing the same thingy
     let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));
 
     // set up purchase
     let purchase = new Purchase();
     
     // populate purchase - customer
     purchase.customer = this.checkoutFormGroup.controls['customer'].value;
     
     // populate purchase - shipping address
     purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
     const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
     const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
     purchase.shippingAddress.state = shippingState.name;
     purchase.shippingAddress.country = shippingCountry.name;
 
     // populate purchase - billing address
     purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
     const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
     const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
     purchase.billingAddress.state = billingState.name;
     purchase.billingAddress.country = billingCountry.name;
   
     // populate purchase - order and orderItems
     purchase.order = order;
     purchase.orderItems = orderItems;
 
     // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;

    console.log(`paymentInfo amount : ${this.paymentInfo.amount}`);
    console.log(`paymentInfo currency : ${this.paymentInfo.currency}`);
    console.log(`PaymentInfo receiptEmail : ${this.paymentInfo.receiptEmail}`);

    // compute payment order for MultiSafaPay
    
    // Order id is generated with UUID on the backend
    //this.paymentOrder.order_id = Math.random() + "-order-" + Math.random();
    this.paymentOrder.description = "MyShop Purchase";
    this.paymentOrder.amount = Math.round(this.totalPrice * 100);
    this.paymentOrder.currency = "USD";
    //this.paymentOrder.gateway = "MISTERCASH"; // default
    this.paymentOrder.receiptEmail = purchase.customer.email;
    this.paymentOrder.cust_firstName = purchase.customer.firstName;
    this.paymentOrder.cust_lastName = purchase.customer.lastName;
    this.paymentOrder.cust_address1 = purchase.billingAddress.street;
    this.paymentOrder.cust_zipCode = purchase.billingAddress.zipCode;
    this.paymentOrder.cust_city = purchase.billingAddress.city;
    this.paymentOrder.cust_country = this.billingAddressCountry?.value.countryCode;

    // if valid form then
    // - create payment intent
    // - confirm card payment
    // - place order

    /*
    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {

      this.isDisabled = true;

      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    postal_code: purchase.billingAddress.zipCode,
                    country: this.billingAddressCountry?.value.countryCode
                  }
                }
              }
            }, { handleActions: false })
            .then((result: any) => {
            if (result.error) {
              // inform the customer there was an error
              alert(`There was an error: ${result.error.message}`);
              this.isDisabled = false;
            } else {
              // call REST API via the CheckoutService
              this.checkoutService.placeOrder(purchase).subscribe({
                next: (response: { orderTrackingNumber: any; }) => {
                  Swal.fire('Thank you...',`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`,'success');

                  // reset cart
                  this.resetCart();
                  this.isDisabled = false;
                },
                error: (err: { message: any; }) => {
                  alert(`There was an error: ${err.message}`);
                  this.isDisabled = false;
                }
              })
            }            
          });
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    */

    this.checkoutService.createPaymentOrder(this.paymentOrder).subscribe({
      next: response => {
         
        alert(JSON.stringify(response));
        
        console.log(`Response Status : ${response.success} `);
        console.log(`Response Order id : ${response.order_id} `);
        console.log(`Response Payment url : ${response.payment_url}`);
        console.log(`Response QR : ${response.qr_url}`);
        let qr_url: string = response.qr_url;

        if (response.success) {

          // Place Order
          purchase.order_id = response.order_id;
          this.checkoutService.placeOrder(purchase).subscribe({
            next: response => {
              
              let order: String = response.orderTrackingNumber;
             
              // reset cart
              this.resetCart();

              // open QR url
              this.window.open(qr_url);
    
            },
            error: err => {
              alert(`There was an error: ${err.message}`);
            }
          }
        );
         
        
        }
          
      }
      })
    

     /*
     // call REST API via the CheckoutService
     this.checkoutService.placeOrder(purchase).subscribe({
         next: response => {
           Swal.fire('Thank you...',`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`,'success');
           // alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
 
           // reset cart
           this.resetCart();
 
         },
         error: err => {
           alert(`There was an error: ${err.message}`);
         }
       }
     );
     */

  }

  resetCart() {
     // reset cart data
     this.cartService.cartItems = [];
     this.cartService.totalPrice.next(0);
     this.cartService.totalQuantity.next(0);
     // clear storage
     this.cartService.persistCartItems();
     
     // reset the form
     this.checkoutFormGroup.reset();
 
     // navigate back to the products page
     //this.router.navigateByUrl("/products");
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName')!; }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }


  copyShippingAddressToBillingAddress(event: Event){
 
    const ischecked = (<HTMLInputElement>event.target).checked;
    if(ischecked){
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      // update the states list , taking the list of the selected shippingAddressStates
      this.billingAddressStates = this.shippingAddressStates;

    }else{
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number =  new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup!.value.expirationYear);

    // if currentYear equals to selectedYear , then start with current month

    let startMonth: number;
    if (currentYear === selectedYear) {
      startMonth =  new Date().getMonth() + 1;
    } 
    else {
      startMonth = 1;
    }
    this.myShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Credit Card Months retrieved : " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName)!;

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.myShopFormService.getStates(countryCode).subscribe(
      data => {

        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data; 
        }
        else {
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup.get('state')!.setValue(data[0]);
      }
    );

  }

}



