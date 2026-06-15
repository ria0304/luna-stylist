import { ChatMessage, WardrobeItem } from '../types';

export function buildSmartReply(
  text: string,
  allItems: WardrobeItem[],
  base: Partial<ChatMessage>
): ChatMessage {
  const lowerText = text.toLowerCase();
  
  // Help suggestions based on keywords
  if (lowerText.includes('help') || lowerText.includes('what can you do')) {
    return {
      ...base,
      text: "I can help you with:\n\n• Finding items in your wardrobe\n• Suggesting outfits for any occasion\n• Analyzing what's missing from your wardrobe\n• Explaining your style profile\n• Answering fashion questions\n\nTry asking something like:\n- 'Show me all my black tops'\n- 'What should I wear for a interview?'\n- 'What am I missing for summer?'\n- 'Why am I a minimalist?'",
      intent: 'chat',
    } as ChatMessage;
  }
  
  // Greeting responses
  if (lowerText.match(/^(hi|hello|hey|greetings)/)) {
    return {
      ...base,
      text: "Hello! 👋 I'm Luna, your personal stylist. How can I help with your wardrobe today?",
      intent: 'chat',
    } as ChatMessage;
  }
  
  // Thank you responses
  if (lowerText.includes('thank')) {
    return {
      ...base,
      text: "You're welcome! 😊 Anything else I can help you with?",
      intent: 'chat',
    } as ChatMessage;
  }
  
  // Weather/clothing suggestions
  if (lowerText.includes('weather') || lowerText.includes('cold') || lowerText.includes('hot') || lowerText.includes('rain')) {
    if (lowerText.includes('cold') || lowerText.includes('winter')) {
      return {
        ...base,
        text: "For cold weather, I recommend layering with sweaters, jackets, and warm fabrics like wool or fleece. Check your wardrobe for:\n• Warm jackets/coats\n• Sweaters and cardigans\n• Long pants/trousers\n• Scarves and accessories\n\nWould you like me to show you specific winter items from your wardrobe?",
        intent: 'chat',
      } as ChatMessage;
    } else if (lowerText.includes('hot') || lowerText.includes('summer')) {
      return {
        ...base,
        text: "For hot weather, look for breathable fabrics like cotton and linen:\n• Lightweight tops and t-shirts\n• Shorts and skirts\n• Sundresses\n• Light colors that reflect heat\n\nWant me to find summer-appropriate items in your wardrobe?",
        intent: 'chat',
      } as ChatMessage;
    }
  }
  
  // Occasion-based suggestions
  if (lowerText.includes('interview') || lowerText.includes('business') || lowerText.includes('work')) {
    return {
      ...base,
      text: "For professional settings like interviews, consider:\n• Neutral colors (black, navy, gray, white)\n• Structured pieces like blazers\n• Conservative cuts and lengths\n• Polished accessories\n\nWould you like me to suggest an outfit from your wardrobe?",
      intent: 'chat',
    } as ChatMessage;
  }
  
  if (lowerText.includes('date') || lowerText.includes('romantic')) {
    return {
      ...base,
      text: "For a date night:\n• Choose something that makes you feel confident\n• Consider the venue (casual vs. fancy)\n• Dark colors or your signature style\n• Add a personal touch with accessories\n\nWant me to find appropriate items in your wardrobe?",
      intent: 'chat',
    } as ChatMessage;
  }
  
  if (lowerText.includes('party') || lowerText.includes('wedding') || lowerText.includes('event')) {
    return {
      ...base,
      text: "For special events:\n• Check the dress code first\n• Consider the season and venue\n• Statement pieces or elegant classics\n• Don't forget comfortable shoes!\n\nI can help you plan an outfit if you tell me more about the event.",
      intent: 'chat',
    } as ChatMessage;
  }
  
  // Fashion advice
  if (lowerText.includes('color') || lowerText.includes('match')) {
    return {
      ...base,
      text: "Color coordination tips:\n• Complementary colors (opposite on color wheel)\n• Monochromatic looks (different shades of same color)\n• Analogous colors (next to each other on wheel)\n• Neutrals (black, white, gray, beige) go with almost anything\n\nWant me to analyze colors in your wardrobe?",
      intent: 'chat',
    } as ChatMessage;
  }
  
  // Default response
  return {
    ...base,
    text: "I'm Luna, your WYA stylist. Try asking:\n\n• \"Show my blue tops\"\n• \"What should I wear to an interview?\"\n• \"What am I missing for summer?\"\n• \"Help me understand my style\"\n• \"What's in my wardrobe?\"",
    intent: 'chat',
  } as ChatMessage;
}
