import { VideoApiData } from "./video-api-data";

export interface VideoCollectionApiData {
    count: number;
    next: string | null;
    previous: string | null;
    results: VideoApiData[];
}
