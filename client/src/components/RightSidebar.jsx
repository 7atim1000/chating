import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { BiLogOutCircle } from "react-icons/bi";

const RightSidebar = () => {

    const{selectedUser, messages} = useContext(ChatContext);
    const {logout, onlineUsers} = useContext(AuthContext);
    const [msgImages, setMsgImages] = useState([]);

    // get all the images from the messages and set them to state
    useEffect(()=>{
        setMsgImages(
            messages.filter(msg => msg.image).map(msg=> msg.image)
        )
    }, [messages])

    return selectedUser &&(
       <div className ={`bg-[#8185b2]/20 text-white w-full relative overflow-y-scroll max-sm:hidden`}>
           <div className ='md:pt-10 flex flex-col items-center gap-2 text-xs font-light mx-auto '>
              <img src ={selectedUser?.profilePic || 'https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOe7UEwnLxGSqJOX0dvlIMCB5a4NghyVLW61RD'}
                alt ='' className ='w-20 aspect-[1/1] rounded-full'/>
                
                <h1 className ='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
                    {onlineUsers.includes(selectedUser._id) && <p className ='w-2 h-2 rounded-full bg-green-500'></p>}
                    {selectedUser.fullName}
                </h1>

                <p className ='px-10 mx-auto'>{selectedUser.bio}</p>
           </div>

           <hr className ='border-[#ffffff50] my-4'/>
           
            <div className='px-5 text-xs'>
                <p>Media</p>
                <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 
            opacity-80'>
                    {msgImages.map((url, index) => (
                        <div key={index} onClick={() => window.open(url)}
                            className='cursor-pointer rounded' >
                            <img src={url} alt="" className='h-full rounded-md' />
                        </div>
                    ))}
                </div>

            </div>

            <div className='flex gap-2'>
                <button
                    onClick={() => logout()}
                    className='absolute bottom-3 left-1/2 transform -translate-x-1/2
                    text-[#f5f5f5] border-none text-sm
                    font-light py-2 px-20 rounded-full cursor-pointer  '>
                    Logout
                </button>
                
            </div>
            

       </div>
    );
}


export default RightSidebar ;