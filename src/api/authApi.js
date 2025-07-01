import axios from "axios";
//http://localhost:4008 //test local
//https://gestiona-tu-negocio-back.onrender.com/
export const authApi = axios.create({baseURL:"https://gestiona-tu-negocio-back.onrender.com"})
authApi.interceptors.request.use((config)=>{
    config.headers = {
        'x-token':localStorage.getItem('token')
    }; return config;
})
export default authApi;