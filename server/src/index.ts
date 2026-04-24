import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from './shared/config/logger';

const app=express();

//Middleware 
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}));

app.use((req,res,next)=>
{
    logger.info(`${req.method} ${req.path} - ${req.ip}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"], //useragent will be web or api client
  });
  next();
})