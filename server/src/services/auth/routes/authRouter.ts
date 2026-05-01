import express from "express"
import requestLogger from "../../../shared/middlewares/requestlogger"
import { onboardSuperAdminSchema } from "../validation/authSchema"
import validate from "../../../shared/middlewares/validate"


const router=express.Router()


//Public Router
router.post("/onboard-super-admin",requestLogger,validate(onboardSuperAdminSchema))