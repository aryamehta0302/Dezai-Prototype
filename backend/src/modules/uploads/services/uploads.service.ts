import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Register a new upload record in the database.
   * Supports polymorphic links using entityType/entityId (e.g. LessonResource).
   */
  async createUpload(data: {
    userId: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    sizeBytes: number;
    entityType?: string;
    entityId?: string;
  }) {
    return this.prisma.upload.create({
      data: {
        userId: data.userId,
        fileName: data.fileName,
        fileType: data.fileType,
        fileUrl: data.fileUrl,
        sizeBytes: data.sizeBytes,
        entityType: data.entityType,
        entityId: data.entityId,
      },
    });
  }

  /**
   * Fetch all uploaded files linked to a specific entity.
   */
  async getUploadsForEntity(entityType: string, entityId: string) {
    return this.prisma.upload.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Helper to delete an upload record from the database.
   */
  async deleteUpload(id: string) {
    return this.prisma.upload.delete({
      where: { id },
    });
  }
}
