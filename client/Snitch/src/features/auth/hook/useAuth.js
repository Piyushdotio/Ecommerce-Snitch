import { Register, Login,getme } from "../services/auth.api";
import { setError, setLoading, setUser } from "../state/auth.slice";
import { useDispatch } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();

  const handleRegister = async ({ email, password, contact, fullname, isSeller = false }) => {
    try {
      dispatch(setLoading(true));
      const data = await Register({ email, password, contact, fullname, isSeller });
      dispatch(setError(null));
      return data.user;
    } catch (err) {
      dispatch(setError(err?.message || "Registration failed"));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
    
  };

  const handleLogin = async ({ email, contact, password }) => {
    try {
      dispatch(setLoading(true));
      const data = await Login({ email, contact, password });
      dispatch(setError(null));
      dispatch(setUser(data.user));
      return data.user;
    } catch (err) {
      dispatch(setError(err?.message || "Login failed"));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
    
  };
  const handlegetme=async()=>{
    try{
      dispatch(setLoading(true))
      const data = await getme()
      if (data?.user) {
        dispatch(setUser(data.user))
      }
    }catch(err){
      console.log(err)
    }
    finally{
      dispatch(setLoading(false))
    }
    
  }

  return { handleRegister, handleLogin,handlegetme };
};
