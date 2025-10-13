import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadCount = (userId: string, conversationId: string) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId || !conversationId) return;

    const fetchUnread = async () => {
      const { count } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .eq("conversation_id", conversationId)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    };

    fetchUnread();

    const channel = supabase
      .channel(`unread-count-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, conversationId]);

  return unreadCount;
};