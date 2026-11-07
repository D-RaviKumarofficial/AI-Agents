import { createRoot } from 'react-dom/client';
import { ChatWidget } from '../src/chat-widget.js';

// A fake "backend" for a pretend pet shop, to show the widget needs nothing from this project.
async function onSend(text) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const lower = text.toLowerCase();
  if (lower.includes('hours')) {
    return { reply: 'We are open 9:00 to 18:00, Monday to Saturday.', suggestions: ['Where is my order?'] };
  }
  if (lower.includes('order')) {
    return {
      reply: 'Your order ships within two days.',
      items: [{
        id: 'o1', title: 'Order #1042', badge: 'Shipped',
        actions: [{ id: 'track', label: 'Track' }],
        href: 'https://example.test/orders/1042', linkLabel: 'Order page',
      }],
    };
  }
  return { reply: 'Sorry, I only know our opening hours and order status.', suggestions: ['What are your hours?', 'Where is my order?'] };
}

createRoot(document.getElementById('root')).render(
  <ChatWidget
    title="Pet Shop Help"
    subtitle="Demo with a fake backend"
    welcomeMessage="Hi! Ask about opening hours or an order."
    suggestions={['What are your hours?', 'Where is my order?']}
    placeholder="Ask the pet shop"
    onSend={onSend}
    onItemAction={(action, item) => alert(`${action} -> ${item.title}`)}
  />,
);
