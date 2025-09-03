
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Chat } from '../../types';

interface ChatListProps {
    chats: Chat[];
    activeChatId?: string;
    onSelectChat: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, activeChatId, onSelectChat }) => {
    const { currentUser } = useAuth();

    if (!currentUser) return null;

    const getPeerUserName = (chat: Chat) => {
        const peerId = chat.participants.find(p => p !== currentUser.uid);
        return peerId ? chat.participantNames[peerId] : 'Unknown User';
    };
    
    const timeSince = (date: any) => {
        if (!date || !date.toDate) return '';
        const seconds = Math.floor((new Date().getTime() - date.toDate().getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    return (
        <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
                 <p className="text-center text-gray-400 p-4">No chats yet. Start a new one!</p>
            ) : (
                <ul>
                    {chats.map(chat => {
                        const isUnread = !chat.readBy[currentUser.uid] && chat.lastMessageSenderId !== currentUser.uid;
                        return (
                            <li key={chat.id} onClick={() => onSelectChat(chat.id)}
                                className={`flex items-center p-4 cursor-pointer transition-colors border-b border-gray-700 ${activeChatId === chat.id ? 'bg-highlight/30' : 'hover:bg-accent/50'}`}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className={`text-lg font-semibold truncate ${isUnread ? 'text-white' : 'text-gray-300'}`}>{getPeerUserName(chat)}</p>
                                        <p className="text-xs text-gray-400">{timeSince(chat.lastMessageTimestamp)}</p>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <p className={`text-sm truncate ${isUnread ? 'text-highlight' : 'text-gray-400'}`}>{chat.lastMessage || '...'}</p>
                                        {isUnread && <span className="w-3 h-3 bg-highlight rounded-full flex-shrink-0 ml-2 mt-1"></span>}
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    );
};

export default ChatList;
