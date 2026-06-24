import { GenerationView } from '@/features/credentials/pages/generation-view';

export default function Page({ params }: { params: { type: string, id: string } }) {
  // Assuming we get userId from auth session, hardcoding for prototype
  const mockUserId = "test-user-id"; 
  
  return <GenerationView type={params.type as 'program' | 'assessment'} id={params.id} userId={mockUserId} />;
}
