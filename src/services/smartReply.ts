import { ChatMessage, WardrobeItem } from '../types';

export function buildSmartReply(
  text: string,
  allItems: WardrobeItem[],
  base: Partial<ChatMessage>
): ChatMessage {
  const norm = text.toLowerCase();

  if (norm.includes('help') || norm.includes('what can you do')) {
    return {
      ...base,
      text: `Here's what you can ask me:\n\n• "Show me all my black tops"\n• "What should I wear to college tomorrow?"\n• "What am I missing for winter?"\n• "Why am I a minimalist?"\n\nJust talk to me like you'd text a friend — I'll figure out the rest.`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.match(/^(hi|hello|hey|greetings)/)) {
    return {
      ...base,
      text: `Hey! 👋 What are we wearing today?`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.includes('thank')) {
    return {
      ...base,
      text: `Of course! Anything else?`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.includes('cold') || norm.includes('winter')) {
    return {
      ...base,
      text: `Winter is all about layers — a good coat, something warm underneath, and you're sorted. Want me to check what you already have that works for the cold?`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.includes('hot') || norm.includes('summer')) {
    return {
      ...base,
      text: `For the heat, light fabrics are your best friend — cotton, linen, anything that breathes. Want me to pull up your summer pieces?`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.includes('interview') || norm.includes('business') || norm.includes('work')) {
    return {
      ...base,
      text: `For work or interviews, you want to look put-together without overthinking it — clean fits, nothing too loud. Want me to find something from your wardrobe that works?`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.includes('date') || norm.includes('romantic')) {
    return {
      ...base,
      text: `Wear something that makes you feel like yourself, just slightly elevated. Where are you going — casual or more of a nice dinner situation?`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.includes('party') || norm.includes('wedding') || norm.includes('event')) {
    return {
      ...base,
      text: `Tell me a bit more about the event and I'll help you figure out something from your wardrobe. Dress code? Vibe?`,
      intent: 'chat',
    } as ChatMessage;
  }

  if (norm.includes('color') || norm.includes('colour') || norm.includes('match')) {
    return {
      ...base,
      text: `Honestly the easiest rule — neutrals go with everything, and if you're unsure, stick to one colour in different shades. Want me to look at what colours you already have a lot of?`,
      intent: 'chat',
    } as ChatMessage;
  }

  return {
    ...base,
    text: `Not sure what you mean — try asking something like "show me my tops", "what should I wear tomorrow?", or "what's missing from my wardrobe?"`,
    intent: 'chat',
  } as ChatMessage;
}
