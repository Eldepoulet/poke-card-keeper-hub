
import { supabase } from '@/integrations/supabase/client';
import { cardSets } from '@/data/mockData';

export const seedDatabase = async () => {
  try {
    // Check if card sets already exist
    const { data: existingSets } = await supabase
      .from('card_sets')
      .select('id')
      .limit(1);

    if (existingSets && existingSets.length > 0) {
      console.log('Database already has card sets, skipping seeding.');
      return;
    }

    console.log('Seeding database with sample data...');

    // Insert card sets
    const formattedSets = cardSets.map(set => ({
      id: set.id,
      name: set.name,
      release_date: set.releaseDate,
      total_cards: set.totalCards,
      image_url: set.imageUrl,
      description: set.description || ''
    }));

    const { error: setsError } = await supabase
      .from('card_sets')
      .insert(formattedSets);

    if (setsError) {
      throw new Error(`Error inserting card sets: ${setsError.message}`);
    }

    // For each set, insert its cards
    for (const set of cardSets) {
      // Get cards for this set from mock data
      const { getCardsForSet } = await import('@/data/mockData');
      const mockCards = getCardsForSet(set.id);
      
      const formattedCards = mockCards.map(card => ({
        id: card.id,
        name: card.name,
        number: card.number,
        image_url: card.imageUrl,
        rarity: card.rarity,
        type: card.type,
        set_id: set.id,
        description: card.description || null,
        attacks: card.attacks || null,
        hp: card.hp || null
      }));

      const { error: cardsError } = await supabase
        .from('cards')
        .insert(formattedCards);

      if (cardsError) {
        throw new Error(`Error inserting cards for set ${set.id}: ${cardsError.message}`);
      }
    }

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};
