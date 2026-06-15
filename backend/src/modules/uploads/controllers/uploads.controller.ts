import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UploadsService } from '../services/uploads.service';
import { extname } from 'path';

// Quick inline multer option to keep files in memory (safe and self-healing for V1)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * POST /api/uploads
   * Uploads a file and logs its details in the DB.
   * Can be linked immediately to an entity (e.g., entityType="LessonResource", entityId="<lesson-uuid>").
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Req() req,
    @Body() body: { entityType?: string; entityId?: string }
  ) {
    const userId = req.user.id;

    // In production, files would go to S3 or a public volume.
    // For V1, we return a virtual static asset URL path.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = file?.originalname || 'resource.dat';
    const extension = extname(fileName);
    const fileUrl = `/static/uploads/${uniqueSuffix}${extension}`;

    const upload = await this.uploadsService.createUpload({
      userId,
      fileName,
      fileType: file?.mimetype || 'application/octet-stream',
      fileUrl,
      sizeBytes: file?.size || 0,
      entityType: body.entityType,
      entityId: body.entityId,
    });

    return {
      success: true,
      url: fileUrl,
      upload,
    };
  }

  /**
   * GET /api/uploads/entity/:type/:id
   * Lists all uploaded files attached to a target entity (e.g. LessonResource, ProgramLogo).
   */
  @Get('entity/:type/:id')
  @UseGuards(JwtAuthGuard)
  async getEntityUploads(@Param('type') type: string, @Param('id') id: string) {
    const uploads = await this.uploadsService.getUploadsForEntity(type, id);
    return {
      success: true,
      uploads,
    };
  }
}
