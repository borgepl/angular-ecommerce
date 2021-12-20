import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  
 
  private baseUrl = "http://localhost:8082/api/products";
  private categoryUrl = "http://localhost:8082/api/product-category";

  //set size to 100 items - just for testing - Data Rest by default only retrieves 20 items
  //private baseUrl = "http://localhost:8082/api/products?size=100";


  constructor(private httpClient: HttpClient) { }

  getProduct(theProductId: number): Observable<Product> {
   
    const productUrl = `${this.baseUrl}/${theProductId}`;

    return this.httpClient.get<Product>(productUrl) ;
  }

  getProductListPaginate(thePage: number, thePageSize: number, theCategoryId: number): Observable<GetResponeProducts> {

    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}` 
                      + `&page=${thePage}&size=${thePageSize}`;

    console.log(searchUrl);

    return this.httpClient.get<GetResponeProducts>(searchUrl);
  }

  getProductList(theCategoryId: number): Observable<Product[]> {

    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;

    return this.getProducts(searchUrl);
  }

  getProductCategories(): Observable<ProductCategory[]> {

    return this.httpClient.get<GetResponeProductCategories>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  searchProducts(theKeyword: string): Observable<Product[]> {

    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;

    return this.getProducts(searchUrl);
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponeProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

}

interface GetResponeProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponeProductCategories {
  _embedded: {
    productCategory: ProductCategory[];
  }
}

