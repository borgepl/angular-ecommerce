import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from '../common/payment-info';
import { PaymentOrder } from '../common/payment-order';
import { PaymentResult } from '../common/payment-result';
import { Purchase } from '../common/purchase';
import { PurchaseResponse } from '../common/purchase-response';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private purchaseUrl = environment.myshopApiUrl + '/checkout/purchase';
  private paymentIntentUrl = environment.myshopApiUrl + '/checkout/payment-intent';
  private paymentOrderUrl = environment.myshopApiUrl + '/checkout/payment-order';
  private trackingOrderUrl = environment.myshopApiUrl + '/checkout/uuid';

  constructor(private httpClient: HttpClient) { }

  placeOrder(purchase: Purchase): Observable<any> {
    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);    
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    return this.httpClient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo);
  }

  createPaymentOrder(paymentOrder: PaymentOrder): Observable<any> {
    return this.httpClient.post<PaymentOrder>(this.paymentOrderUrl, paymentOrder);
  }

  getOrderTrachingNumber() : Observable<PurchaseResponse> {
    return this.httpClient.get<PurchaseResponse>(this.trackingOrderUrl);
  }
}

