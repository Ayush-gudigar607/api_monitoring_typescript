export interface Config {

    node_env:string,
    port:number,

    //mongodb configaration
    mongo_uri:string,
    mongo_db_name:string,

    //POSTGRES CONFIGARATION
    pg_host:string,
    pg_port:number,
    pg_database:string,
    pg_user:string,
    pg_password:string,

    //rabbitmq configuration
    rabbitmq_url:string,
    rabbitmq_queue:string,
    publisherConfirms:boolean,
    retryAttempts:number,
    retryDelay:number,

    //jwt configuration
    jwt_secret:string,
    jwt_expires_in:string,

    //Rate limiting
    rate_limit_window_ms:number,
    rate_limit_max:number,

    httpOnly:boolean,
    secure:string, //only send cookie over https in production
    expireIn:number//1 DAY IN MILLISECOND
}