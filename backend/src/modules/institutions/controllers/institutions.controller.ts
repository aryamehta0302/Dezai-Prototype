import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InstitutionsService } from '../services/institutions.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateInstitutionDto,
  UpdateInstitutionDto,
  UpdateFacultyVerificationDto,
} from '../dto/institution.dto';

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  /**
   * GET /api/institutions
   * List all institutions. Supports optional filters: ?country=India&state=Gujarat&city=Vadodara
   * Public — used by student institution selection UI.
   */
  @Get()
  async getInstitutions(
    @Query('country') country?: string,
    @Query('state') state?: string,
    @Query('city') city?: string,
  ) {
    return this.institutionsService.getInstitutions({ country, state, city });
  }

  /**
   * GET /api/institutions/locations
   * Returns distinct geographic values for cascading dropdowns.
   * ?country=India              → returns { states: [...] }
   * ?country=India&state=Gujarat → returns { cities: [...] }
   * (no params)                 → returns { countries: [...] }
   * Public — used by student institution selection UI.
   *
   * NOTE: This static route MUST be declared before /:id to avoid
   * NestJS matching "locations" as the :id parameter.
   */
  @Get('locations')
  async getLocations(
    @Query('country') country?: string,
    @Query('state') state?: string,
  ) {
    return this.institutionsService.getLocations({ country, state });
  }

  /**
   * POST /api/institutions
   * Create a new institution.
   * Protected — DEZAI_ADMIN only.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createInstitution(@Body() body: CreateInstitutionDto) {
    return this.institutionsService.createInstitution(body);
  }

  /**
   * PATCH /api/institutions/faculty/:facultyMemberId/verify
   * Update a faculty member's verification status (PENDING → APPROVED | REJECTED).
   * Protected — UNIVERSITY_ADMIN (same institution) or DEZAI_ADMIN.
   *
   * NOTE: This specific nested route MUST be declared before /:id and /:id/faculty
   * to prevent NestJS from treating "faculty" as an :id value.
   */
  @Patch('faculty/:facultyMemberId/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async verifyFaculty(
    @Req() req,
    @Param('facultyMemberId') facultyMemberId: string,
    @Body() body: UpdateFacultyVerificationDto,
  ) {
    return this.institutionsService.updateFacultyVerificationStatus(
      req.user.id,
      req.user.role,
      facultyMemberId,
      body.verificationStatus,
    );
  }

  /**
   * GET /api/institutions/:id
   * Get a single institution by ID with faculty and admins.
   * Protected — authenticated users only.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getInstitutionById(@Param('id') id: string) {
    return this.institutionsService.getInstitutionById(id);
  }

  /**
   * PATCH /api/institutions/:id
   * Update institution details.
   * Protected — DEZAI_ADMIN only.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async updateInstitution(
    @Param('id') id: string,
    @Body() body: UpdateInstitutionDto,
  ) {
    return this.institutionsService.updateInstitution(id, body);
  }

  /**
   * GET /api/institutions/:id/faculty
   * List all faculty members for a specific institution.
   * Protected — UNIVERSITY_ADMIN and DEZAI_ADMIN only.
   * Supports optional filter: ?status=PENDING | APPROVED | REJECTED
   */
  @Get(':id/faculty')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getFacultyByInstitution(
    @Param('id') id: string,
    @Query('status') status?: string,
  ) {
    if (status) {
      return this.institutionsService.getFacultyByStatus(id, status as any);
    }
    return this.institutionsService.getFacultyByInstitution(id);
  }
}
