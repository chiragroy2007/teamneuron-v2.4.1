import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('Prune conversations function initialized');

serve(async (req) => {
  try {
    const { record } = await req.json();
    const userId = record.user_id;

    if (!userId) {
      throw new Error('User ID is missing in the webhook payload.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get all conversations for the user
    const { data: conversations, error: fetchError } = await supabaseAdmin
      .from('conversations')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    // 2. Check if the number of conversations exceeds the limit (7)
    const CONVERSATION_LIMIT = 7;
    if (conversations && conversations.length > CONVERSATION_LIMIT) {
      // 3. Find the oldest conversation to delete
      const oldestConversation = conversations[conversations.length - 1];
      
      // 4. Delete the oldest conversation
      const { error: deleteError } = await supabaseAdmin
        .from('conversations')
        .delete()
        .eq('id', oldestConversation.id);

      if (deleteError) throw deleteError;

      console.log(`Successfully pruned conversation ${oldestConversation.id} for user ${userId}`);
    }

    return new Response(JSON.stringify({ message: 'Pruning check complete.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in prune-conversations function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
