interface ImageType {
    url: string;
    alt?: string;
}

interface StatType {
    data: string;
    label: string;
}

export interface EventType {
    id: string;
    name: string;
    eventType: string;
    start: string;
    end: string;
    location: string;
    location_url: string;
    stats: StatType[];
    description: string;
    images: ImageType[];
    updatedAt: string;
    createdAt: string;
}

export interface PayloadResponse<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}