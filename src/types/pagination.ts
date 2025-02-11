interface PaginationMeta {
    page: number;
    take: number;
    totalCount: number;
    totalPage: number;
}

interface Pagination<T> {
    data: T[];
    meta: PaginationMeta;
}

export type { Pagination, PaginationMeta };
