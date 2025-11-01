import React, {useRef, useEffect, useContext, useState } from 'react' ;
import { FaArrowsSpin } from "react-icons/fa6";
import { BsExclamationDiamond } from "react-icons/bs";
import { HiChatBubbleLeftRight } from "react-icons/hi2" ; 
import {messageDummyData} from '../assets/assets'
import { formatMessageTime } from '../lib/utils';
import { MdOutlineScheduleSend } from "react-icons/md";
import { CiImageOn } from "react-icons/ci" ;
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
    
    const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
    const { authUser, onlineUsers } = useContext(AuthContext);

    const [input, setInput] = useState('');

    const handleSendMessage = async(e)=> {
       e.preventDefault();
       
       if( input.trim() === "" ) return null;
       await sendMessage({text: input.trim()});
       setInput("")
    }

    const handleSendImage = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")){
            toast.error("select an image file")
            return ;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            await sendMessage({ image: reader.result })
            e.target.value = ""
        }
        reader.readAsDataURL(file)
    };

    useEffect(()=>{
        if (selectedUser) {
            getMessages(selectedUser._id)
        }
    }, [selectedUser])

    const scrollEnd = useRef();
    useEffect(() => {
        if (scrollEnd.current && messages) {
            scrollEnd.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    return selectedUser ? (
        <div className ='h-full overflow-scroll relative background-blur-sm'>
            {/*Header */}
            <div className ='flex items-center gap-3 py-3 mx-4 border-b border-gray-300'>
                
                <img 
                    src = {selectedUser.profilePic || 'https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOe7UEwnLxGSqJOX0dvlIMCB5a4NghyVLW61RD'}
                    className ='w-8 rounded-full'
                    />
                    <p className ='flex-1 text-lg text-white flex items-center gap-2'>
                            {selectedUser.fullName}
                        {onlineUsers.includes(selectedUser._id) &&
                           <span className ='w-2 h-2 rounded-full bg-green-500'></span>
                       } 
                        
                    </p>
                    
                    <FaArrowsSpin onClick ={()=> setSelectedUser(null)}
                        className ='md:hidden w-5 h-5 text-white cursor-pointer '
                        />
                    {/* <BsExclamationDiamond className ='max-md:hidden w-5 h-5 text-green-500'/> */}
                    
            </div>

            {/*Chat area */}
            <div className ='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
                {messages.map((msg, index)=> (
                    <div  
                        key={index}
                        className ={`flex items-end gap-2 justify-end 
                            ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}
                        >
                            {msg.image ? (
                                <img src ={msg.image} alt ="" className ='max-w-[230px] border border-gray-500
                                rounded-lg overflow-hidden mb-8'/>
                            ): (
                                <p className ={`p-2 max-w-[200px] text-xs md:text-sm font-light rounded-lg mb-8
                                    break-all ${msg.senderId === authUser._id
                                        ? 'rounded-br-none bg-[#0ea5e9] text-white'
                                        : 'rounded-bl-none bg-[#f5f5f5] text-[#1a1a1a]'
                                    }`}>{msg.text}</p>
                            )}

                            <div classname ='text-center text-xs'>
                                <img 
                                    src ={msg.senderId === authUser._id ? authUser?.profilePic 
                                    || 'https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOe7UEwnLxGSqJOX0dvlIMCB5a4NghyVLW61RD'
                                    :selectedUser?.profilePic
                                    || 'https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOe7UEwnLxGSqJOX0dvlIMCB5a4NghyVLW61RD'
                                }
                                    className ='w-7 rounded-full'
                                />
                                <p className ='text-[#f5f5f5] text-xs font-normal'>{formatMessageTime(msg.createdAt)}</p>

                            </div>
                    </div>
                ))}
                <div ref ={scrollEnd}></div>
            
            </div>


            {/*bottom area */}
            <div className ='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
                <div className ='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
                    <input 
                        onChange= {(e)=> setInput(e.target.value)}
                        value= {input}
                        onKeyDown= {(e)=> e.key === "Enter" 
                            ?
                            handleSendMessage(e)
                            :
                            null
                        }
                        type ='text' placeholder ='Send a message' className ='flex-1 text-sm p-3 border-none
                        rounded-lg outline-none text-white placeholder-gray-200'/>
                    
                    <input 
                        onChange ={handleSendImage}
                        type='file' id ='image' accept ='image/png, image/jpg, image/jpeg' hidden/>
                    <label htmlFor ='image'>
                        <CiImageOn className ='cursor-pointer mr-2 w-6 h-6 text-[#f5f5f5]'/>
                    </label>
                </div>

                <MdOutlineScheduleSend 
                    onClick ={handleSendMessage}
                    className ='cursor-pointer w-8 h-8 text-[#f5f5f5]'/>

            </div>
        </div>
    ) : (
        <div className ='flex flex-col items-center justify-center gap-2 text-gray-500
        bg-white/10 max-md:hidden'>
            <HiChatBubbleLeftRight className='w-8 h-8 text-[#f5f5f5]' />
            <p className ='text-[#f5f5f5] text-light font-semibold'>Chat anytime, anywhere</p>
        </div>
    )
}


export default ChatContainer ;