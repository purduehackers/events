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

export const EVENT_CATEGORIES = [
  "hack-night",
  "workshop",
  "show",
  "session",
  "call-out",
] as const;
export type KnownEventCategory = (typeof EVENT_CATEGORIES)[number];
export type EventCategory = KnownEventCategory | string;

export interface EventType {
    id: string;
    name: string;
    eventType: EventCategory;
    start: string;
    end: string;
    location_name: string;
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

// Academic semester: Spring (Jan–May), Summer (June–July), Fall (Aug–Dec) 
export type SemesterSeason = "spring" | "summer" | "fall";
export interface SemesterType {
  year: number;
  season: SemesterSeason;
}