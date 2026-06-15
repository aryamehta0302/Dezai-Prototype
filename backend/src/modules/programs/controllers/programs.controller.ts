import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ProgramsService } from '../services/programs.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

export class CreateProgramDto {
  title: string;
  description: string;
  institutionId?: string;
}

export class UpdateProgramDto {
  title?: string;
  description?: string;
}

export class CreateModuleDto {
  title: string;
  order: number;
}

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  /**
   * GET /api/programs
   * Retrieve all programs. Open to all authenticated users.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllPrograms() {
    const programs = await this.programsService.getPrograms();
    return { success: true, programs };
  }

  /**
   * GET /api/programs/:id
   * Retrieve a single program's complete curriculum structure.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getProgramById(@Param('id') id: string) {
    const program = await this.programsService.getProgramById(id);
    return { success: true, program };
  }

  /**
   * POST /api/programs
   * Create a new program. Restricted to FACULTY and above.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async createProgram(@Req() req, @Body() body: CreateProgramDto) {
    if (!body.title || !body.description) {
      throw new BadRequestException('Title and description are required');
    }
    const program = await this.programsService.createProgram(req.user.id, req.user.role as UserRole, body);
    return { success: true, program };
  }

  /**
   * PUT /api/programs/:id
   * Update program details. Restricted to owner Faculty/Admin.
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async updateProgram(
    @Param('id') id: string,
    @Req() req,
    @Body() body: UpdateProgramDto
  ) {
    await this.programsService.validateProgramOwnership(req.user.id, id, req.user.role as UserRole);
    const program = await this.programsService.updateProgram(id, body, req.user.id);
    return { success: true, program };
  }

  /**
   * POST /api/programs/tracks/:trackId/modules
   * Create a module inside a specific track. Restricted to owner Faculty/Admin.
   */
  @Post('tracks/:trackId/modules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async createModule(
    @Param('trackId') trackId: string,
    @Req() req,
    @Body() body: CreateModuleDto
  ) {
    if (!body.title || body.order === undefined) {
      throw new BadRequestException('Module title and order are required');
    }

    // Lookup program containing track to check ownership
    const track = await this.programsService['prisma'].programTrack.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      throw new BadRequestException('ProgramTrack not found');
    }

    await this.programsService.validateProgramOwnership(req.user.id, track.programId, req.user.role as UserRole);
    const module = await this.programsService.addModule(trackId, body);
    return { success: true, module };
  }
}
