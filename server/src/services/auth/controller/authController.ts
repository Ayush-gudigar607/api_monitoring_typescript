import { config } from "../../../shared/config/index"
import { APPLICATION_ROLES } from "../../../shared/constants/roles";

export class AuthController{
    constructor(authService)
    {
        if(!authService)
        {
            throw new Error("AuthService is required")
        }
        this.authService=authService
    };

    setCookie(res:Response,token:String)
    {
        res.cookie("token",{
            httpOnly:config.httpOnly,
            secure:config.secure,
            maxAge:config.expireIn

        })
    }

    async onboardSuperAdmin(req,res,next){
        try {
            const {username,email,password}=req.body;
            const superAdminData={
                username,
                email,
                password,
                role:APPLICATION_ROLES.SUPER_ADMIN
            }

            const {token,user}=await this.authservice.onboardSuperAdmin(superAdminData)
        } catch (error) {
            
        }
    }


}