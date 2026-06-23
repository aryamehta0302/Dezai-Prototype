import { CredentialProvider } from '@/features/credential/store/credential-context';

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <CredentialProvider>{children}</CredentialProvider>;
}
