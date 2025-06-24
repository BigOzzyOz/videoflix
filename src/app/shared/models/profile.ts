export class Profile {
    id: string;
    profile_name: string;
    profile_picture: string | null;
    is_kid: boolean;
    preferred_language: string;

    constructor(data: { [key: string]: any }) {
        this.id = data['id'] || '';
        this.profile_name = data['profile_name'] || '';
        this.profile_picture = data['profile_picture'] || null;
        this.is_kid = data['is_kid'] || false;
        this.preferred_language = data['preferred_language'] || 'en';
    }
}
