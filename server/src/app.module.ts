import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {ScheduleModule} from "@nestjs/schedule";

import {LoggerMiddleware} from "src/middlewares/logger.middleware";
import {DatabaseModule} from "src/config/orm.config";

import {AdminModule} from "src/modules/admin/admin.module";
import {AuthModule} from "src/modules/auth/auth.module";
import {BoardModule} from "src/modules/board/board.module";
import {FileModule} from "src/modules/file/file.module";
import {MenuModule} from "src/modules/menu/menu.module";
import {PlansModule} from "src/modules/plan/plans.module";
import {SavingsModule} from "src/modules/savings/savings.module";
import {TaskModule} from "src/modules/task/task.module";
import {AppController} from "./app.controller";

@Module({
  imports: [
    // 환경 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `config/env/.env.${process.env.NODE_ENV || "development"}`,
    }),

    ScheduleModule.forRoot(),
    DatabaseModule,

    // 도메인 모듈들
    AdminModule,
    AuthModule,
    BoardModule,
    FileModule,
    MenuModule,
    PlansModule,
    SavingsModule,
    TaskModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  configure(consumer: any) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
