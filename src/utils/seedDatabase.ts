
import { supabase } from '@/integrations/supabase/client';
import { cardSets } from '@/data/mockData';

export const seedDatabase = async (forceReset = false) => {
  try {
    console.log('Seeding database, force reset:', forceReset);
    
    if (forceReset) {
      console.log('Force reset requested, clearing existing data...');
      
      // Delete data from user_collections first due to foreign key constraints
      const { error: deleteCollectionsError } = await supabase
        .from('user_collections')
        .delete()
        .not('id', 'is', null); // Delete all collections
      
      if (deleteCollectionsError) {
        console.error('Error deleting user collections:', deleteCollectionsError);
      }
      
      // Delete data from cards next due to foreign key constraints
      const { error: deleteCardsError } = await supabase
        .from('cards')
        .delete()
        .not('id', 'is', null); // Delete all cards
      
      if (deleteCardsError) {
        console.error('Error deleting cards:', deleteCardsError);
      }
      
      // Then delete card sets
      const { error: deleteSetsError } = await supabase
        .from('card_sets')
        .delete()
        .not('id', 'is', null); // Delete all sets
      
      if (deleteSetsError) {
        console.error('Error deleting card sets:', deleteSetsError);
      }
      
      console.log('Existing data cleared, proceeding with seeding...');
    } else {
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
        console.log('Database already has card sets, checking if we need to seed cards...');
        
        // Check if specific set has cards
        const setIdsToCheck = ['swsh1', 'swsh7']; // Add important sets to check here
        
        for (const setId of setIdsToCheck) {
          const { data: existingCards, error: cardsCheckError } = await supabase
            .from('cards')
            .select('id')
            .eq('set_id', setId)
            .limit(1);
            
          if (cardsCheckError) {
            console.error(`Error checking cards for set ${setId}:`, cardsCheckError);
            continue;
          }
          
          if (!existingCards || existingCards.length === 0) {
            console.log(`No cards found for set ${setId}, will seed cards for this set...`);
            await seedCardsForSet(setId);
          } else {
            console.log(`Cards already exist for set ${setId}, skipping...`);
          }
        }
        
        return true;
      }
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
      await seedCardsForSet(set.id);
    }

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};

// Helper function to seed cards for a specific set
const seedCardsForSet = async (setId: string) => {
  try {
    // Get cards for this set from mock data
    const { getCardsForSet } = await import('@/data/mockData');
    const mockCards = getCardsForSet(setId);
    
    if (!mockCards || mockCards.length === 0) {
      console.log(`No cards found for set ${setId}, skipping`);
      return false;
    }
    
    console.log(`Adding ${mockCards.length} cards for set: ${setId}`);
    
    const formattedCards = mockCards.map(card => ({
      id: card.id,
      name: card.name,
      number: card.number,
      image_url: card.imageUrl,
      rarity: card.rarity,
      type: card.type,
      set_id: setId,
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
        console.error(`Error inserting cards batch for set ${setId}:`, cardsError);
        // Continue to next batch even if there's an error
      } else {
        console.log(`Added batch ${i/batchSize + 1}/${Math.ceil(formattedCards.length/batchSize)} for set ${setId}`);
      }
    }

    return true;
  } catch (error) {
    console.error(`Error seeding cards for set ${setId}:`, error);
    return false;
  }
};
