/**
 * AI Mentor Chat Route
 * Path: /(student)/chat
 */

import { ChatPage } from '@/features/ai-mentor';

export const metadata = {
  title: 'AI Mentor | Dezai',
  description: 'Learn with AI-powered mentoring',
};

export default function Page() {
  return <ChatPage />;
}
