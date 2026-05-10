import { RequestHandler } from "../utils/requests-handler";

export async function creatToken(api:RequestHandler,email:string,password:string) {
    const tokenResponse = await api
        .path('users/login')
        .body({ "user": { "email": email, "password": password } })
        .postRequest(200)
   return 'Token ' + tokenResponse.user.token
    
}