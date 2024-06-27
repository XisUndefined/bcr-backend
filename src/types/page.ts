export interface PageQuery {
  page?: number;
  size?: number;
}

export interface Paging extends PageQuery {
  total_page: number;
}
