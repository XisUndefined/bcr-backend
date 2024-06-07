export enum Bank {
  BCA = "bca",
  BNI = "bni",
  MANDIRI = "mandiri",
}

export interface CreateOrderBody {
  car_id: string;
  bank: Bank;
  start_rent: string;
  finish_rent: string;
}

export interface OrderParams {
  orderId: string;
}

export interface UpdateOrderBody {
  status: string;
}
