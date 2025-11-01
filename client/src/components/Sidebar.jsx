import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom' ;
import { HiChatBubbleLeftRight } from "react-icons/hi2" ;
import { RiMenuAddFill } from "react-icons/ri";
import { FcSearch } from "react-icons/fc";

import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { CgProfile } from "react-icons/cg";
import { BiLogOutCircle } from "react-icons/bi";


const Sidebar = () => {

    const {getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext);
    const { logout, onlineUsers } = useContext(AuthContext);

    const [input, setInput] = useState(false);
    const navigate = useNavigate();

    const filteredUsers = input ? users.filter((user)=>user.fullName.toLowerCase().
    includes(input.toLowerCase())) : users;

    useEffect(()=> {
        getUsers();
    }, [onlineUsers]) // dependencies
    
    return (
        <div className ={`bg-[#8185b2]/10 h-full p-3 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? 'max-md:hidden' : ''}`} >
            <div className='pb-5'>
                
                <div className='flex justify-between items-center'>
                    <HiChatBubbleLeftRight className='w-6 h-6 text-[#f5f5f5]' />
                  
                    <div className ='relative py-2 group'>
                        <RiMenuAddFill className='w-6 h-6 cursor-pointer text-[#f5f5f5]' />
                        <div className ='absolute top-full right-0 z-20 w-32 p-5 rounded-md
                            bg-white border border-gray-400 text-[#0ea5e9] hidden group-hover:block'>
                            <p
                                onClick={() => navigate('/profile')}
                                className='cursor-pointer text-sm '>Edit Profile <CgProfile className ='inline w-3 h-3'/></p>
                            <hr className='my-2 border-t border-gray-400' />
                            <p className='cursor-pointer text-sm '
                                onClick = {()=>logout()}
                            >
                                Logout <BiLogOutCircle className ='inline text-[#be3e3f] w-3 h-3'/>
                            </p>
                        </div>

                    </div>
                </div>

                <div className ='bg-[#f5f5f5] rounded-full flex items-center gap-2 py-1.5 px-4 mt-5'>
                    <FcSearch className ='w-6 h-6 inline'/>
                   
                    <input
                        onChange = {(e)=>setInput(e.target.value)}
                        type ='text' 
                        className ='bg-transparent border-none outline-none text-[#1f1f1f]
                    text-xs placeholder-[#1f1f1f] flex-1' placeholder ='Search user ...'/>
                </div>
            </div>

            <div className ='flex flex-col  rounded-md'>
                {filteredUsers.map((user, index)=>(
                    <div 
                        onClick ={()=> {setSelectedUser(user); setUnseenMessages(prev=>
                        ({...prev, [user._id]:0})
                        )}}
                        key ={index}
                        className ={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer
                        max-sm:text-sm  ${selectedUser?._id === user._id && 'bg-[#282142]/10'}`}>
                        <img src ={user?.profilePic || 'https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOe7UEwnLxGSqJOX0dvlIMCB5a4NghyVLW61RD'}
                        className ='w-[35px] aspect-[1/1] rounded-full'
                        />
                        <div className ='flex flex-col leading-5'>
                            <p>{user.fullName}</p>
                            {
                                onlineUsers.includes(user._id)
                                ? <span className ='text-green-500 text-xs font-semibold'>Online</span>
                                : <span className ='text-neutral-400 text-xs font-semi-bold'>Offline</span>
                            }
                        </div>

                        {/* {unseenMessages[user._id] > 0 && 
                            <p className ='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center
                            items-center rounded-full bg-green-500 text-white'>
                                {unseenMessages[user._id]}
                            </p>
                        } */}

                        {user._id && ((unseenMessages?.[user._id] ?? 0) > 0) && (
                            <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-green-500 text-white  font-semibold'>
                                {unseenMessages?.[user._id] ?? 0}
                            </p>
                        )}
                    </div>
                ))}
            </div>

        </div>
        
    );
}


export default Sidebar ;