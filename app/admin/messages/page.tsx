import MessageForm from "@/components/features/messages/MessageForm";
import MessageList from "@/components/features/messages/MessageList";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Messages</h1>
      <MessageForm />
      <MessageList />
    </div>
  );
}

