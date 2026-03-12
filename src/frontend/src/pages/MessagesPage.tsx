import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Loader2, MessageSquare, Plus, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ConversationSummary, Message } from "../backend.d";
import type { backendInterface as ExtendedBackend } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function shortPrincipal(p: { toString(): string }) {
  const s = p.toString();
  return s.length > 10 ? `${s.slice(0, 5)}...${s.slice(-5)}` : s;
}

export default function MessagesPage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as ExtendedBackend;
  const { identity } = useInternetIdentity();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationSummary | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMsgSheetOpen, setNewMsgSheetOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [newContent, setNewContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const callerPrincipal = identity?.getPrincipal().toString();

  const loadConversations = async () => {
    if (!actor || !identity) return;
    try {
      const convs = await actor.getMyConversations();
      setConversations(convs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conv: ConversationSummary) => {
    if (!actor) return;
    try {
      const msgs = await actor.getConversation(conv.otherUser);
      setMessages(
        msgs.sort((a, b) => Number(a.timestamp) - Number(b.timestamp)),
      );
      await actor.markMessagesAsRead(conv.otherUser);
      await loadConversations();
    } catch (e) {
      console.error(e);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    loadConversations();
  }, [actor, identity]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv);
    }
  }, [activeConv?.otherUser?.toString()]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-refresh every 5s
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    const interval = setInterval(async () => {
      await loadConversations();
      if (activeConv) await loadMessages(activeConv);
    }, 5000);
    return () => clearInterval(interval);
  }, [actor, activeConv]);

  const handleSend = async () => {
    if (!actor || !activeConv || !newMsg.trim()) return;
    setSending(true);
    try {
      await actor.sendMessage(activeConv.otherUser, newMsg.trim());
      setNewMsg("");
      await loadMessages(activeConv);
    } catch (e: any) {
      toast.error(e?.message ?? "Error sending");
    } finally {
      setSending(false);
    }
  };

  const handleNewConversation = async () => {
    if (!actor || !newRecipient.trim() || !newContent.trim()) {
      toast.error("Fill all fields");
      return;
    }
    setSending(true);
    try {
      // Try to construct a Principal from the text
      const { Principal } = await import("@icp-sdk/core/principal");
      const recipientPrincipal = Principal.fromText(newRecipient.trim());
      await actor.sendMessage(recipientPrincipal, newContent.trim());
      toast.success("Message sent!");
      setNewMsgSheetOpen(false);
      setNewRecipient("");
      setNewContent("");
      await loadConversations();
    } catch (e: any) {
      toast.error(`Invalid Principal or error sending: ${e?.message ?? ""}`);
    } finally {
      setSending(false);
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-primary opacity-60" />
            <h2 className="font-display text-xl font-bold mb-2">
              Login Required
            </h2>
            <p className="font-body text-muted-foreground">
              Please login to view messages.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container max-w-5xl py-8 px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-black">Messages</h1>
              <p className="font-body text-sm text-muted-foreground mt-0.5">
                Chat with buyers and sellers
              </p>
            </div>
            <Button
              onClick={() => setNewMsgSheetOpen(true)}
              className="font-body font-semibold"
              data-ocid="messages.open_modal_button"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>

          <div
            className="flex border border-border/60 rounded-xl overflow-hidden"
            style={{ height: "60vh" }}
          >
            {/* Conversation list */}
            <div
              className="w-full sm:w-72 border-r border-border/60 flex flex-col"
              style={{ display: activeConv ? "none" : undefined }}
            >
              <div className="p-3 border-b border-border/40">
                <p className="font-body text-sm font-semibold text-muted-foreground">
                  Conversations
                </p>
              </div>
              <ScrollArea className="flex-1">
                {loading ? (
                  <div
                    className="flex justify-center p-8"
                    data-ocid="messages.loading_state"
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div
                    className="text-center p-8 text-muted-foreground font-body text-sm"
                    data-ocid="messages.empty_state"
                  >
                    No conversations yet.
                  </div>
                ) : (
                  conversations.map((conv, idx) => (
                    <button
                      type="button"
                      key={conv.otherUser.toString()}
                      onClick={() => setActiveConv(conv)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left border-b border-border/30",
                        activeConv?.otherUser.toString() ===
                          conv.otherUser.toString() && "bg-primary/5",
                      )}
                      data-ocid={`messages.item.${idx + 1}`}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {conv.otherUser.toString().slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-semibold truncate">
                          {shortPrincipal(conv.otherUser)}
                        </p>
                        <p className="font-body text-xs text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                      {Number(conv.unreadCount) > 0 && (
                        <Badge className="flex-shrink-0 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {String(conv.unreadCount)}
                        </Badge>
                      )}
                    </button>
                  ))
                )}
              </ScrollArea>
            </div>

            {/* Chat panel */}
            <div
              className={cn(
                "flex-1 flex flex-col",
                !activeConv && "hidden sm:flex",
              )}
            >
              {!activeConv ? (
                <div
                  className="flex-1 flex items-center justify-center text-muted-foreground font-body"
                  data-ocid="messages.empty_state"
                >
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Select a conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 border-b border-border/40 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="sm:hidden"
                      onClick={() => setActiveConv(null)}
                      data-ocid="messages.cancel_button"
                    >
                      Back
                    </Button>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {activeConv.otherUser
                          .toString()
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-body text-sm font-semibold">
                      {shortPrincipal(activeConv.otherUser)}
                    </p>
                  </div>
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-2">
                      {messages.map((m) => {
                        const isMine = m.sender.toString() === callerPrincipal;
                        return (
                          <div
                            key={String(m.id)}
                            className={cn(
                              "flex",
                              isMine ? "justify-end" : "justify-start",
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-3 py-2 font-body text-sm",
                                isMine
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-muted rounded-bl-sm",
                              )}
                            >
                              {m.content}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t border-border/40 flex gap-2">
                    <Input
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && !e.shiftKey && handleSend()
                      }
                      placeholder="Type a message..."
                      className="flex-1"
                      data-ocid="messages.input"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={sending || !newMsg.trim()}
                      size="icon"
                      data-ocid="messages.submit_button"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Sheet open={newMsgSheetOpen} onOpenChange={setNewMsgSheetOpen}>
        <SheetContent data-ocid="messages.sheet">
          <SheetHeader>
            <SheetTitle className="font-display font-black">
              New Message
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <p className="font-body text-sm font-semibold mb-1">
                Recipient Principal ID *
              </p>
              <Input
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="xxxxx-xxxxx-..."
                data-ocid="messages.input"
              />
              <p className="font-body text-xs text-muted-foreground mt-1">
                Enter the full Principal ID of the user
              </p>
            </div>
            <div>
              <p className="font-body text-sm font-semibold mb-1">Message *</p>
              <Input
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Type your message..."
                data-ocid="messages.input"
              />
            </div>
            <Button
              onClick={handleNewConversation}
              disabled={sending}
              className="w-full font-body font-semibold"
              data-ocid="messages.submit_button"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
}
