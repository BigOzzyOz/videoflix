import { VideoProgressData } from "./video-progress-data";

export interface ProfileData {
    id: string;
    name: string;
    profilePic: string | null;
    kid: boolean;
    language: string;
    videoProgress: VideoProgressData[];
    watchStats: {
        totalVideosStarted: number;
        totalVideosCompleted: number;
        totalCompletions: number;
        totalWatchTime: number;
        uniqueVideosWatched: number;
        completionRate: number;
    };
}
