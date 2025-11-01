import React, {useState, useContext} from 'react' ;
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
    
    const [currentState, setCurrentState] = useState("Sign up");
    const [fullName , setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password , setPassword] = useState("")
    const [bio , setBio] = useState("")
    const [isDataSubmitted, setIsDataSubmitted] = useState(false);

    // fetch login from endPoint
    const { login } = useContext(AuthContext);

    
    const onSubmitHandler = (event) => {
        event.preventDefault();

        if (currentState === 'Sign up' && !isDataSubmitted) {
            setIsDataSubmitted(true)
            return ;
        }

        login(currentState === "Sign up" ? "signup" : "login", {fullName , email, password, bio})
      
    }

    return (
        <div className ='min-h-screen bg-cover bg-center flex items-center justify-center
        gap-8 sm:justify-evenly max-sm:flex-col max-sm:gap-1 max-sm:items-center backdrop-blur-sm'>
            {/** left */}
            <img src={"https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOyff6t1YOc0bkifAnBRj5hG72QteEx8WuNT6P"} alt="" 
            className ='w-[400px] max-sm:w-[100px] cursor-pointer '/>

            {/** right */}
            <form 
                onSubmit ={onSubmitHandler}
                className ='border-2 bg-white/8 text-white border-gray-200 p-6 flex flex-col
                gap-6 rounded-lg shadow-lg cursor-pointer'>
                <h2 className ='font-bold text-2xl flex justify-between items-center text-[#f6b100]'>
                    {currentState}
                    {isDataSubmitted && 
                    <FaArrowAltCircleLeft 
                        onClick ={()=> setIsDataSubmitted(false)}
                        className ='inline ml-2 text-white'/>}
                    
                </h2>

                { currentState === 'Sign up' && !isDataSubmitted &&(
                    
                    <input 
                        onChange = {(e)=> setFullName(e.target.value)}
                        value= {fullName}
                        type='text' className='p-2 border border-gray-200 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-[#f6b100]'
                        placeholder='Full name'
                        required
                    />
                )}

                {!isDataSubmitted && (
                    <>
                        <input 
                            onChange= {(e)=> setEmail(e.target.value)}
                            value= {email} 
                            type= "email"
                            placeholder= "Email Address"
                            required 
                            className ='p-2 border border-gray-200 rounded-md focus:outline-none
                            focus:ring-2 focus:ring-[#f6b100]' 
                        />
                        <input 
                            onChange= {(e)=> setPassword(e.target.value)}
                            value= {password} 
                            type= "password"
                            placeholder= "Password"
                            required 
                            className ='p-2 border border-gray-200 rounded-md focus:outline-none
                            focus:ring-2 focus:ring-[#f6b100]' 
                       />
                    </>
                )}

                {currentState === "Sign up" && isDataSubmitted && (
                    <textarea
                       row= {4}
                       className ='p-2 border border-gray-200 rounded-md focus:outline-none
                       focus:ring-2 focus:ring-[#f6b100]'
                       placeholder ='provide a short bio...'
                       required
                       onChange ={(e)=> setBio(e.target.value)}
                       value ={bio}
                    >

                    </textarea>
                )}

                <button 
                    type ='submit'
                    className ='bg-gradient-to-r from-[#0ea5e9] to-[#f5f5f5] p-3 text-white
                    rounded-sm cursor-pointer'>
                    {currentState === "Sign up" ? "Create account" : "Login Now"}
                </button>

                <div className ='flex items-center gap-2 text-sm text-gray-200'>
                    <input type ='checkbox' />
                    <p>Agree to the terms of use & privacy policy.</p>
                </div>

                <div className ='flex flex-col gap-2'>
                    {currentState === "Sign up" ? 
                        (<p className ='text-sm text-gray-300'>Already have an account ? 
                        <span 
                            onClick ={()=>{setCurrentState('Login'); setIsDataSubmitted(false)}}
                            className ='font-bold text-[#f6b100] cursor-pointer'> Login here</span></p>) : 
                        (<p className ='text-sm text-gray-300'>Create a new account 
                        <span 
                            onClick ={()=> setCurrentState('Sign up')}
                            className ='font-bold text-[#f6b100] cursor-pointer'> Click here</span></p>) 
                    }

                </div>

            </form>
        </div>
    );
}

export default LoginPage ;