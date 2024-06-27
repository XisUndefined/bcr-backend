import { Order } from "../models/Order.model.js";
import { Bank } from "./enums.js";
import { PageQuery, Paging } from "./page.js";
import { BaseResponse } from "./response.js";

export interface CreateOrderReqBody {
  car_id: string;
  bank: Bank;
  start_rent: string;
  finish_rent: string;
}

export interface OrderParams {
  orderId: string;
}

export interface UpdateOrderReqBody {
  status: string;
}

export interface OrderQuery extends PageQuery {
  sort?: string;
  q?: string;
}

export interface OrderResBody extends BaseResponse {
  data: Order | Order[];
  paging?: Paging;
}

// export interface OrdersResBody extends BaseResponse {
//   data: OrderData[];
//   paging: Paging;
// }
