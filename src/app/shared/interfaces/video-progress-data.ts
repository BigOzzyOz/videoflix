export interface VideoProgressData {
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
}
