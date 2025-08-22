import { Profile } from "../models/profile";

export interface UserData {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    profiles: Profile[];
}
