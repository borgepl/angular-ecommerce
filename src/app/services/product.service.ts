import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../common/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = "http://localhost:8082/api/products";

  //set size to 100 items - just for testing - Data Rest by default only retrieves 20 items
  //private baseUrl = "http://localhost:8082/api/products?size=100";


  constructor(private httpClient: HttpClient) { }

  getProductList(theCategoryId: number): Observable<Product[]> {

    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;

    return this.httpClient.get<GetRespone>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }
}

interface GetRespone {
  _embedded: {
    products: Product[];
  }
}

