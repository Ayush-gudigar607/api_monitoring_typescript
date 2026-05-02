import AppError from "../../../shared/utils/AppError"



export class AuthService{
    constructor(userRepository)
    {
        if(!userRepository)
        {
            throw new Error("UserRepository is Not Exists")
        }
        this.userRepository=userRepository
    };

    async onboardSuperAdmin(superAdminData)
    {
        try {
            const existingUser=await this.userRepository.findAll()

            if(existingUser && existingUser.length>0)
            {
                throw new AppError("Super Admin Onboarding is disabled",403)
            }

        } catch (error) {
            
        }
    }


}