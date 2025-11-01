import React , { useState, useContext } from 'react' ;
import {useNavigate} from 'react-router-dom' ;
import { AuthContext } from '../../context/AuthContext';
import { TiArrowBack } from "react-icons/ti";

const ProfilePage = () => {
    
    const {authUser, updateProfile} = useContext(AuthContext);
    
    const [selectedImg, setSelectedImg] = useState(null) ;
    const navigate = useNavigate();
    const [name, setName] = useState(authUser.fullName);
    const [bio, setBio] = useState(authUser.bio) ;

    const handleSubmit = async (event) => {
        event.preventDefault() ;
        if (!selectedImg){
            await updateProfile({fullName : name, bio});
            navigate('/');
            return;
        }
        
        const reader = new FileReader();
        reader.readAsDataURL(selectedImg);
        reader.onload = async ()=> {
            const base64Image = reader.result;
            await updateProfile({ profilePic: base64Image, fullName : name, bio});
            navigate('/');
        }
    }


    return (
        <div className ='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
            <div className ='w-5/6 max-w-2xl backdrop-blur-sm text-gray-200 border-2 border-gray-200
            flex items-center justify-between max-sm:flex-col-reverse rounded-sm'>
                
                <form onSubmit ={handleSubmit}  className ='flex flex-col gap-5 p-10 flex-1'>
                    
                    <h3 className ='text-lg font-bold text-[#f6b100]'>Profile Details</h3>
                    <label htmlFor ="avatar" className ='flex items-center gap-3 cursor-pointer'>
                        <input 
                            onChange ={(e)=> setSelectedImg(e.target.files[0])}
                            type ='file' id ="avatar" accept=".png, .jpg, .jpeg" hidden/>
                        <img 
                            src ={selectedImg ? URL.createObjectURL(selectedImg)
                            :
                            "https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOe7UEwnLxGSqJOX0dvlIMCB5a4NghyVLW61RD"
                            }
                            
                            className ={`w-12 h-12 ${selectedImg ? 'rounded-full' : 'rounded-full'}`}
                            alt ="" />

                            Upload profile photo
                    </label>

                    <input className ='p-2 border border-gray-200 rounded-sm focus:outline-none
                    focus:ring-2 focus:ring-[#f6b100]'
                    type ='text'
                    required
                    placeholder ='Your name'
                    onChange ={(e)=> setName(e.target.value)}
                    value ={name}
                    />

                    <textarea className ='p-2 border border-gray-100 rounded-sm focus:outline-none
                    focus:ring-2 focus:ring-[#f6b100]'
                    onChange ={(e)=>setBio(e.target.value)}
                    value ={bio}
                    type ='text'
                    >
                    </textarea>
                     
                    <div className='flex flex-col gap-4 items-center'>
                        <button
                            type='submit'
                            className='bg-gradient-to-r from-[#0ea5e9] to-[#f5f5f5] p-2 rounded-full 
                        text-lg cursor-pointer text-white'>
                            Save
                        </button>
                        <TiArrowBack className ='items-center w-6 h-6 cursor-pointer' onClick ={()=>navigate('/')}/>

                    </div>
                    
                </form>

                
                <img src={authUser.profilePic || "https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOyff6t1YOc0bkifAnBRj5hG72QteEx8WuNT6P"} alt=""
                    className='w-[300px] h-[300px] max-sm:w-[100px] max-sm:h-[100px] cursor-pointer max-sm:pt-1 rounded-md max-sm:rounded-md mr-2' />
            </div>
            
        </div>
    );
}


export default ProfilePage ;