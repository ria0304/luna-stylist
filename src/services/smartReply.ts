import { ChatMessage, WardrobeItem } from '../types';
import { lunaApi } from './api';

export async function buildSmartReply(
  text: string,
  allItems: WardrobeItem[],
  base: Partial<ChatMessage>,
  token: string
): Promise<ChatMessage> {
  const norm = text.toLowerCase().trim();

  // Instant client-side replies — no network needed
  if (norm.match(/^(hi|hello|hey|hii|heyy|sup|yo)\b/)) {
    return {
      ...base,
      text: `Hey! I'm Luna, your personal stylist. Ask me what to wear, how to style something, or anything fashion — I've got you.`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.includes('thank')) {
    return {
      ...base,
      text: `Anytime! What else are we styling?`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.includes('help') || norm.includes('what can you do')) {
    return {
      ...base,
      text: `Here's what you can ask me:\n\n• "What should I wear to college tomorrow?"\n• "Show me all my black tops"\n• "What am I missing for winter?"\n• "Why am I a minimalist?"\n• "How do I style wide-leg trousers?"\n• "What colors go with burgundy?"\n\nJust talk to me like you'd text a stylist friend.`,
      intent: 'chat',
    } as ChatMessage;
  }

  // Everything else → Luna's LLM backend
  try {
    const result = await lunaApi.chat(text, token, allItems);
    return {
      ...base,
      text: result.reply,
      intent: 'chat',
    } as ChatMessage;
  } catch (error) {
    console.error('Luna LLM call failed:', error);
    return {
      ...base,
      text: `I'm having trouble reaching my AI right now. Try again in a moment — or ask me about outfits, your wardrobe, or style gaps.`,
      intent: 'chat',
    } as ChatMessage;
  }
}
