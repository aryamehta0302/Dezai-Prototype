import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { UpdateCredentialStateDto } from '../dto/update-credential-state.dto';
import { VerifyStatus } from '@prisma/client';

@Injectable()
export class CredentialStateService {
  constructor(private readonly credentialsRepository: CredentialsRepository) { }

  async updateCredentialState(id: string, dto: UpdateCredentialStateDto, actorId: string) {
    const cred = await this.credentialsRepository.findCredential({ id });
    if (!cred) throw new NotFoundException('Credential not found');

    let newVerifyStatus: VerifyStatus = cred.verificationStatus;
    let newMetadata = cred.metadata ? JSON.parse(cred.metadata) : {};

    // Expected values: GRANT, REVOKE, FREEZE, SET_LIMIT, TAG, PERMANENT_FREEZE, DELETE
    switch (dto.action) {
      case 'GRANT':
        newVerifyStatus = VerifyStatus.ACTIVE;
        break;
      case 'REVOKE':
        newVerifyStatus = VerifyStatus.REVOKED;
        break;
      case 'FREEZE':
        newVerifyStatus = VerifyStatus.SUSPENDED;
        break;
      case 'SET_LIMIT':
        if (dto.limit !== undefined) {
          newMetadata.limit = dto.limit;
        } else {
          throw new BadRequestException('limit is required for SET_LIMIT action');
        }
        break;
      case 'TAG':
        if (dto.tags && Array.isArray(dto.tags)) {
          newMetadata.tags = [...(newMetadata.tags || []), ...dto.tags];
        } else {
          throw new BadRequestException('tags array is required for TAG action');
        }
        break;
      case 'PERMANENT_FREEZE':
        newVerifyStatus = VerifyStatus.REVOKED;
        newMetadata.permanentFreeze = true;
        break;
      case 'DELETE':
        // Soft delete equivalent
        newVerifyStatus = VerifyStatus.REVOKED;
        newMetadata.deleted = true;
        break;
      default:
        throw new BadRequestException(`Invalid action: ${dto.action}`);
    }

    return this.credentialsRepository.updateCredential(
      { id },
      {
        verificationStatus: newVerifyStatus,
        metadata: JSON.stringify(newMetadata),
        logs: {
          create: {
            actorId,
            action: `STATE_${dto.action}`,
            statusFrom: cred.verificationStatus,
            statusTo: newVerifyStatus,
            notes: `Admin performed ${dto.action}`
          }
        }
      }
    );
  }

  async getCredentialLogs(id: string) {
    return this.credentialsRepository.findCredentialLogs(id);
  }
}
