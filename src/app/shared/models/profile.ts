import { ProfileData } from "../interfaces/profile-data";
import { ProfileApiData } from "../interfaces/profile-api-data";
import { VideoProgress } from "./video-progress";

/**
 * Represents a user profile with stats, progress, and conversion helpers.
 */
export class Profile implements ProfileData {
    id: string;
    name: string;
    profilePic: string | null;
    kid: boolean;
    language: string;
    videoProgress: VideoProgress[];
    watchStats: {
        totalVideosStarted: number;
        totalVideosCompleted: number;
        totalCompletions: number;
        totalWatchTime: number;
        uniqueVideosWatched: number;
        completionRate: number;
    };


    /**
     * Create a Profile from API or internal data.
     */
    constructor(data: ProfileApiData | ProfileData) {
        this.id = data.id || '';

        if ('profile_name' in data) {
            this.name = data.profile_name || '';
            this.profilePic = data.profile_picture_url || null;
            this.kid = data.is_kid || false;
            this.language = data.preferred_language || 'en';
            this.videoProgress = (data.video_progress || []).map(video => new VideoProgress(video));
            this.watchStats = {
                totalVideosStarted: data.watch_statistics?.total_videos_started || 0,
                totalVideosCompleted: data.watch_statistics?.total_videos_completed || 0,
                totalCompletions: data.watch_statistics?.total_completions || 0,
                totalWatchTime: data.watch_statistics?.total_watch_time || 0,
                uniqueVideosWatched: data.watch_statistics?.unique_videos_watched || 0,
                completionRate: data.watch_statistics?.completion_rate || 0,
            };
        } else {
            this.name = data.name || '';
            this.profilePic = data.profilePic || null;
            this.kid = data.kid || false;
            this.language = data.language || 'en';
            this.videoProgress = (data.videoProgress || []).map(video => new VideoProgress(video));
            this.watchStats = {
                totalVideosStarted: data.watchStats.totalVideosStarted || 0,
                totalVideosCompleted: data.watchStats.totalVideosCompleted || 0,
                totalCompletions: data.watchStats.totalCompletions || 0,
                totalWatchTime: data.watchStats.totalWatchTime || 0,
                uniqueVideosWatched: data.watchStats.uniqueVideosWatched || 0,
                completionRate: data.watchStats.completionRate || 0,
            };
        }
    }

    /** Returns display name or fallback. */
    getDisplayName(): string {
        return this.name || `Profile ${this.id}`;
    }

    /** True if this is a child profile. */
    isChildProfile(): boolean {
        return this.kid;
    }

    /** Returns profile image URL or default. */
    getProfileImage(): string {
        return this.profilePic || '/assets/default-profile.png';
    }

    /** Converts this profile to API format. */
    toApiFormat(): ProfileApiData {
        return {
            id: this.id,
            profile_name: this.name,
            profile_picture: this.profilePic,
            profile_picture_url: this.profilePic,
            is_kid: this.kid,
            preferred_language: this.language,
            video_progress: this.videoProgress.map(video => (video.toApiFormat())),
            watch_statistics: {
                total_videos_started: this.watchStats.totalVideosStarted,
                total_videos_completed: this.watchStats.totalVideosCompleted,
                total_completions: this.watchStats.totalCompletions,
                total_watch_time: this.watchStats.totalWatchTime,
                unique_videos_watched: this.watchStats.uniqueVideosWatched,
                completion_rate: this.watchStats.completionRate,
            },
        };
    }

    /** Returns an empty profile. */
    static empty(): Profile {
        return new Profile({
            id: '',
            name: '',
            profilePic: null,
            kid: false,
            language: 'en',
            videoProgress: [],
            watchStats: {
                totalVideosStarted: 0,
                totalVideosCompleted: 0,
                totalCompletions: 0,
                totalWatchTime: 0,
                uniqueVideosWatched: 0,
                completionRate: 0,
            },
        });
    }
}
