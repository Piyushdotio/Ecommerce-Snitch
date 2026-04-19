import { Register } from "../services/auth.api";
import { setError,setLoading,setUser } from "../state/auth.slice";
import { useDispatch } from "react-redux";

export const useauth=()=>{
    const Dispatch=useDispatch()
    export const handleRegister=async({email,password,contact,fullname,isSeller=false})=>{
        
        const data=await Register({
            email,
            password,
            contact,
            fullname,
            isSeller
        })
        Dispatch(setUser(data.user))

    }

    return {handleRegister}




}