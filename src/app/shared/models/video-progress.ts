import { VideoProgressApiData } from '../interfaces/video-progress-api-data';
import { VideoProgressData } from '../interfaces/video-progress-data';

export class VideoProgress implements VideoProgressData {
    id: string;
    title: string;
    thumbnail: string;
    currentTime: number;
    progressPercentage: number;
    duration: number;
    status: string;
    completed: boolean;
    started: boolean;
    completionCount: number;
    totalWatchTime: number;
    firstWatched: string | null;
    lastWatched: string | null;
    lastCompleted: string | null;

    constructor(data: VideoProgressApiData | VideoProgressData) {
        this.title = data.title || '';
        this.duration = data.duration || 0;
        this.status = data.status || '';

        if ('video_file_id' in data) {
            this.id = data.video_file_id || '';
            this.thumbnail = data.thumbnail_url || '';
            this.currentTime = data.current_time || 0;
            this.progressPercentage = data.progress_percentage || 0;
            this.completed = data.is_completed || false;
            this.started = data.is_started || false;
            this.completionCount = data.completion_count || 0;
            this.totalWatchTime = data.total_watch_time || 0;
            this.firstWatched = data.first_watched || null;
            this.lastWatched = data.last_watched || null;
            this.lastCompleted = data.last_completed || null;
        } else {
            this.id = data.id || '';
            this.thumbnail = data.thumbnail || '';
            this.currentTime = data.currentTime || 0;
            this.progressPercentage = data.progressPercentage || 0;
            this.completed = data.completed || false;
            this.started = data.started || false;
            this.completionCount = data.completionCount || 0;
            this.totalWatchTime = data.totalWatchTime || 0;
            this.firstWatched = data.firstWatched || null;
            this.lastWatched = data.lastWatched || null;
            this.lastCompleted = data.lastCompleted || null;
        }
    }

    get formattedCurrentTime(): string {
        const hours = Math.floor(this.currentTime / 3600);
        const minutes = Math.floor((this.currentTime % 3600) / 60);
        const seconds = Math.floor(this.currentTime % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    get progressPercentageFormatted(): string {
        return `${this.progressPercentage.toFixed(2)}%`;
    }

    get isCompleted(): boolean {
        return this.completed;
    }

    get isStarted(): boolean {
        return this.started;
    }

    get isInProgress(): boolean {
        return this.started && !this.completed;
    }

    get isNotStarted(): boolean {
        return !this.started;
    }

    get isRecentlyWatched(): boolean {
        return this.lastWatched !== null;
    }

    get isFirstWatched(): boolean {
        return this.firstWatched !== null;
    }

    get isLastCompleted(): boolean {
        return this.lastCompleted !== null;
    }

    get formattedLastWatched(): string {
        return this.lastWatched ? new Date(this.lastWatched).toLocaleString() : 'Never';
    }

    get formattedFirstWatched(): string {
        return this.firstWatched ? new Date(this.firstWatched).toLocaleString() : 'Never';
    }

    get formattedLastCompleted(): string {
        return this.lastCompleted ? new Date(this.lastCompleted).toLocaleString() : 'Never';
    }

    get formattedCompletionCount(): string {
        return this.completionCount.toString();
    }

    get formattedTotalWatchTime(): string {
        const hours = Math.floor(this.totalWatchTime / 3600);
        const minutes = Math.floor((this.totalWatchTime % 3600) / 60);
        const seconds = Math.floor(this.totalWatchTime % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    get formattedThumbnail(): string {
        return this.thumbnail || '/assets/default-thumbnail.png';
    }



    get durationFormatted(): string {
        const hours = Math.floor(this.duration / 3600);
        const minutes = Math.floor((this.duration % 3600) / 60);
        const seconds = Math.floor(this.duration % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    toApiFormat(): VideoProgressApiData {
        return {
            video_file_id: this.id,
            title: this.title,
            thumbnail_url: this.thumbnail,
            current_time: this.currentTime,
            progress_percentage: this.progressPercentage,
            duration: this.duration,
            status: this.status,
            is_completed: this.completed,
            is_started: this.started,
            completion_count: this.completionCount,
            total_watch_time: this.totalWatchTime,
            first_watched: this.firstWatched,
            last_watched: this.lastWatched,
            last_completed: this.lastCompleted
        };
    }
}
