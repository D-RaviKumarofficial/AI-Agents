import { ChatWidget } from 'rea-chat-widget';
import 'rea-chat-widget/style.css';
import { api } from '../api.js';
import { accessLabel, toPieces, ASSISTANT_COPY } from '../lib/assistantAdapter.mjs';

/**
 * The services assistant for this app: the reusable chat widget plus this app's wording,
 * its `/v1/chat` endpoint, and what the "View details" / "Start service" buttons do.
 */
export default function ServicesAssistant({ open, onOpenChange, onViewService, onStartService }) {
  const onItemAction = (actionId, item) => {
    if (actionId === 'view') onViewService(item.id);
    if (actionId === 'start') onStartService(item.id);
  };
  return (
    <ChatWidget
      open={open}
      onOpenChange={onOpenChange}
      onSend={(text, history) => toPieces(api.chatStream(text, history))}
      onTranscribe={async blob => (await api.transcribe(blob)).text}
      onItemAction={onItemAction}
      title={ASSISTANT_COPY.title}
      subtitle={ASSISTANT_COPY.subtitle}
      placeholder={ASSISTANT_COPY.placeholder}
      labels={ASSISTANT_COPY.labels}
      className="services-assistant"
    />
  );
}

export { accessLabel };
