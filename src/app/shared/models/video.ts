export class Video {
    id: string;
    title: string;
    genres: string[];
    language: string;
    description: string;
    duration: number;
    thumbnail: string;
    preview: string;
    hls: string;
    ready: boolean;
    default: boolean;
    created: Date;
    updated: Date;

    constructor(data: any) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.genres = data.genres || [];
        this.language = data.language || '';
        this.description = data.description || '';
        this.duration = data.duration || 0;
        this.thumbnail = data.thumbnail_url || '';
        this.preview = data.preview_url || '';
        this.hls = data.hls_url || '';
        this.ready = data.is_ready || false;
        this.default = data.is_default || false;
        this.created = new Date(data.created_at) || new Date();
        this.updated = new Date(data.updated_at) || new Date();
    }

    get formattedDuration(): string {
        const hours = Math.floor(this.duration / 3600);
        const minutes = Math.floor((this.duration % 3600) / 60);
        const seconds = Math.floor(this.duration % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    get durationMs(): number {
        return Math.round(this.duration * 1000);
    }
}
