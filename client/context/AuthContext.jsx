import { createContext, useState, useEffect } from "react";
import axios from 'axios';
import toast from 'react-hot-toast';
import {io} from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    
    // Check if user is authenticated and if so , set the user data and connect te socket
    const checkAuth = async()=> {
        try {
           const {data} = await axios.get("/api/auth/check");
           if (data.success) {
            setAuthUser(data.user)
            connectSocket(data.user)
           } 
        } catch (error) {
           toast.error(error.message)                  
        }
    };

    // login function handle user authentication and socket connectio
    const login = async(state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token ;
                setToken(data.token);
                localStorage.setItem("token", data.token)
                toast.success(data.message)
            } else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    };

    // logout function and socket disconnected
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully")
        socket.disconnect();
    };

    // update profile function
    const updateProfile = async (body)=> {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success){
                setAuthUser(data.user);
                toast.success("Profile updated succcessfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    };


    

    // connect socket function to handle connectionand online users updates
    const connectSocket = (userData)=> {
        
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            },
            transports: ['websocket', 'polling'] // explicit transports
        });

        
        // socketEvents:-
        newSocket.on("connect", () => {
            console.log("Socket connected successfully");
        });
        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });

              
        setSocket(newSocket);
    }; 



    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    }, [])

    const value = {
       axios,
       authUser,
       onlineUsers,
       socket,
       login,
       logout,
       updateProfile,
    }

    return (
        <AuthContext value ={value}>
            {children}
        </AuthContext>
    )
};


/*
import { createContext, useState, useEffect, useRef } from "react";
import axios from 'axios';
import toast from 'react-hot-toast';
import {io} from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const socketRef = useRef(null); // Use ref to prevent multiple connections
    
    // Check if user is authenticated
    const checkAuth = async() => {
        try {
           const {data} = await axios.get("/api/auth/check");
           if (data.success) {
            setAuthUser(data.user);
            connectSocket(data.user);
           } 
        } catch (error) {
           toast.error(error.message);
        }
    };

    // Login function
    const login = async(state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Logout function
    const logout = async () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully");
    };

    // Update profile function
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success){
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Connect socket function
    const connectSocket = (userData) => {
        if (!userData || !userData._id) {
            console.log("No user data or user ID for socket connection");
            return;
        }

        // Disconnect existing socket
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            },
            transports: ['websocket', 'polling']
        });

        newSocket.on("connect", () => {
            console.log("Socket connected successfully", newSocket.id);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        newSocket.on("getOnlineUsers", (userIds) => {
            console.log("Received online users:", userIds);
            setOnlineUsers(userIds);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        socketRef.current = newSocket;
    };

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        }
    }, [token]);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket: socketRef.current,
        login,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
*/