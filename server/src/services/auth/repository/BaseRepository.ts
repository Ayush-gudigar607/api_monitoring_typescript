   export default abstract class BaseRepository<T> {
 //abstract forces child classes to implement methods
    protected model: T;

    constructor(model: any) {
        if (!model) {
            throw new Error("Model is required");
        }
        this.model = model;
    }

    abstract create(data: Partial<T>): Promise<T>;

    abstract findById(data: string): Promise<T | null>;

    abstract findByUsername(data: string): Promise<T | null>;

    abstract findByEmail(data: string): Promise<T | null>;

    abstract findByAll(data: any): Promise<T[]>;
}