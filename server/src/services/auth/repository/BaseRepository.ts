import { Model } from "mongoose";

export default abstract class BaseRepository<T> {
 //abstract forces child classes to implement methods
    protected model: Model<T>;

    constructor(model: Model<T>) {
        if (!model) {
            throw new Error("Model is required");
        }
        this.model = model;
    }

    abstract create(data: Partial<T>): Promise<T>;

    abstract findById(id: string): Promise<T | null>;

    abstract findByUsername(username: string): Promise<T | null>;

    abstract findByEmail(email: string): Promise<T | null>;

    abstract findAll(page?: number, limit?: number): Promise<T[]>;
    
}
