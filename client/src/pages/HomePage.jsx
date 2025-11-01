import {useContext, useState} from 'react' ;
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { ChatContext } from '../../context/ChatContext';

const HomePage = () => {
    
    const {selectedUser} = useContext(ChatContext);

    return (
        <div className ='border w-full h-screen px-2 py-10 sm:px-[15%] sm:py-[5%]' >
            <div className ={`backdrop-blur-xs border-2 border-[#0ea5e9] rounded-xl overflow-hidden
            h-[100%] grid grid-cols-1 relative 
                ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' 
                : 'md:grid-cols-2' }`}
                >
                <Sidebar  />
            
                <ChatContainer />
                <RightSidebar />
            
            </div>
        </div>
    );
}

export default HomePage ;