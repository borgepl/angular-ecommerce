import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MyShopFormService } from 'src/app/services/my-shop-form.service';

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

  constructor(private formBuilder: FormBuilder, private myShopFormService: MyShopFormService) { }

  ngOnInit(): void {

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

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

  }

  onSubmit() {

    console.log('On Submit ...');
    console.log("Handling the submit button");
    
    console.log("The email address is " + this.checkoutFormGroup.get('customer')!.value.email);
    console.log(this.checkoutFormGroup.get('customer')?.value);

  }

  copyShippingAddressToBillingAddress(event: Event){
 
    const ischecked = (<HTMLInputElement>event.target).checked;
    if(ischecked){
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
    }else{
      this.checkoutFormGroup.controls['billingAddress'].reset();
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
}
