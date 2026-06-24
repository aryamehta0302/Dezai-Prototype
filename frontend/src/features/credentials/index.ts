/**
 * @module features/credentials
 * Credential infrastructure, issuance & verification feature.
 */

// Types
export type { Credential, PublicCredential, CredentialTier, VerifyStatus, TierDisplayInfo, CredentialSearchParams, SearchResult, ActivityEntry, ActivityFeedResult, EnhancedAnalytics } from './types/credential.types';
export { CREDENTIAL_TIER_CONFIG } from './types/credential.types';

// Service
export { credentialService, CredentialService } from './services/credential.service';

// Hooks
export { useCredentials } from './hooks/useCredentials';
export { useCredentialVerify } from './hooks/useCredentialVerify';
export { useVerification } from './hooks/useVerification';
export { useCredentialContext, CredentialProvider } from './context/CredentialContext';

// Components
export { CredentialCard } from './components/CredentialCard';
export { CredentialStatusBadge } from './components/CredentialStatusBadge';
export { StatusBadge } from './components/StatusBadge';
export { InfoRow } from './components/InfoRow';
export { FacultyCredentialTable } from './components/FacultyCredentialTable';
export { IssueCredentialModal } from './components/IssueCredentialModal';
export { RevocationModal } from './components/RevocationModal';
export { CredentialAuditPanel } from './components/CredentialAuditPanel';
export { VerificationLookup } from './components/VerificationLookup';
export { CredentialActivityFeed } from './components/CredentialActivityFeed';

// Pages
export { CredentialVerifyPage } from './pages/CredentialVerifyPage';
export { CredentialLookupPage } from './pages/CredentialLookupPage';
export { FacultyCredentialDashboard } from './pages/FacultyCredentialDashboard';
export { StudentCredentialCenter } from './pages/StudentCredentialCenter';
export { VerificationPortal } from './pages/VerificationPortal';
export { CredentialStatsPage } from './pages/CredentialStatsPage';
export { UniversityCredentialDashboard } from './pages/UniversityCredentialDashboard';
export { AdminCredentialDashboard } from './pages/AdminCredentialDashboard';
