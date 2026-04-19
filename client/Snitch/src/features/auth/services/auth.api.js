import axios from "axios"

export const authapiInstance=axios.create({
    baseURL:"http://localhost:3000/",
    withCredentials:true,
})

export const Register = async ({email,password,fullname,contact,isSeller})=>{
    try{

        const response=await authapiInstance.post("api/auth/register",{
            email,
            password,
            fullname,
            contact,
            isSeller
        })
        return  response.data
    }catch(err){
        console.error(err.message)
    }
}

