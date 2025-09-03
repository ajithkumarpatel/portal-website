

import React, { useState, useEffect, useRef } from 'react';
import { db, firebase } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Chat, Message } from '../../types';
import Input from '../Input';
import Spinner from '../Spinner';

interface ChatWindowProps {
    chat: Chat;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat }) => {
    const { currentUser, userData } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const peerId = chat.participants.find(p => p !== currentUser?.uid);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        if (!chat.id || !currentUser) return;

        // Mark chat as read when window is opened
        const isUnread = chat.readBy && !chat.readBy[currentUser.uid] && chat.lastMessageSenderId !== currentUser.uid;
        if (isUnread) {
            const chatRef = db.collection('chats').doc(chat.id);
            chatRef.update({ [`readBy.${currentUser.uid}`]: true });
        }

        setLoading(true);
        const messagesQuery = db.collection('chats').doc(chat.id).collection('messages')
            .orderBy('timestamp');

        const unsubscribe = messagesQuery.onSnapshot((querySnapshot) => {
            const messagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(messagesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chat.id, currentUser, chat.readBy, chat.lastMessageSenderId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !currentUser || !userData || !peerId) return;

        const messageText = newMessage;
        setNewMessage('');

        // Add new message to subcollection
        const messagesColRef = db.collection('chats').doc(chat.id).collection('messages');
        await messagesColRef.add({
            senderId: currentUser.uid,
            text: messageText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        
        // Update last message on parent chat document
        const chatRef = db.collection('chats').doc(chat.id);
        await chatRef.update({
            lastMessage: messageText,
            lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessageSenderId: currentUser.uid,
            readBy: {
                [currentUser.uid]: true,
                [peerId]: false,
            }
        });
    };

    const peerName = peerId ? chat.participantNames[peerId] : 'User';

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-500/30">
                <h3 className="text-xl font-bold text-white text-center">{peerName}</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {loading ? <div className="flex-1 flex items-center justify-center"><Spinner /></div> : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                                msg.senderId === currentUser?.uid 
                                ? 'bg-highlight text-white rounded-br-none' 
                                : 'bg-secondary text-gray-200 rounded-bl-none'
                            }`}>
                                <p className="break-words">{msg.text}</p>
                            </div>
                        </div>
                    ))
                )}
                 <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-500/30 bg-secondary/50">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                    <Input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        autoComplete="off"
                    />
                    <button type="submit" className="bg-highlight text-white p-3 rounded-lg hover:bg-teal-400 disabled:opacity-50 flex-shrink-0" disabled={newMessage.trim() === ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;