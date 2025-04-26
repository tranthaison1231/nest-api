import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const bearerToken = request.headers['authorization'] as
        | string
        | undefined;

      const accessToken = bearerToken?.split(' ')[1];

      if (!accessToken) {
        throw new UnauthorizedException('User is not authenticated');
      }

      const isLoggedIn = verify(accessToken, process.env.JWT_SECRET) as {
        sub: string;
        email: string;
      };

      if (!isLoggedIn) {
        throw new UnauthorizedException('User is not authenticated');
      }

      return true;
    } catch {
      throw new UnauthorizedException('User is not authenticated');
    }
  }
}
