import { Profile } from "./profile";

export class User {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    profiles: Profile[];


    constructor(data: { [key: string]: any }) {
        this.id = data['id'] || '';
        this.username = data['username'] || '';
        this.email = data['email'] || '';
        this.role = data['role'] || 'user';
        this.firstName = data['first_name'] || '';
        this.lastName = data['last_name'] || '';
        this.profiles = (data['profiles'] || []).map((profileData: any) => new Profile(profileData));
    }
}
