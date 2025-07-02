export class Profile {
    id: string;
    name: string;
    profilePic: string | null;
    kid: boolean;
    language: string;

    constructor(data: { [key: string]: any }) {
        this.id = data['id'] || '';
        this.name = data['profile_name'] || data['name'] || '';
        this.profilePic = data['profile_picture'] || data['profilePic'] || null;
        this.kid = data['is_kid'] || data['kid'] || false;
        this.language = data['preferred_language'] || data['language'] || 'en';
    }
}
