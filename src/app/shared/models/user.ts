import { ProfileApiData } from "../interfaces/profile-api-data";
import { ProfileData } from "../interfaces/profile-data";
import { UserApiData } from "../interfaces/user-api-data";
import { UserData } from "../interfaces/user-data";
import { Profile } from "./profile";

/**
 * Represents a user with profiles and conversion helpers.
 */
export class User {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    profiles: Profile[];


    /**
     * Create a User from API or internal data.
     */
    constructor(data: UserApiData | UserData) {
        this.id = data['id'] || '';
        this.username = data['username'] || '';
        this.email = data['email'] || '';
        this.role = data['role'] || 'user';
        this.profiles = (data['profiles'] || []).map((profileData: ProfileApiData | ProfileData) => new Profile(profileData));

        if ('first_name' in data) {
            this.firstName = data['first_name'] || '';
            this.lastName = data['last_name'] || '';
        } else {
            this.firstName = data['firstName'] || '';
            this.lastName = data['lastName'] || '';
        }
    }

    /** Returns full name or username. */
    getFullName(): string {
        return `${this.firstName} ${this.lastName}`.trim() || this.username;
    }

    /** Returns profile by ID or null. */
    getProfileById(profileId: string): Profile | null {
        return this.profiles.find(profile => profile.id === profileId) || null;
    }

    /** Returns first profile or null. */
    getDefaultProfile(): Profile | null {
        return this.profiles.length > 0 ? this.profiles[0] : null;
    }

    /** Converts this user to API format. */
    toApiFormat(): UserApiData {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            role: this.role,
            first_name: this.firstName,
            last_name: this.lastName,
            profiles: this.profiles.map(profile => profile.toApiFormat())
        };
    }

    /** Returns an empty user. */
    static empty(): User {
        return new User({
            id: '',
            username: '',
            email: '',
            role: 'user',
            first_name: '',
            last_name: '',
            profiles: []
        });
    }
}
