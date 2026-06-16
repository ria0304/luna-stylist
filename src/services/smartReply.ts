import { ChatMessage, WardrobeItem } from '../types';
import { wyaApi } from './api';

export async function buildSmartReply(
  text: string,
  allItems: WardrobeItem[],
  base: Partial<ChatMessage>
): Promise<ChatMessage> {
  const norm = text.toLowerCase().trim();

  // 1. Instant Client-Side Helpers (Low Latency)
  if (norm.includes('help') || norm.includes('what can you do')) {
    return {
      ...base,
      text: `Here's what you can ask me:\n\n- "Show me all my black tops"\n- "What should I wear to college tomorrow?"\n- "What am I missing for winter?"\n- "Why am I a minimalist?"\n\nJust talk to me like you'd text a friend — I'll figure out the rest.`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.match(/^(hi|hello|hey|greetings)/)) {
    return {
      ...base,
      text: `Hello. What are we wearing today?`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.includes('thank')) {
    return {
      ...base,
      text: `You're welcome. Anything else?`,
      intent: 'chat',
    } as ChatMessage;
  }

  // 2. Live Orchestration Pipeline Fallback
  try {
    // Pipeline complex conversational queries straight into the WYA AI orchestrator endpoint
    const backendResponse = await wyaApi.post<{ text: string; outfits?: any[]; gapAnalysis?: any }>(
      '/api/luna/chat', 
      {
        message: text,
        intent: base.intent || 'chat'
      }
    );

    return {
      ...base,
      text: backendResponse.text,
      outfits: backendResponse.outfits,
      gapAnalysis: backendResponse.gapAnalysis,
    } as ChatMessage;

  } catch (error) {
    console.error('SmartReply remote orchestration failed:', error);

    // 3. Strategic Local Context Fallback (If Backend is Offline)
    if (norm.includes('cold') || norm.includes('winter')) {
      return {
        ...base,
        text: `Winter styling relies heavily on clean layers. Want me to scan your wardrobe assets to find heavy fabrics?`,
        intent: 'chat',
      } as ChatMessage;
    }

    if (norm.includes('hot') || norm.includes('summer')) {
      return {
        ...base,
        text: `For higher temperatures, breathable fabrics like linen and lightweight cotton work best. Let me know if you want to look at your seasonal clothing.`,
        intent: 'chat',
      } as ChatMessage;
    }

    if (norm.includes('color') || norm.includes('colour') || norm.includes('match')) {
      return {
        ...base,
        text: `Color coordination works best when balancing core neutrals with high-contrast accent tones. Want to look over your wardrobe's dominant colors?`,
        intent: 'chat',
      } as ChatMessage;
    }

    // Ultimate fallback if no keywords catch and backend network fails
    return {
      ...base,
      text: `I'm having trouble connecting to my styling database right now. Let's try matching some wardrobe pieces or running a quick search in the meantime.`,
      intent: 'chat',
    } as ChatMessage;
  }
}
