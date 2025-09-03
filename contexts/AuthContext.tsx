import React, { useContext, useState, useEffect, createContext } from 'react';
import firebase from 'firebase/compat/app';
import { auth, db } from '../services/firebase';
import { UserProfile } from '../types';

// Fix: Use firebase.User type as User is not exported from 'firebase/auth' in v8
type User = firebase.User;

interface AuthContextType {
    currentUser: User | null;
    userData: UserProfile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    userData: null,
    loading: true,
});

export const useAuth = () => {
    return useContext(AuthContext);
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fix: Use v8 onAuthStateChanged method
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setCurrentUser(user);
            if (user) {
                // Fix: Use v8 firestore syntax
                const userDocRef = db.collection('users').doc(user.uid);
                const userDocSnap = await userDocRef.get();
                if (userDocSnap.exists) {
                    setUserData(userDocSnap.data() as UserProfile);
                } else {
                    console.error("User data not found in Firestore.");
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        userData,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};