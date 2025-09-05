import { VideoData } from "../interfaces/video-data";
import { VideoApiData } from "../interfaces/video-api-data";

/**
 * Represents a video with metadata, formats, and conversion helpers.
 */
export class Video implements VideoData {
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

    /**
     * Creates a Video instance from API or internal data.
     * @param data Video data from API or internal format.
     */
    constructor(data: VideoApiData | VideoData) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.description = data.description || '';
        this.genres = data.genres || [];
        this.language = data.language || '';
        this.duration = data.duration || 0;

        if ('thumbnail_url' in data) {
            this.availableLanguages = data.available_languages || [];
            this.thumbnail = data.thumbnail_url || '';
            this.preview = data.preview_url || '';
            this.hls = data.hls_url || '';
            this.ready = data.is_ready || false;
            this.created = new Date(data.created_at) || new Date();
            this.updated = new Date(data.updated_at) || new Date();
        } else {
            this.availableLanguages = data.availableLanguages || [];
            this.thumbnail = data.thumbnail || '';
            this.preview = data.preview || '';
            this.hls = data.hls || '';
            this.ready = data.ready || false;
            this.created = data.created || new Date();
            this.updated = data.updated || new Date();
        }
    }

    /**
     * Returns the video duration formatted as HH:MM:SS or MM:SS.
     */
    get formattedDuration(): string {
        const hours = Math.floor(this.duration / 3600);
        const minutes = Math.floor((this.duration % 3600) / 60);
        const seconds = Math.floor(this.duration % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Returns the video duration in milliseconds.
     */
    get durationMs(): number {
        return Math.round(this.duration * 1000);
    }

    /**
     * Converts the instance to API format for backend communication.
     */
    toApiFormat(): VideoApiData {
        const formatDate = (date: Date) => {
            return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
        };
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            genres: this.genres,
            language: this.language,
            available_languages: this.availableLanguages,
            duration: this.duration,
            thumbnail_url: this.thumbnail,
            preview_url: this.preview,
            hls_url: this.hls,
            is_ready: this.ready,
            created_at: formatDate(this.created),
            updated_at: formatDate(this.updated)
        };
    }
}
