import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CredentialService } from "../services/credential.service";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import {
  IssueCredentialDto,
  UpdateCredentialDto,
  UpdateCredentialStatusDto,
} from "../dto/credential.dto";

@Controller("credentials")
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  // ─────────────────── ISSUE CREDENTIAL ───────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN)
  async issueCredential(@Req() req, @Body() dto: IssueCredentialDto) {
    const credential = await this.credentialService.issueCredential(
      req.user.id,
      dto,
    );
    return { success: true, credential };
  }

  // ─────────────────── MY CREDENTIALS ───────────────────

  @Get("my")
  @UseGuards(JwtAuthGuard)
  async getMyCredentials(@Req() req) {
    const credentials = await this.credentialService.getCredentialsByUser(
      req.user.id,
    );
    return { success: true, credentials };
  }

  // ─────────────────── PUBLIC VERIFICATION ───────────────────

  @Get("verify/:code")
  async verifyCredential(@Param("code") code: string) {
    const credential = await this.credentialService.verifyByCode(code);
    return { success: true, credential };
  }

  // ─────────────────── CREDENTIALS BY PROGRAM ───────────────────

  @Get("program/:programId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN)
  async getByProgram(@Param("programId") programId: string) {
    const credentials =
      await this.credentialService.getCredentialsByProgram(programId);
    return { success: true, credentials };
  }

  // ─────────────────── GET BY ID ───────────────────

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getById(@Param("id") id: string, @Req() req) {
    const credential = await this.credentialService.getCredentialById(
      id,
      req.user.id,
      req.user.role as UserRole,
    );
    return { success: true, credential };
  }

  // ─────────────────── UPDATE CREDENTIAL ───────────────────

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN)
  async updateCredential(
    @Param("id") id: string,
    @Req() req,
    @Body() dto: UpdateCredentialDto,
  ) {
    const credential = await this.credentialService.updateCredential(
      id,
      dto,
      req.user.id,
      req.user.role as UserRole,
    );
    return { success: true, credential };
  }

  // ─────────────────── UPDATE STATUS ───────────────────

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN)
  async updateStatus(
    @Param("id") id: string,
    @Req() req,
    @Body() dto: UpdateCredentialStatusDto,
  ) {
    const credential = await this.credentialService.updateStatus(
      id,
      dto.status,
      req.user.id,
      req.user.role as UserRole,
    );
    return { success: true, credential };
  }

  // ─────────────────── DELETE CREDENTIAL ───────────────────

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async deleteCredential(@Param("id") id: string, @Req() req) {
    await this.credentialService.deleteCredential(
      id,
      req.user.id,
      req.user.role as UserRole,
    );
    return { success: true, message: "Credential deleted" };
  }
}
