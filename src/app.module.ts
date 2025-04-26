import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from 'nestjs-prisma';
import { TourModule } from './modules/tour/tour.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    TourModule,
    AuthenticationModule,
  ],
})
export class AppModule {}
