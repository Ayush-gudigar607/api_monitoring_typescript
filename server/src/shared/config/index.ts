import dotenv from 'dotenv';
import { Config } from './types';

dotenv.config();

export const config:Config = {
  node_env:process.env.NODE_ENV || 'development',
  port:parseInt(process.env.PORT || '5000', 10),

  //mongodb configaration
  mongo_uri:process.env.MONGO_URI || 'mongodb://localhost:27017/api_monitoring',
  mongo_db_name:process.env.MONGO_DB_NAME || 'api_monitoring',

    //POSTGRES CONFIGARATION
    pg_host:process.env.PG_HOST || 'localhost',
    pg_port:parseInt(process.env.PG_PORT || '5432', 10),
    pg_database:process.env.PG_DATABASE || 'api_monitoring',
    pg_user:process.env.PG_USER || 'postgres',
    pg_password:process.env.PG_PASSWORD || 'rahul',

    //rabbitmq configuration
    rabbitmq_url:process.env.RABBITMQ_URL || 'amqp://api_user:secure_password@localhost:5672/api_monitoring',
    rabbitmq_queue:process.env.RABBITMQ_QUEUE || 'api_hits',
    publisherConfirms:process.env.PUBLISHER_CONFIRMS === 'true' || false,
    retryAttempts:parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
    retryDelay:parseInt(process.env.RETRY_DELAY || '1000', 10),

    //jwt cconfigaration
    jwt_secret:process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
    jwt_expires_in:process.env.JWT_EXPIRES_IN || '24h',

    //Rate limiting
    rate_limit_window_ms:parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 1 hour
    rate_limit_max:parseInt(process.env.RATE_LIMIT_MAX || '1000', 10), // limit each IP to 1000 requests per windowMs

    
   // Cookie settings
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  expireIn: 24 * 60 * 60 * 1000,
   
}

