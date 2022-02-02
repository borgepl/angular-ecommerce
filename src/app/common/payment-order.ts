export class PaymentOrder {

    order_id!: string;
    description!: string;
    amount!: number;
    currency!: string;
    gateway: string = "MISTERCASH";
    receiptEmail!: string;
    cust_firstName!: string;
    cust_lastName!: string;
    cust_address1!: string;
    cust_zipCode!: string;
    cust_city!: string;
    cust_country!: string;

}
