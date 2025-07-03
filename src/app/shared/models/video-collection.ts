import { Video } from "./video";
import { VideoCollectionData } from "../interfaces/video-collection-data";
import { VideoCollectionApiData } from "../interfaces/video-collection-api-data";

export class VideoCollections {
    [key: string]: VideoCollectionData;

    constructor(key: string, data: VideoCollectionApiData, params: string = '') {
        this[key] = {
            lastUpdated: new Date().toISOString(),
            videos: data.results.map((videoData: any) => new Video(videoData)),
            next: data.next || null,
            previous: data.previous || null,
            params: params
        };
    }
}
