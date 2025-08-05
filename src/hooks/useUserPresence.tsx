import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserPresence = (userId: string) => {
  useEffect(() => {
    if (!userId) return;

    const updatePresence = async (isOnline: boolean) => {
      try {
        // Check if user presence record exists
        const { data: existingPresence } = await supabase
          .from('user_presence')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existingPresence) {
          // Update existing record
          await supabase
            .from('user_presence')
            .update({
              is_online: isOnline,
              last_seen: new Date().toISOString()
            })
            .eq('user_id', userId);
        } else {
          // Create new record
          await supabase
            .from('user_presence')
            .insert({
              user_id: userId,
              is_online: isOnline,
              last_seen: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Error updating user presence:', error);
      }
    };

    // Set user as online when component mounts
    updatePresence(true);

    // Update presence every 30 seconds while active
    const interval = setInterval(() => {
      updatePresence(true);
    }, 30000);

    // Set user as offline when they leave
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence(false);
      } else {
        updatePresence(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updatePresence(false);
    };
  }, [userId]);
};