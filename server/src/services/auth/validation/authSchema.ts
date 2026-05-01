import { isValidRole } from "../../../shared/constants/roles";


type ValidationResult=string |null;

type FieldSchema<T=any>={
    required?:boolean;
    minLength?:number;
    custom?:(value:T)=>ValidationResult
}

type OnboardSuperAdminSchema={
    username:FieldSchema<string>;
    email:FieldSchema<string>;
    password:FieldSchema<string>;
}

export const onboardSuperAdminSchema:OnboardSuperAdminSchema={
    username: {
        required: true,
        minLength: 3,
    },
   
    email: {
        required: true,
        custom: (value:string):ValidationResult=>
        {
return /\S+@\S+\.\S+/.test(value) ? null : "Invalid Email";        }
    },
     password: {
        required: true,
        minLength: 8
        },
}