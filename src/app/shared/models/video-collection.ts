import { Video } from "./video";
import { VideoCollectionData } from "../interfaces/video-collection-data";
import { VideoCollectionApiData } from "../interfaces/video-collection-api-data";

/**
 * Represents a collection of videos grouped by genre or key.
 */
export class VideoCollections {
    [key: string]: VideoCollectionData | any;

    /**
     * Create a VideoCollections instance from API or internal data.
     */
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

    /** Returns formatted genre name. */
    getName(): string {
        const genre = Object.keys(this).find(key => key !== 'constructor') || '';
        if (genre.includes('new')) {
            return genre.replace('new', 'Recently Added').replace(/_/g, ' ');
        } else {
            return (genre.charAt(0).toUpperCase() + genre.slice(1)).replace(/_/g, ' ');
        }
    }

    /** Returns first genre key or null. */
    getFirstGenreKey(): string | null {
        const keys = Object.keys(this).filter(key => key !== 'constructor');
        return keys.length > 0 ? keys[0] : null;
    }

    /** Returns genre data for a key or null. */
    getGenreData(key: string): VideoCollectionData | null {
        return this[key] || null;
    }

    /** Returns videos from the first genre. */
    getVideos(): Video[] {
        const firstKey = this.getFirstGenreKey();
        return firstKey ? this[firstKey].videos : [];
    }

    /** Returns an empty VideoCollections instance. */
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
