import { VideoProgressApiData } from "./video-progress-api-data";

export interface ProfileApiData {
    id: string;
    profile_name: string;
    profile_picture: string | null;
    is_kid: boolean;
    preferred_language: string;
    video_progress: VideoProgressApiData[];
    watch_statistics: {
        total_videos_started: number;
        total_videos_completed: number;
        total_completions: number;
        total_watch_time: number;
        unique_videos_watched: number;
        completion_rate: number;
    };
}
