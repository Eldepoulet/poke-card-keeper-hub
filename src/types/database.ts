
import { Tables } from "@/integrations/supabase/types";

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
export async function getUserGameCollection(userId: string) {
  const { data, error } = await fetch(`https://owwtcjvkmwykcjqgdlsn.supabase.co/rest/v1/game_collections?user_id=eq.${userId}&select=*`, {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93d3RjanZrbXd5a2NqcWdkbHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NzQ3MDUsImV4cCI6MjA2MDA1MDcwNX0.1yiZ7jn6oV3ktXoiZRJYJPl2ETZvbxbO_51bzv1GyVM',
      'Content-Type': 'application/json'
    }
  }).then(res => res.json());
  
  return { data, error };
}

export async function getGameCollectionCount(userId: string) {
  const { data, error } = await fetch(`https://owwtcjvkmwykcjqgdlsn.supabase.co/rest/v1/game_collections?user_id=eq.${userId}&select=count`, {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93d3RjanZrbXd5a2NqcWdkbHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NzQ3MDUsImV4cCI6MjA2MDA1MDcwNX0.1yiZ7jn6oV3ktXoiZRJYJPl2ETZvbxbO_51bzv1GyVM',
      'Content-Type': 'application/json',
      'Prefer': 'count=exact'
    }
  }).then(res => {
    const count = res.headers.get('content-range')?.split('/')[1] || '0';
    return { count: parseInt(count, 10), error: null };
  }).catch(error => {
    return { count: 0, error };
  });
  
  return { count: data?.count || 0, error };
}

export async function addCardToGameCollection(userId: string, cardId: string) {
  const response = await fetch('https://owwtcjvkmwykcjqgdlsn.supabase.co/rest/v1/game_collections', {
    method: 'POST',
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93d3RjanZrbXd5a2NqcWdkbHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NzQ3MDUsImV4cCI6MjA2MDA1MDcwNX0.1yiZ7jn6oV3ktXoiZRJYJPl2ETZvbxbO_51bzv1GyVM',
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      user_id: userId,
      card_id: cardId
    })
  });
  
  const error = response.ok ? null : new Error('Failed to add card to collection');
  return { error };
}
