import axios from "axios";
export const authApi = axios.create({baseURL:"https://gestiona-tu-negocio-back.onrender.com/"})
authApi.interceptors.request.use((config)=>{
    config.headers = {
        'x-token':localStorage.getItem('token')
    }; return config;
})
export default authApi;