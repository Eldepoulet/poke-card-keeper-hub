
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
