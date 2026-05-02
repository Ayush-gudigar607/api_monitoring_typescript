import { AuthController } from "../controller/authController.js";
import { AuthService } from "../service/authService.js";
import MongoUserRepository from "../repository/userRepository.js";

/* ================= TYPES ================= */

type Repositories = {
  userRepository: typeof MongoUserRepository;
};

type Services = {
  authService: AuthService;
};

type Controllers = {
  authController: AuthController;
};

type ContainerType = {
  repositories: Repositories;
  services: Services;
  controllers: Controllers;
};

/* ================= CONTAINER ================= */

class Container {
  static init(): ContainerType {
    const repositories: Repositories = {
      userRepository: MongoUserRepository, // already instantiated
    };

    const services: Services = {
      authService: new AuthService(repositories.userRepository),
    };

    const controllers: Controllers = {
      authController: new AuthController(services.authService),
    };

    return {
      repositories,
      services,
      controllers,
    };
  }
}

/* ================= EXPORT ================= */

const initialized = Container.init();

export default initialized;
