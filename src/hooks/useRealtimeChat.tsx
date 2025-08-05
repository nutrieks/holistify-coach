import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TypingUser {
  userId: string;
  name: string;
}

export const useRealtimeChat = (currentUserId: string, conversationId: string) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const presenceChannelRef = useRef<any>();

  // Initialize presence tracking
  useEffect(() => {
    if (!currentUserId || !conversationId) return;

    // Create a unique channel for this conversation
    const channelName = `chat-${conversationId}`;
    
    const channel = supabase.channel(channelName);
    presenceChannelRef.current = channel;

    // Track user presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = new Set(Object.keys(state));
        setOnlineUsers(online);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers(prev => new Set([...prev, key]));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
        // Remove from typing users when user leaves
        setTypingUsers(prev => prev.filter(user => user.userId !== key));
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { userId, name, isTyping } = payload;
        
        if (userId === currentUserId) return; // Ignore own typing events
        
        setTypingUsers(prev => {
          const filtered = prev.filter(user => user.userId !== userId);
          return isTyping ? [...filtered, { userId, name }] : filtered;
        });
        
        // Auto-remove typing indicator after 3 seconds
        if (isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(user => user.userId !== userId));
          }, 3000);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user as online
          await channel.track({
            userId: currentUserId,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, conversationId]);

  // Function to send typing indicator
  const sendTypingIndicator = (isTyping: boolean, userName: string) => {
    if (!presenceChannelRef.current) return;

    presenceChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: currentUserId,
        name: userName,
        isTyping
      }
    });
  };

  // Debounced typing indicator
  const handleTyping = (userName: string) => {
    sendTypingIndicator(true, userName);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false, userName);
    }, 2000);
  };

  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers,
    onlineUsers,
    handleTyping,
    sendTypingIndicator
  };
};