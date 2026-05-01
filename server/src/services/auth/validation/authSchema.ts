import { isValidRole } from "../../../shared/constants/roles";

export const onboardSuperAdminSchema={
username:{required:true,minLenght:3},
email:{
    required:true,
    custom:(value:any)=>{
        return /\S+@\S+\.\S+/.test(value)? null:"Invalid Email"
    }
},
password:{
    required:true,
    minLength:8
}

};

