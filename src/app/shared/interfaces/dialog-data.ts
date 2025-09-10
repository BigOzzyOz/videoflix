import { Profile } from "../models/profile";

export interface DialogData {
    profiles?: Profile[];
    mode?: 'select' | 'create' | 'edit';
    profileToEdit?: Profile;
}