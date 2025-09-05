import { Video } from "./video";
import { VideoCollectionData } from "../interfaces/video-collection-data";
import { VideoCollectionApiData } from "../interfaces/video-collection-api-data";

export class VideoCollections {
    [key: string]: VideoCollectionData | any;

    constructor(key: string, data: VideoCollectionApiData | VideoCollectionData, params: string = '') {
        if ('results' in data) {
            this[key] = {
                lastUpdated: new Date().toISOString(),
                videos: data.results.map((videoData: any) => new Video(videoData)),
                next: data.next || null,
                previous: data.previous || null,
                params: params
            };
        } else {
            this[key] = data;
        }
    }

    getName(): string {
        const genre = Object.keys(this).find(key => key !== 'constructor') || '';
        if (genre.includes('new')) {
            return genre.replace('new', 'Recently Added').replace(/_/g, ' ');
        } else {
            return (genre.charAt(0).toUpperCase() + genre.slice(1)).replace(/_/g, ' ');
        }
    }

    getFirstGenreKey(): string | null {
        const keys = Object.keys(this).filter(key => key !== 'constructor');
        return keys.length > 0 ? keys[0] : null;
    }

    getGenreData(key: string): VideoCollectionData | null {
        return this[key] || null;
    }

    getVideos(): Video[] {
        const firstKey = this.getFirstGenreKey();
        return firstKey ? this[firstKey].videos : [];
    }

    static empty(key: string, params: string, data: Video[] = []): VideoCollections {
        return new VideoCollections(key, {
            videos: data,
            lastUpdated: new Date().toISOString(),
            next: null,
            previous: null,
            params: params
        });
    }
}
