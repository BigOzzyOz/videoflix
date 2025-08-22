export interface VideoApiData {
    id: string;
    title: string;
    description: string;
    genres: string[];
    language: string;
    available_languages: string[];
    duration: number;
    thumbnail_url: string;
    preview_url: string;
    hls_url: string;
    is_ready: boolean;
    created_at: string;
    updated_at: string;
}
