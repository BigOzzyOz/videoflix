import { ProfileApiData } from "./profile-api-data";

export interface UserApiData {
    id: string;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    profiles: ProfileApiData[];
}
