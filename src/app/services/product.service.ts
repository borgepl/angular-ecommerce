import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../common/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = "http://localhost:8082/api/products";

  constructor(private httpClient: HttpClient) { }

  getProductList(): Observable<Product[]> {
    return this.httpClient.get<GetRespone>(this.baseUrl).pipe(
      map(response => response._embedded.products)
    );
  }
}

interface GetRespone {
  _embedded: {
    products: Product[];
  }
}

