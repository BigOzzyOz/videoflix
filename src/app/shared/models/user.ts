import { ProfileApiData } from "../interfaces/profile-api-data";
import { ProfileData } from "../interfaces/profile-data";
import { UserApiData } from "../interfaces/user-api-data";
import { UserData } from "../interfaces/user-data";
import { Profile } from "./profile";

export class User {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    profiles: Profile[];


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

    getFullName(): string {
        return `${this.firstName} ${this.lastName}`.trim() || this.username;
    }

    getProfileById(profileId: string): Profile | null {
        return this.profiles.find(profile => profile.id === profileId) || null;
    }

    getDefaultProfile(): Profile | null {
        return this.profiles.length > 0 ? this.profiles[0] : null;
    }

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
