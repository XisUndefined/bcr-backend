import { ParamsDictionary } from "express-serve-static-core";

export enum Category {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export interface CarBody {
  plate: string;
  transmission: string;
  name: string;
  year: number;
  driver_service: boolean;
  rent_per_day: number;
  capacity: number;
  category: Category;
  description: string;
}

export interface CarIdParams {
  id: string;
}

export interface CarCategoryParams extends ParamsDictionary {
  category: Category;
}

export interface CarQuery {
  start_date: string;
  finish_date: string;
  driver_service: boolean;
  capacity?: number;
  sort?: string;
  page?: number;
  size?: number;
}
