export interface VideoProgressApiData {
    video_file_id: string;
    title: string;
    thumbnail_url: string;
    current_time: number;
    progress_percentage: number;
    duration: number;
    status: string;
    is_completed: boolean;
    is_started: boolean;
    completion_count: number;
    total_watch_time: number;
    first_watched: string | null;
    last_watched: string | null;
    last_completed: string | null;
}
