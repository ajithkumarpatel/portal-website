

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile, Chat, Role } from '../../types';
import Card from '../Card';
import Input from '../Input';

interface NewChatModalProps {
    allUsers: UserProfile[];
    existingChats: Chat[];
    onClose: () => void;
    onStartChat: (peerUser: UserProfile) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ allUsers, existingChats, onClose, onStartChat }) => {
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const usersAlreadyInChat = useMemo(() => {
        if (!currentUser) return new Set();
        const userIds = new Set<string>();
        existingChats.forEach(chat => {
            chat.participants.forEach(p => {
                if (p !== currentUser.uid) {
                    userIds.add(p);
                }
            });
        });
        return userIds;
    }, [existingChats, currentUser]);

    const availableUsers = allUsers
        .filter(user => !usersAlreadyInChat.has(user.uid))
        .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg flex flex-col h-[70vh]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-white">Start a New Chat</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                <Input
                    type="text"
                    placeholder="Search for a user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                />
                <div className="flex-1 overflow-y-auto">
                    {availableUsers.length > 0 ? (
                        <ul>
                            {availableUsers.map(user => (
                                <li key={user.uid}
                                    onClick={() => onStartChat(user)}
                                    className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg cursor-pointer">
                                    <div>
                                        <p className="font-semibold text-white">{user.name}</p>
                                        <p className="text-sm text-gray-400">{user.department}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        user.role === Role.Admin ? 'bg-red-500' :
                                        user.role === Role.Faculty ? 'bg-blue-500' : 'bg-green-500'
                                    }`}>{user.role}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-400 p-4">No users found.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default NewChatModal;