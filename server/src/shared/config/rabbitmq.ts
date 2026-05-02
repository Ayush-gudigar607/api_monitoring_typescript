import * as amqp from 'amqplib';
import { config } from './index';
import { logger } from './logger';

class RabbitMQConnection {
    private connection: amqp.ChannelModel | null;
    private channel: amqp.Channel | null;
    private isConnecting: boolean;
    private isClosing: boolean;

    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
        this.isClosing = false;
    }

    async connect(): Promise<amqp.Channel> {
        if (this.isClosing) {
            throw new Error("Cannot connect while closing.");
        }

        if (this.channel) {
            return this.channel;
        }

        if (this.isConnecting) {
            await new Promise<void>((resolve) => {
                const interval = setInterval(() => {
                    if (!this.isConnecting) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });

            if (this.channel) return this.channel;
            throw new Error("Connection failed after waiting.");
        }

        try {
            this.isConnecting = true;

            logger.info("Connecting to RabbitMQ...");

            this.connection = await amqp.connect(config.rabbitmq_url);
            this.channel = await this.connection.createChannel();

            const dlqName = `${config.rabbitmq_queue}_dlq`;

            await this.channel.assertQueue(dlqName, { durable: true });

            await this.channel.assertQueue(config.rabbitmq_queue, {
                durable: true,
                arguments: {
                    "x-dead-letter-exchange": "",
                    "x-dead-letter-routing-key": dlqName,
                },
            });

            this.connection.on("close", () => {
                logger.warn("RabbitMQ connection closed");
                this.connection = null;
                this.channel = null;
            });

            this.connection.on("error", (err: unknown) => {
                logger.error("RabbitMQ connection error:", err);
                this.connection = null;
                this.channel = null;
            });

            return this.channel;

        } catch (error) {
            logger.error("Failed to connect to RabbitMQ:", error);
            throw error;
        } finally {
            this.isConnecting = false;
        }
    }

    getChannel(): amqp.Channel | null {
        return this.channel;
    }

    getStatus(): "connected" | "disconnected" | "closing" {
        if (this.isClosing) return "closing";
        if (!this.connection || !this.channel) return "disconnected";
        return "connected";
    }

    async close(): Promise<void> {
        if (this.isClosing) return;

        this.isClosing = true;

        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }

            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }

            logger.info("RabbitMQ closed successfully");

        } catch (error) {
            logger.error("Error closing RabbitMQ:", {
                message: (error as Error).message,
                stack: (error as Error).stack,
            });
            throw error;
        } finally {
            this.isClosing = false;
        }
    }
}

export default new RabbitMQConnection();
