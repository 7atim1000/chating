import { createContext, useState, useContext, useEffect } from 'react' ;
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast' ;

export const ChatContext = createContext();

export const ChatProvider = ({children}) =>{
    
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const {socket, axios} = useContext(AuthContext);

    // function to get all users to sidebar
    const getUsers = async () => {
        
        try {
            const {data} = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        
        } catch (error) {
            toast.error(error.message)
        }
    };

    // function to get messages from selected user
    const getMessages = async (userId) => {
        try {
           const {data} = await axios.get(`/api/messages/${userId}`);
           if (data.success) {
            setMessages(data.messages)
           }     
        } catch (error) {
             toast.error(error.message)
        }
    };

    // function to send messages to selected user
    const sendMessage = async(messageData) => {
        try {
           const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
           if (data.success) {
            setMessages((prevMessages)=>[...prevMessages, data.newMessage])
           }  else {
            toast.error(data.message);
           }

        } catch (error) {
            toast.error(error.message)
        }
    };

    // function to (SEEN) subscribeTo messages for selected user
   
    // const subscribeToMessages = async() => {
    //     if (!socket) return;

    //     socket.on("newMessage", (newMessage)=>{
    //         if (selectedUser && newMessage.senderId === selectedUser._id) {
    //             newMessage.seen = true;
    //             setMessages((prevMessages)=>[...prevMessages, newMessage]);

    //             axios.put(`/api/messages/mark/${newMessage._id}`);
    //         } else{
    //             setUnseenMessages((prevUnseenMessages)=>({
    //                 ...prevUnseenMessages, [newMessage.senderId] :
    //                 prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages
    //                 [newMessage.senderId] + 1 : 1 
    //             }))
    //         }
    //     })
    // };

    // Guard against missing senderId and ensure you don't mutate with undefined
    //  keys. Replace the subscribe handler and fix the provider return.

       const subscribeToMessages = async() => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const senderId = newMessage?.senderId ?? newMessage?.sender?._id;
            if (!senderId) {
                console.warn('newMessage missing senderId', newMessage);
                return;
            }

            if (selectedUser && senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);

                // mark on server (fire-and-forget)
                axios.put(`/api/messages/mark/${newMessage._id}`).catch(()=>{});
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [senderId]: (prev?.[senderId] ?? 0) + 1
                }));
            }
        });
    };

    // function to (SEEN) subscribeFROM messages for selected user
    const unsubscribeFromMessages = () => {
        if(socket) socket.off("newMessage");
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribeFromMessages();
    },[socket, selectedUser])
    

    const value = {
        messages, users, selectedUser, getUsers, setMessages, sendMessage, getMessages,
        setSelectedUser, unseenMessages, setUnseenMessages
    } 

    return (
    <ChatContext value ={value}>
        { children }
    </ChatContext>
    )
}