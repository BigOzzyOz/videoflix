import { ProfileData } from "../interfaces/profile-data";
import { ProfileApiData } from "../interfaces/profile-api-data";

export class Profile implements ProfileData {
    id: string;
    name: string;
    profilePic: string | null;
    kid: boolean;
    language: string;

    constructor(data: ProfileApiData | ProfileData) {
        this.id = data.id || '';

        if ('profile_name' in data) {
            this.name = data.profile_name || '';
            this.profilePic = data.profile_picture || null;
            this.kid = data.is_kid || false;
            this.language = data.preferred_language || 'en';
        } else {
            this.name = data.name || '';
            this.profilePic = data.profilePic || null;
            this.kid = data.kid || false;
            this.language = data.language || 'en';
        }
    }

    getDisplayName(): string {
        return this.name || `Profile ${this.id}`;
    }

    isChildProfile(): boolean {
        return this.kid;
    }

    getProfileImage(): string {
        return this.profilePic || '/assets/default-profile.png';
    }

    toApiFormat(): ProfileApiData {
        return {
            id: this.id,
            profile_name: this.name,
            profile_picture: this.profilePic,
            is_kid: this.kid,
            preferred_language: this.language
        };
    }
}
