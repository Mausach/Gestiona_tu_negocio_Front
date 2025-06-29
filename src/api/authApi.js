import axios from "axios";
export const authApi = axios.create({baseURL:"http://localhost:3000/"})
authApi.interceptors.request.use((config)=>{
    config.headers = {
        'x-token':localStorage.getItem('token')
    }; return config;
})
export default authApi;