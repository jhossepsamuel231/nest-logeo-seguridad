import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ){}

  async register({email, name, password}: RegisterDto){
    const user = await this.userService.findOneByEmail(email)

    if(user){
      throw new BadRequestException('User already exist')
    }

    await this.userService.create({
      email, 
      name, 
      password: await bcryptjs.hash(password, 10)
    })

    return {
      name, email
    }
    
  }

  async login({email, password}: LoginDto){
    const user = await this.userService.findOneByEmail(email)
    if(!user){
      throw new UnauthorizedException('email is wrong')
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if(!isPasswordValid){
      throw new UnauthorizedException('password is wrong')
    }

    const payload = {email: user.email, role: user.role}

    const token = await this.jwtService.signAsync(payload)

    return {
      token,
      email
    }
  }

  async profile({email, role}: {email:string; role:string}){
    return await this.userService.findOneByEmail(email)
  }
}