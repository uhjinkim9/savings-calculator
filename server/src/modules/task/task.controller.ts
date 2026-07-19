import {Controller} from "@nestjs/common";
import {TaskService} from "./task.service";
import {Cron} from "@nestjs/schedule";

@Controller("task")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // @Cron("0 */3 * * *")
  // 테스트용: 3초에 한 번씩 실행
  // @Cron("0/3 * * * * *")
  // async syncEmpsFromErp() {
  //   return this.taskService.syncEmpsFromErp();
  // }
}
