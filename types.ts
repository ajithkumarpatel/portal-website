
export enum Role {
    Student = 'Student',
    Faculty = 'Faculty',
    Admin = 'Admin',
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    department: string;
    year?: string; // Optional for faculty/admin
    role: Role;
}

export interface AttendanceRecord {
    id: string;
    userId: string;
    userName?: string; // Denormalized for easier display
    date: string; // ISO string format
    status: 'Present' | 'Absent';
}

export interface ResultRecord {
    id: string;
    userId: string;
    userName?: string; // Denormalized
    subject: string;
    score: number;
    grade: string;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: any; // Firestore Timestamp
}

export interface Chat {
    id: string;
    participants: string[];
    participantNames: { [key: string]: string };
    participantRoles: { [key: string]: Role };
    lastMessage?: string;
    lastMessageTimestamp?: any; // Firestore Timestamp
    lastMessageSenderId?: string;
    readBy: { [key: string]: boolean };
}
