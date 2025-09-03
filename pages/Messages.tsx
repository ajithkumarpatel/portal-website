

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, firebase } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, Chat } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import ChatList from '../components/messaging/ChatList';
import ChatWindow from '../components/messaging/ChatWindow';
import NewChatModal from '../components/messaging/NewChatModal';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

const Messages: React.FC = () => {
    const { currentUser, userData } = useAuth();
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();

    const [chats, setChats] = useState<Chat[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch all users for starting new chats
    useEffect(() => {
        const fetchUsers = async () => {
            if (!currentUser) return;
            const usersQuery = db.collection('users').where('uid', '!=', currentUser.uid);
            const usersSnapshot = await usersQuery.get();
            const usersData = usersSnapshot.docs.map(doc => doc.data() as UserProfile);
            setAllUsers(usersData);
        };
        fetchUsers();
    }, [currentUser]);

    // Listen for user's chats in real-time
    useEffect(() => {
        if (!currentUser) return;
        setLoadingChats(true);
        const chatsQuery = db.collection('chats')
            .where('participants', 'array-contains', currentUser.uid)
            .orderBy('lastMessageTimestamp', 'desc');

        const unsubscribe = chatsQuery.onSnapshot((querySnapshot) => {
            const chatsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
            setChats(chatsData);
            setLoadingChats(false);
        }, (error) => {
            console.error("Error fetching chats: ", error);
            setLoadingChats(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleSelectChat = (selectedChatId: string) => {
        navigate(`/messages/${selectedChatId}`);
    };

    const handleStartChat = async (peerUser: UserProfile) => {
        if (!currentUser || !userData) return;

        // Check if chat already exists
        const existingChat = chats.find(chat => chat.participants.includes(peerUser.uid));
        if (existingChat) {
            navigate(`/messages/${existingChat.id}`);
            setIsModalOpen(false);
            return;
        }

        // Create new chat
        const newChatRef = db.collection('chats').doc();
        const newChat: Omit<Chat, 'id'> = {
            participants: [currentUser.uid, peerUser.uid],
            participantNames: {
                [currentUser.uid]: userData.name,
                [peerUser.uid]: peerUser.name,
            },
            participantRoles: {
                 [currentUser.uid]: userData.role,
                 [peerUser.uid]: peerUser.role,
            },
            lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
            readBy: {
                [currentUser.uid]: true,
                [peerUser.uid]: true,
            },
        };

        await newChatRef.set(newChat);
        navigate(`/messages/${newChatRef.id}`);
        setIsModalOpen(false);
    };

    const activeChat = chats.find(c => c.id === chatId);

    return (
        <DashboardLayout title="Messages">
            <div className="flex h-[calc(100vh-120px)] rounded-2xl border border-gray-500/30 bg-gray-800/30 backdrop-blur-md shadow-2xl overflow-hidden">
                <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-500/30 ${chatId ? 'hidden md:flex' : 'flex'} flex-col`}>
                    <div className="p-4 border-b border-gray-500/30">
                        <Button onClick={() => setIsModalOpen(true)}>New Chat</Button>
                    </div>
                    {loadingChats ? <div className="flex-1 flex items-center justify-center"><Spinner /></div> : <ChatList chats={chats} activeChatId={chatId} onSelectChat={handleSelectChat} />}
                </div>
                <div className={`w-full md:w-2/3 lg:w-3/4 ${chatId ? 'flex' : 'hidden md:flex'} flex-col`}>
                    {activeChat ? (
                        <ChatWindow chat={activeChat} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-center p-4">
                            <p>Select a chat to start messaging or create a new chat.</p>
                        </div>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <NewChatModal
                    allUsers={allUsers}
                    existingChats={chats}
                    onClose={() => setIsModalOpen(false)}
                    onStartChat={handleStartChat}
                />
            )}
        </DashboardLayout>
    );
};

export default Messages;