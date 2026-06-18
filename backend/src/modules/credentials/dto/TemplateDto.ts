export enum CredentialType {
    PROGRAM = 'PROGRAM',
    ASSESSMENT = 'ASSESSMENT',
    MERIT = 'MERIT',
}

export interface CredentialTemplateDto {
    id: string;
    type: CredentialType;
    name: string;
    description: string;
    defaultTier: string;
    institutionId: string;
    metadata?: any;
}
