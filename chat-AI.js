/*
1. Backend - Add Message Handling (server.js)
Add these event handlers inside your io.on("connection"):

javascript
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId, "Socket ID:", socket.id);

    if (!userId) {
        console.log("No userId provided");
        return;
    }

    userSocketMap[userId] = socket.id;
    console.log("Online users:", Object.keys(userSocketMap));
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // ✅ Message event handlers
    socket.on("sendMessage", async (messageData) => {
        try {
            console.log("Message received:", messageData);
            
            // Save message to database (you'll need to implement this)
            // const savedMessage = await saveMessageToDB(messageData);
            
            // Emit to sender (for confirmation)
            socket.emit("messageSent", {
                success: true,
                message: messageData,
                timestamp: new Date()
            });

            // Emit to recipient if online
            const recipientSocketId = userSocketMap[messageData.receiverId];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("receiveMessage", {
                    ...messageData,
                    timestamp: new Date()
                });
                console.log("Message delivered to online user:", messageData.receiverId);
            } else {
                console.log("Recipient is offline:", messageData.receiverId);
                // You can store for later delivery when they come online
            }

        } catch (error) {
            console.error("Error handling message:", error);
            socket.emit("messageError", {
                error: "Failed to send message",
                originalMessage: messageData
            });
        }
    });

    // ✅ Typing indicators
    socket.on("typingStart", (data) => {
        const recipientSocketId = userSocketMap[data.receiverId];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("userTyping", {
                senderId: userId,
                isTyping: true
            });
        }
    });

    socket.on("typingStop", (data) => {
        const recipientSocketId = userSocketMap[data.receiverId];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("userTyping", {
                senderId: userId,
                isTyping: false
            });
        }
    });

    // ✅ Message read receipts
    socket.on("markMessagesRead", (data) => {
        const senderSocketId = userSocketMap[data.senderId];
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesRead", {
                readerId: userId,
                messageIds: data.messageIds
            });
        }
    });

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});


2. Frontend - Message Context (create MessageContext.jsx)
javascript
import { createContext, useState, useContext, useRef } from "react";
import { AuthContext } from "./AuthContext";

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const { socket } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});

    // ✅ Send message
    const sendMessage = (messageData) => {
        if (!socket || !socket.connected) {
            console.error("Socket not connected");
            return false;
        }

        const messageWithId = {
            ...messageData,
            tempId: Date.now(), // Temporary ID for immediate UI update
            timestamp: new Date()
        };

        // Optimistically add to messages
        setMessages(prev => [...prev, messageWithId]);

        // Emit via socket
        socket.emit("sendMessage", messageData);

        return true;
    };

    // ✅ Start typing indicator
    const startTyping = (receiverId) => {
        if (socket && socket.connected) {
            socket.emit("typingStart", { receiverId });
        }
    };

    // ✅ Stop typing indicator
    const stopTyping = (receiverId) => {
        if (socket && socket.connected) {
            socket.emit("typingStop", { receiverId });
        }
    };

    // ✅ Mark messages as read
    const markMessagesAsRead = (senderId, messageIds) => {
        if (socket && socket.connected) {
            socket.emit("markMessagesRead", { senderId, messageIds });
        }
        // Update local state
        setMessages(prev => prev.map(msg => 
            messageIds.includes(msg._id) ? { ...msg, read: true } : msg
        ));
    };

    // ✅ Setup socket listeners
    const setupMessageListeners = () => {
        if (!socket) return;

        // Listen for incoming messages
        socket.on("receiveMessage", (newMessage) => {
            console.log("New message received:", newMessage);
            setMessages(prev => [...prev, newMessage]);
            
            // Show notification (you can use toast or browser notification)
            if (!document.hasFocus()) {
                new Notification("New message", {
                    body: newMessage.text,
                    icon: "/favicon.ico"
                });
            }
        });

        // Message sent confirmation
        socket.on("messageSent", (data) => {
            console.log("Message sent successfully:", data);
            // Replace temporary message with server message
            setMessages(prev => prev.map(msg => 
                msg.tempId === data.message.tempId ? data.message : msg
            ));
        });

        // Typing indicators
        socket.on("userTyping", (data) => {
            setTypingUsers(prev => ({
                ...prev,
                [data.senderId]: data.isTyping
            }));
        });

        // Read receipts
        socket.on("messagesRead", (data) => {
            console.log("Messages read by:", data.readerId);
            setMessages(prev => prev.map(msg => 
                data.messageIds.includes(msg._id) ? { ...msg, read: true } : msg
            ));
        });

        // Message errors
        socket.on("messageError", (error) => {
            console.error("Message error:", error);
            // Remove optimistic message or mark as failed
            setMessages(prev => prev.filter(msg => 
                msg.tempId !== error.originalMessage.tempId
            ));
        });
    };

    // Cleanup listeners
    const cleanupMessageListeners = () => {
        if (socket) {
            socket.off("receiveMessage");
            socket.off("messageSent");
            socket.off("userTyping");
            socket.off("messagesRead");
            socket.off("messageError");
        }
    };

    const value = {
        messages,
        setMessages,
        conversations,
        setConversations,
        typingUsers,
        unreadCounts,
        sendMessage,
        startTyping,
        stopTyping,
        markMessagesAsRead,
        setupMessageListeners,
        cleanupMessageListeners
    };

    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );
};
3. Update AuthContext to include MessageProvider
javascript
import { MessageProvider } from "./MessageContext";

export const AuthProvider = ({ children }) => {
    // ... your existing code ...

    return (
        <AuthContext.Provider value={value}>
            <MessageProvider>
                {children}
            </MessageProvider>
        </AuthContext.Provider>
    );
};
4. Usage in Components (ChatComponent.jsx example)
javascript
import { useContext, useState, useEffect, useRef } from "react";
import { MessageContext } from "./MessageContext";
import { AuthContext } from "./AuthContext";

const ChatComponent = ({ receiverId }) => {
    const { authUser } = useContext(AuthContext);
    const { 
        messages, 
        sendMessage, 
        startTyping, 
        stopTyping, 
        typingUsers,
        setupMessageListeners 
    } = useContext(MessageContext);
    
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef();

    useEffect(() => {
        setupMessageListeners();
    }, []);

    const handleSendMessage = () => {
        if (newMessage.trim() && authUser) {
            const messageData = {
                senderId: authUser._id,
                receiverId: receiverId,
                text: newMessage.trim(),
                timestamp: new Date()
            };
            
            if (sendMessage(messageData)) {
                setNewMessage("");
                stopTyping(receiverId);
            }
        }
    };

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            startTyping(receiverId);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            stopTyping(receiverId);
        }, 1000);
    };

    const filteredMessages = messages.filter(msg => 
        (msg.senderId === authUser._id && msg.receiverId === receiverId) ||
        (msg.senderId === receiverId && msg.receiverId === authUser._id)
    );

    return (
        <div className="chat-container">
            <div className="messages">
                {filteredMessages.map(message => (
                    <div key={message._id || message.tempId} 
                         className={`message ${message.senderId === authUser._id ? 'sent' : 'received'}`}>
                        {message.text}
                    </div>
                ))}
            </div>
            
            {typingUsers[receiverId] && (
                <div className="typing-indicator">
                    Typing...
                </div>
            )}

            <div className="message-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatComponent;
5. CSS for Chat (optional)
css
.chat-container {
    max-width: 400px;
    margin: 0 auto;
}

.messages {
    height: 400px;
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 10px;
}

.message {
    margin: 5px 0;
    padding: 8px;
    border-radius: 8px;
    max-width: 80%;
}

.message.sent {
    background: #007bff;
    color: white;
    margin-left: auto;
}

.message.received {
    background: #f1f1f1;
    margin-right: auto;
}

.typing-indicator {
    font-style: italic;
    color: #666;
    padding: 5px;
}

.message-input {
    display: flex;
    margin-top: 10px;
}

.message-input input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.message-input button {
    margin-left: 5px;
    padding: 8px 15px;
}
This gives you:

✅ Real-time messaging

✅ Typing indicators

✅ Read receipts

✅ Online/offline status

✅ Message delivery confirmation

✅ Error handling
*/