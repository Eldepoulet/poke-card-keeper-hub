
import { supabase } from '@/integrations/supabase/client';
import { cardSets } from '@/data/mockData';

export const seedDatabase = async () => {
  try {
    // Check if card sets already exist
    const { data: existingSets, error: checkError } = await supabase
      .from('card_sets')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing sets:', checkError);
      return false;
    }

    if (existingSets && existingSets.length > 0) {
      console.log('Database already has card sets, skipping seeding.');
      return false;
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
      console.error(`Error inserting card sets:`, setsError);
      return false;
    }

    console.log('Successfully inserted card sets, now adding cards...');

    // For each set, insert its cards
    for (const set of cardSets) {
      // Get cards for this set from mock data
      const { getCardsForSet } = await import('@/data/mockData');
      const mockCards = getCardsForSet(set.id);
      
      if (!mockCards || mockCards.length === 0) {
        console.log(`No cards found for set ${set.id}, skipping`);
        continue;
      }
      
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

      // Insert in smaller batches to avoid payload size issues
      const batchSize = 50;
      for (let i = 0; i < formattedCards.length; i += batchSize) {
        const batch = formattedCards.slice(i, i + batchSize);
        const { error: cardsError } = await supabase
          .from('cards')
          .insert(batch);

        if (cardsError) {
          console.error(`Error inserting cards batch for set ${set.id}:`, cardsError);
          // Continue to next batch even if there's an error
        }
      }

      console.log(`Added cards for set: ${set.name}`);
    }

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};
