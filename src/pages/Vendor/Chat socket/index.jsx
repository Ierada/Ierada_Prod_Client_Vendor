import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import config from '../../../config/config';
import { useAppContext } from '../../../context/AppContext';
import { 
    getUserChats, 
    getChatMessages, 
    createChat, 
    getParticipants, 
    addParticipant 
} from '../../../services/api.chat';

const ChatLayout = () => {
    const { user } = useAppContext();
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [socket, setSocket] = useState(null);
    const [participants, setParticipants] = useState([]);

    const bottomMessageRef = useRef(null);
    const messageInputRef = useRef(null);

    useEffect(() => {
        const initializeChat = async () => {
            const userToken = Cookies.get(`${config.BRAND_NAME}userToken`);
            
            if (userToken) {
                try {
                    // Initialize Socket Connection
                    const newSocket = io(config.API_URL, {
                        auth: { token: userToken }
                    });

                    newSocket.on('connect', () => {
                        // Join user's personal room
                        newSocket.emit('join', user.id);
                    });

                    newSocket.on('newMessage', (message) => {
                        setMessages(prevMessages => [...prevMessages, message]);
                    });

                    setSocket(newSocket);

                    // Fetch user's chats
                    const userChats = await getUserChats(user.id);
                    console.log('Fetched Chats:', userChats);
                    setChats(userChats);

                    return () => newSocket.disconnect();
                } catch (error) {
                    console.error("Initialization error:", error);
                    Cookies.remove(`${config.BRAND_NAME}userToken`);
                }
            }
        };

        initializeChat();
    }, [user]);

    // Fetch messages when current chat changes
    useEffect(() => {
        const fetchChatData = async () => {
            if (!currentChat) return;

            try {
                // Fetch messages
                const chatMessages = await getChatMessages(user.id, currentChat.id);
                setMessages(chatMessages);

                // Fetch participants
                const chatParticipants = await getParticipants(currentChat.id);
                setParticipants(chatParticipants);
            } catch (error) {
                console.error("Error fetching chat data:", error);
            }
        };

        fetchChatData();
    }, [currentChat]);

    // Scroll to bottom when messages update
    useEffect(() => {
        bottomMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // File Upload Handler
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!currentChat) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadResponse = await axios.post(
                `${config.API_URL}/api/uploads`, 
                formData, 
                { 
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${Cookies.get(`${config.BRAND_NAME}userToken`)}`
                    } 
                }
            );

            const attachment = {
                url: uploadResponse.data.fileUrl,
                name: file.name
            };

            setAttachments(prev => [...prev, attachment]);
        } catch (error) {
            console.error("File upload error:", error);
        }
    };

    // Send Message Handler
    const sendMessage = (e) => {
        e.preventDefault();
        if (!currentChat || (!newMessage.trim() && !attachments.length)) return;

        // Prepare message data
        const messageData = {
            chatId: currentChat.id,
            senderId: user.id,
            text: newMessage,
            attachments: attachments.map(att => ({
                url: att.url,
                name: att.name
            }))
        };

        // Emit message via socket
        if (socket) {
            socket.emit('sendMessage', messageData);
        }

        // Reset input states
        setNewMessage('');
        setAttachments([]);
        messageInputRef.current?.focus();
    };

    // Create New Chat
    const createNewChat = async (otherUserId) => {
        try {
            const newChat = await createChat([user.id, otherUserId]);
            setCurrentChat(newChat);
        } catch (error) {
            console.error("Error creating chat:", error);
        }
    };

    // Add Participant to Current Chat
    const addParticipantToChat = async (userId) => {
        if (!currentChat) return;

        try {
            await addParticipant(currentChat.id, userId);
            const updatedParticipants = await getParticipants(currentChat.id);
            setParticipants(updatedParticipants);
        } catch (error) {
            console.error("Error adding participant:", error);
        }
    };

    // Timestamp Formatter
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="fixed bottom-5 top-22 right-10 left-72 flex max-h-screen gap-4">
            {/* Chat List Sidebar */}
            <div className="w-1/4 bg-[#F2F2F280] rounded-lg">
                <div className="p-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Chats</h2>
                    <div className="flex items-center space-x-3">
                        <span>{user.firstName}</span>
                    </div>
                </div>
                <div className="overflow-y-auto h-[calc(100vh-4rem)]">
                    {chats?.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setCurrentChat(chat)}
                            className={`p-4 cursor-pointer hover:bg-gray-100 ${
                                currentChat?.id === chat.id ? 'bg-gray-200' : ''
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <img
                                    src={chat.Users?.[0]?.avatar || '/placeholder.png'}
                                    alt=""
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <h3 className="font-medium">
                                        {chat.Users?.[0]?.first_name || 'Unknown'}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">
                                        {chat.last_message || 'No messages yet'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-3/4 flex flex-col rounded-lg bg-[#EEEEF6]">
                {currentChat ? (
                    <>
                        {/* Chat Header with Participants */}
                        <div className="p-4 border-b flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <h2 className="text-lg font-semibold">
                                    {currentChat?.Users?.[0]?.firstName || 'Chat'}
                                </h2>
                                <div className="flex space-x-1">
                                    {participants?.map(participant => (
                                        <span 
                                            key={participant.user.id} 
                                            className="text-sm text-gray-500"
                                        >
                                            {participant.user.firstName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages?.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex flex-col gap-1 ${
                                        message.senderId === user.id
                                            ? 'items-end'
                                            : 'items-start'
                                    }`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg p-3 ${
                                            message.senderId === user.id
                                                ? 'bg-white'
                                                : 'bg-[#E1EDFF]'
                                        }`}
                                    >
                                        <p>{message.text}</p>
                                        {message.attachments?.map((attachment, index) => (
                                            <div key={index} className="mt-2">
                                                <img
                                                    src={attachment.url}
                                                    alt={attachment.name}
                                                    className="max-w-full rounded"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className='text-xs'>
                                        {formatTimestamp(message.createdAt)}
                                    </p>
                                </div>
                            ))}
                            <div ref={bottomMessageRef} />
                        </div>

                        {/* Message Input */}
                        <div className="rounded-lg p-4 m-4 bg-white flex space-x-4">
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-gray-500 hover:text-blue-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656l-6.586 6.586a6 6 0 108.484 8.484L20.5 8.5l-4.328-4.328"
                                    />
                                </svg>
                            </label>
                            <input
                                ref={messageInputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage(e)}
                            />
                            <button
                                type="submit"
                                onClick={sendMessage}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Select a chat to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatLayout;