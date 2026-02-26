import { UserService } from "../users/users.service.js";
import { HttpCodes } from "../utils/httpCodes.js";
import { IPayload, TokenController } from "../token/token.controller.js";
import { TokenService } from "../token/token.service.js";
import { SignUpInput } from "./validation/signup.schema.js";
import { LoginInput } from "./validation/login.schema.js";
import { IUser } from "../users/models/user.js";

export class AuthService {
    constructor(private readonly userService: UserService, private readonly tokenService: TokenService) { }

    async signup(signUpdData: SignUpInput) {
        const newuser = await this.userService.createUser(signUpdData);
        const tokens = this.tokenService.generateTokens(newuser);
        const refresh_token = tokens.find(t => t.name === "refresh_token")?.value
        await this.userService.updateRefreshToken(newuser._id, refresh_token)
        return { newuser, tokens }
    }

    async login(data: LoginInput) {
        const loginuser = await this.userService.loginUser(data);

        if (!loginuser) {
            throw { code: HttpCodes.INVALID_CREDENTIALS, message: "Invalid email or password" }
        }

        const tokens = this.tokenService.generateTokens(loginuser);
        const refresh_token = tokens.find(t => t.name === "refresh_token")?.value
        await this.userService.updateRefreshToken(loginuser._id, refresh_token)

        return { loginuser, tokens }
    }

    async verify(user: IPayload): Promise<IUser | null> {
        const id = user.sub;
        const foundUser = await this.userService.findUserById(id);
        return foundUser;
    }

    async refreshToken(user: IPayload) : Promise<IUser | null> {
        const id = user.sub;
        const foundUser = await this.userService.findUserById(id);
        return foundUser;
    }
}