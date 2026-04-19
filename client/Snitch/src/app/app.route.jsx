import { createBrowserRouter} from 'react-router-dom'
import  Register  from '../features/auth/pages/Register.jsx'

export const router= createBrowserRouter([
    {
        path:'/',
        element:<h1>Home</h1>
    },
    {
        path:'/register',
        element: <Register/>
    }



])