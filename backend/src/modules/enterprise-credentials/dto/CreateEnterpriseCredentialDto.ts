import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ComplianceTrack } from '@prisma/client';

export class CreateEnterpriseCredentialDto {
    @IsString()
    @IsNotEmpty()
    employeeId: string;

    @IsString()
    @IsNotEmpty()
    organizationId: string;

    @IsString()
    @IsOptional()
    complianceAssessmentId?: string;

    @IsEnum(ComplianceTrack)
    @IsNotEmpty()
    complianceTrack: ComplianceTrack;

    @IsString()
    @IsOptional()
    templateId?: string;
}
