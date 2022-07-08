import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthCredentialsDTO } from './DTO/auth-credentials-dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async createUser(authCredentialsDTO: AuthCredentialsDTO): Promise<void> {
    try {
      const { username, password } = authCredentialsDTO;

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = this.userRepository.create({
        username,
        password: hashedPassword,
      });

      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('Username already exists');
      else throw new InternalServerErrorException();
    }
  }

  async logIn(
    authCredentialsDTO: AuthCredentialsDTO,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDTO;
    const user = await this.userRepository.findOneBy({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payLoad: JwtPayload = { username };
      const accessToken: string = await this.jwtService.sign(payLoad);

      return {
        accessToken,
      };
    }
    throw new UnauthorizedException('Invalid login credentials');
  }
}
