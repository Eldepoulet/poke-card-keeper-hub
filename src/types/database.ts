
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

// Card set types
export type CardSet = Tables<"card_sets">;
export type CardSetWithCollectionStats = CardSet & {
  collectedCards: number;
};

// Card types
export type Card = Tables<"cards">;
export type CardWithCollectionStatus = Card & {
  owned: boolean;
};

// User collection types
export type UserCollection = Tables<"user_collections">;
export type GameCollection = {
  id: string;
  user_id: string;
  card_id: string;
  collected_at: string;
};

// Create helper functions to handle game collection operations
export async function getUserGameCollection(userId: string): Promise<{ data: GameCollection[] | null; error: any }> {
  try {
    // Use the supabase client directly instead of REST API
    const { data, error } = await supabase
      .from('game_collections')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching game collection:", error);
    return { data: null, error };
  }
}

export async function getGameCollectionCount(userId: string): Promise<{ count: number; error: any }> {
  try {
    // Use the supabase client directly instead of REST API
    const { count, error } = await supabase
      .from('game_collections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error("Error fetching game collection count:", error);
    return { count: 0, error };
  }
}

export async function addCardToGameCollection(userId: string, cardId: string): Promise<{ error: Error | null }> {
  try {
    // Use the supabase client directly instead of REST API
    const { error } = await supabase
      .from('game_collections')
      .insert([
        { user_id: userId, card_id: cardId }
      ]);
    
    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error("Error adding card to collection:", error);
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}
