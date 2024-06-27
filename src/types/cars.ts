import { Car } from "../models/Car.model.js";
import { Category } from "./enums.js";
import { PageQuery, Paging } from "./page.js";
import { BaseResponse } from "./response.js";

export interface CarReqBody {
  manufacture: string;
  model: string;
  transmission: string;
  plate: string;
  year: number;
  driver_service: boolean;
  rent_per_day: number;
  capacity: number;
  type: string;
  category: Category;
  options?: string;
  specs?: string;
  description: string;
}

export interface UpdateCarReqBody extends Partial<CarReqBody> {}

export interface CarIdParams {
  id: string;
}

export interface CarCategoryParams {
  category?: Category;
}

interface BaseCarSearchQuery extends PageQuery {
  start_date: string;
  finish_date: string;
  capacity?: number;
  sort?: string;
}

export interface ReqCarSearchQuery extends BaseCarSearchQuery {
  driver_service: boolean;
}

export interface CarSearchQuery extends BaseCarSearchQuery {
  driver_service: string;
}

export interface CarQuery extends PageQuery {
  sort?: string;
  q?: string;
}

export interface CarResBody extends BaseResponse {
  data: Car | Partial<Car>;
}

export interface CarsResBody extends BaseResponse {
  data: Car[] | Partial<Car>[];
  paging: Paging;
}
