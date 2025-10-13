import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ChatInterface from "@/components/chat/ChatInterface";

interface Conversation {
  client_id: string;
  client_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = async () => {
    try {
      const { data: clientsList, error: clientsError } = await supabase
        .from('clients')
        .select('user_id, full_name');

      if (clientsError) throw clientsError;

      const mockConversations: Conversation[] = (clientsList || []).map(client => ({
        client_id: client.user_id,
        client_name: client.full_name || 'Nepoznato ime',
        last_message: 'Početak razgovora',
        last_message_time: new Date().toISOString(),
        unread_count: 0
      }));

      setConversations(mockConversations);
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Neuspješno dohvaćanje razgovora",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Poruke">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-lg">Učitavam poruke...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Poruke">
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Conversations List */}
        <Card className="w-80 flex flex-col border-r">
          <CardHeader className="border-b">
            <CardTitle>Razgovori</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {conversations
                  .filter(conv => 
                    conv.client_name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((conversation) => (
                  <div
                    key={conversation.client_id}
                    className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                      selectedClient === conversation.client_id
                        ? 'bg-primary/10 border-2 border-primary/30'
                        : 'border-2 border-transparent'
                    }`}
                    onClick={() => {
                      setSelectedClient(conversation.client_id);
                      setSelectedClientName(conversation.client_name);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {conversation.client_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {conversation.client_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.last_message}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-xs text-primary-foreground font-semibold">
                            {conversation.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {conversations.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Nemate aktivnih razgovora</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        {selectedClient && user?.id ? (
          <div className="flex-1 flex">
            <ChatInterface
              currentUserId={user.id}
              otherUserId={selectedClient}
              otherUserName={selectedClientName}
            />
          </div>
        ) : (
          <Card className="flex-1 flex flex-col">
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-lg">Odaberite razgovor za početak chata</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
