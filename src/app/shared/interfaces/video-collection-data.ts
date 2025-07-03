import { Video } from "../models/video";

export interface VideoCollectionData {
    lastUpdated: string;
    videos: Video[];
    next: string | null;
    previous: string | null;
    params: string;
}
