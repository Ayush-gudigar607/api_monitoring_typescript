import AppError from "../../../shared/utils/AppError";

type SuperAdminData = {
    username: string;
    email: string;
    password: string;
    role: string;
};

type UserRepository = {
    findAll(page?: number, limit?: number): Promise<unknown[]>;
    create(data: Partial<SuperAdminData>): Promise<unknown>;
};

export class AuthService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        if (!userRepository) {
            throw new Error("UserRepository is not available");
        }

        this.userRepository = userRepository;
    }

    async onboardSuperAdmin(superAdminData: SuperAdminData) {
        try {
            const existingUser = await this.userRepository.findAll();

            if (existingUser && existingUser.length > 0) {
                throw AppError.forbidden("Super Admin Onboarding is disabled");
            }

            return {
                token: "",
                user: await this.userRepository.create(superAdminData),
            };
        } catch (error) {
            throw error;
        }
    }
}