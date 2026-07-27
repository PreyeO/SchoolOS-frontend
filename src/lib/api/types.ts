// Shape of every DRF ListModelMixin response under accounts.pagination.CustomPagination.
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
