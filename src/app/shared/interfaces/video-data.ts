export interface VideoData {
    id: string;
    title: string;
    description: string;
    genres: string[];
    language: string;
    availableLanguages: string[];
    duration: number;
    thumbnail: string;
    preview: string;
    hls: string;
    ready: boolean;
    created: Date;
    updated: Date;
}
