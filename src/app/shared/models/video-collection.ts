import { Video } from "./video";

interface VideoCollectionData {
    lastUpdated: string;
    videos: Video[];
    next: string | null;
    previous: string | null;
    params: string;
}

export class VideoCollections {
    [key: string]: VideoCollectionData;

    constructor(key: string, data: any, params: string = '') {
        this[key] = {
            lastUpdated: new Date().toISOString(),
            videos: data.results.map((video: any) => new Video(video)),
            next: data.next || null,
            previous: data.previous || null,
            params: params
        };
    }
}
