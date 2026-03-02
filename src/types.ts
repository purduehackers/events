// For rich text (payload description field)
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';

// Payload CMS returns image as embedded asset object
interface ImageAsset {
    id: number;
    alt?: string;
    updatedAt: string;
    createdAt: string;
    url: string;
    thumbnailURL: string | null;
    filename: string;
    mimeType: string;
    filesize: number;
    width: number;
    height: number;
}

interface ImageType {
    id: string;
    image: ImageAsset;
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
    description: SerializedEditorState;
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