/*npm i bcryptjs cloudinary cors dotenv express jsonwebtoken mongoose socket.io colors 
Are used to bring functionality from other modules into cuurent module - we can import exported entities by using import keywords
*/


// import express from 'express'; 
// import "dotenv/config";
// import cors from 'cors';
// import http from 'http' ;
// import 'colors';
// import { connectDB } from './lib/db.js';
// import userRouter from './routes/userRoutes.js';
// import messageRouter from './routes/messageRoutes.js';

// import {Server} from 'socket.io' ;
// //webSocket realtime communication  

// // Create express app and HTTP server
// const app = express();

// // Middleware setup 
// app.use(express.json({limit: "4mb"})) ;
// app.use(cors({
//     origin: "*", // your frontend URL
//     credentials: true
// }));


// // create Http server
// export const server = http.createServer(app);   

// // Initialize Socket.IO server
// export const io = new Server(server, {
//     cors: { 
//         origin: "*",
//         methods: ["GET", "POST"],
//         credentials: true
//     },
//        transports: ['websocket', 'polling']
// });

// // Store online users
// export const userSocketMap = {}; // {userId, socketId}

// // socket.io connection handler
// io.on("connection", (socket)=>{
//     const userId = socket.handshake.query.userId;
//     console.log("User Connected", userId, "Socket ID:", socket.id);

//     if (!userId) {
//         console.log("No userId provided");
//         return;
//     }

//     // if (userId) userSocketMap[userId] = socket.id;
//     userSocketMap[userId] = socket.id;
//     console.log("Online users:", Object.keys(userSocketMap));

//     // Emit online users to all connected clients
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));

//     socket.on("disconnect", ()=>{
//         console.log("User Disconnected", userId);
//         delete userSocketMap[userId];
//         io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     });

// })



// //Routes setup
// app.use("/api/status", (req, res)=> res.send('Server is live'));
// app.use('/api/auth', userRouter);
// app.use('/api/messages', messageRouter);

// // await connectDB();
// // const PORT = process.env.PORT || 5000 ;
// // app.listen(PORT, ()=> console.log('Server is running on PORT: ' + PORT))


// //The main problem is that you're creating two HTTP servers - one with http.createServer(app) and 
// // another with app.listen(). Here's the corrected version:
// // Connect to database and start server
// const startServer = async () => {
//     await connectDB();
//     const PORT = process.env.PORT || 5000;
    
//     // Use the HTTP server (not app.listen)
//     server.listen(PORT, () => {
//         console.log('Server is running on PORT: '.green + PORT);
//         console.log('Socket.IO server is running'.blue);
//     });
// };

// startServer();


// import express from 'express'; 
// import "dotenv/config";
// import cors from 'cors';
// import http from 'http' ;
// import 'colors';
// import { connectDB } from './lib/db.js';
// import userRouter from './routes/userRoutes.js';
// import messageRouter from './routes/messageRoutes.js';
// import {Server} from 'socket.io' ;

// // create express app and HTTP server
// const app = express();
// const server = http.createServer(app)

// // initialize socket.io server
// export const io = new Server(server, {
//     cors: {origin: "*"}
// })

// // store online users
// export const userSocketMap = {};
// io.on("connection", (socket)=>{
//     const userId = socket.handshake.query.userId;
//     console.log("User Connected", userId, "Socket ID:", socket.id);

//     if (!userId) {
//         console.log("No userId provided");
//         return;
//     }

//     // if (userId) userSocketMap[userId] = socket.id;
//     userSocketMap[userId] = socket.id;
//     console.log("Online users:", Object.keys(userSocketMap));

//     // Emit online users to all connected clients
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));

//     socket.on("disconnect", ()=>{
//         console.log("User Disconnected", userId);
//         delete userSocketMap[userId];
//         io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     });

// })

// // middleware setup 
// app.use(express.json({limit: "4mb"}));
// app.use(cors());

// // Routes setup
// app.use("/api/status", (req, res)=> res.send('Server is live'));
// app.use('/api/auth', userRouter);
// app.use('/api/messages', messageRouter);

// // connect to DB
// await connectDB();

// if (process.env.NODE_ENV !== "production") {
//     const PORT = process.env.PORT || 5000;
//     server.listen(PORT, () => console.log("Server is running on PORT :" + PORT));
// };

// export default server ;


import express from 'express'; 
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import 'colors';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import {Server} from 'socket.io';

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
export const io = new Server(server, {
    cors: {
        // origin: process.env.FRONTEND_URL || "*",
        origin: "*",
        //  
        // allowedHeaders: ["Content-Type", "Authorization"]
    },
    // transports: ['websocket', 'polling'],
    // pingTimeout: 60000,
    // pingInterval: 25000
});

// store online users
export const userSocketMap = {}; // userId, socketId

// socket io connection handler
// io.on("connection", (socket)=>{
//     const userId = socket.handshake.query.userId;
//     console.log("User Connected", userId, "Socket ID:", socket.id);

//     if (!userId) {
//         console.log("No userId provided");
//         return;
//     }

//     userSocketMap[userId] = socket.id;
//     console.log("Online users:", Object.keys(userSocketMap));

//     // Emit online users to all connected clients
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));

//     socket.on("disconnect", ()=>{
//         console.log("User Disconnected", userId);
//         delete userSocketMap[userId];
//         io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     });
// });

// new soket connection handler 
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId, "Socket ID:", socket.id);

    if(userId) {userSocketMap[userId] = socket.id};

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("User disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})


// middleware setup 
app.use(express.json({limit: "4mb"}));
app.use(cors({
    // origin: process.env.FRONTEND_URL || "*",
    origin: "*",
    credentials: true
}));

// Routes setup
app.use("/api/status", (req, res)=> res.send('Server is live'));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// Connect to DB
await connectDB();

 if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log("Server is running on PORT :" + PORT));
};

// For Vercel, export the HTTP server, not Express app
export default server;


