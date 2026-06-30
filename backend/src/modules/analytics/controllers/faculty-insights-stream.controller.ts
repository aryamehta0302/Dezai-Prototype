import { Controller, Sse, MessageEvent, Req, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { InsightsSseService } from '../services/insights-sse.service';

@Controller('faculty')
@UseGuards(JwtAuthGuard)
export class FacultyInsightsStreamController {
  constructor(private readonly sseService: InsightsSseService) {}

  @Sse('insights/stream')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  insightsStream(@Req() req): Observable<MessageEvent> {
    return this.sseService.getStream(req.user.id);
  }
}
