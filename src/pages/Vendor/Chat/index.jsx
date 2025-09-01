import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDoc,
  doc
} from 'firebase/firestore';
import app from '../../../config/firebase';
import { useAppContext } from '../../../context/AppContext';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router';
import config from '../../../config/config';

const db = getFirestore(app);
const storage = getStorage(app);

const ChatLayout = () => {
    const { user } = useAppContext();
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    const navigate = useNavigate();

    // Fetch chats for the logged-in user
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'chats'), 
            orderBy('lastMessageAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatData = snapshot.docs
                .filter(doc => 
                    doc.data().participants.includes(user.id)
                )
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            
            setChats(chatData);
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch messages for current chat
    useEffect(() => {
        if (!currentChat || !user) return;

        const q = query(
            collection(db, `chats/${currentChat.id}/messages`),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messageData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setMessages(messageData);
        });

        return () => unsubscribe();
    }, [currentChat, user]);

    // File Upload Handler
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!currentChat || !user) return;

        try {
            // Upload file to Firebase Storage
            const storageRef = ref(storage, `chats/${currentChat.id}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            uploadTask.on('state_changed', 
                null, 
                (error) => {
                    console.error("Upload error:", error);
                }, 
                async () => {
                    // Get download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    // Save attachment reference to Firestore
                    const attachmentRef = await addDoc(
                        collection(db, `chats/${currentChat.id}/attachments`), 
                        {
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            url: downloadURL,
                            uploadedBy: user.id
                        }
                    );

                    setAttachments(prev => [...prev, {
                        id: attachmentRef.id,
                        url: downloadURL,
                        name: file.name
                    }]);
                }
            );
        } catch (error) {
            console.error("File upload error:", error);
        }
    };

    // Send Message Handler
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!currentChat || !user) return;
        if (!newMessage.trim() && !attachments.length) return;

        try {
            // Add message to Firestore
            const messageRef = await addDoc(
                collection(db, `chats/${currentChat.id}/messages`), 
                {
                    text: newMessage,
                    sender: user.id,
                    timestamp: serverTimestamp(),
                    attachments: attachments.map(att => ({
                        url: att.url,
                        name: att.name
                    }))
                }
            );

            // Update last message in chat document
            await addDoc(collection(db, 'chats'), {
                lastMessage: newMessage,
                lastMessageAt: serverTimestamp(),
                lastMessageSender: user.id
            });

            // Reset states
            setNewMessage('');
            setAttachments([]);
            setIsTyping(false);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Timestamp Formatter
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate(); 
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
            {!user ? (
                <button
                onClick={() => navigate(`${config.VITE_BASE_WEBSITE_URL}/signin`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                Sign In
                </button>
            ) : (
                <div className="flex items-center space-x-3">
                    {/* <img
                        src={user.photoURL || '/placeholder.png'}
                        alt=""
                        className="w-10 h-10 rounded-full"
                    /> */}
                    <span>{user.firstName}</span>
                </div>
            )}
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
                    src={chat.avatar || '/placeholder.png'}
                    alt=""
                    className="w-10 h-10 rounded-full"
                    />
                    <div>
                    <h3 className="font-medium">{chat.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage}
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
                {/* Chat Header */}
                {/* <div className="p-4 shadow">
                <div className="flex items-center space-x-3">
                    <img
                    src={currentChat.avatar || '/placeholder.png'}
                    alt=""
                    className="w-10 h-10 rounded-full"
                    />
                    <h2 className="font-semibold">{currentChat.name}</h2>
                    {isTyping && (
                    <span className="text-sm text-gray-500">Typing...</span>
                    )}
                </div>
                </div> */}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages?.map((message) => (
                        <div
                        key={message.id}
                        className={`flex flex-col gap-1 ${
                            message.sender === user?.id
                            ? 'items-end'
                            : 'items-start'
                        }`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                message.sender === user?.id
                                    ? 'bg-white'
                                    : 'bg-[#E1EDFF]'
                                }`}
                            >
                                <p>{message.text}</p>
                                {message.attachments?.map((attachment, index) => (
                                <div key={index} className="mt-2">
                                    {/* Handle different attachment types */}
                                    <img
                                    src={attachment.url}
                                    alt=""
                                    className="max-w-full rounded"
                                    />
                                </div>
                                ))}
                            </div>
                            <p className='text-xs'>
                                {formatTimestamp(message?.timestamp?.seconds)}
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
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                        }}
                        placeholder="Type your message..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
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