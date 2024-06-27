export interface BaseResponse {
  status: string;
}

export interface ResponseNoData extends BaseResponse {
  message: string;
}
