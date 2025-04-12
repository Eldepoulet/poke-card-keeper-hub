import { supabase } from '@/integrations/supabase/client';

// Sample data for seeding
const sampleCardSets = [
  {
    id: 'swsh1',
    name: 'Sword & Shield',
    release_date: '2020-02-07',
    total_cards: 202,
    image_url: 'https://images.pokemontcg.io/swsh1/logo.png',
    description: 'The first Sword & Shield expansion'
  },
  {
    id: 'swsh7',
    name: 'Evolving Skies',
    release_date: '2021-08-27',
    total_cards: 237,
    image_url: 'https://images.pokemontcg.io/swsh7/logo.png',
    description: 'Evolving Skies expansion'
  }
];

const sampleCards = {
  swsh1: [
    {
      id: 'swsh1-1',
      name: 'Grookey',
      number: '1/202',
      image_url: 'https://images.pokemontcg.io/swsh1/1.png',
      rarity: 'Common',
      type: 'Grass',
      set_id: 'swsh1',
      description: 'When a branch falls from a tree, it grows into a new Grookey.',
      hp: 70
    }
  ],
  swsh7: [
    {
      id: 'swsh7-1',
      name: 'Rayquaza V',
      number: '1/237',
      image_url: 'https://images.pokemontcg.io/swsh7/1.png',
      rarity: 'Ultra Rare',
      type: 'Dragon',
      set_id: 'swsh7',
      description: 'Rayquaza is said to have lived for hundreds of millions of years.',
      hp: 220,
      attacks: [
        {
          name: 'Dragon Pulse',
          damage: '120',
          text: 'Discard 2 Energy from this Pokémon.'
        }
      ]
    }
  ]
};

export const seedDatabase = async (forceReset = false) => {
  try {
    console.log('Seeding database, force reset:', forceReset);
    
    if (forceReset) {
      console.log('Force reset requested, clearing existing data...');
      
      // Delete data from user_collections first due to foreign key constraints
      const { error: deleteCollectionsError } = await supabase
        .from('user_collections')
        .delete()
        .not('id', 'is', null);
      
      if (deleteCollectionsError) {
        console.error('Error deleting user collections:', deleteCollectionsError);
      }
      
      // Delete data from cards next due to foreign key constraints
      const { error: deleteCardsError } = await supabase
        .from('cards')
        .delete()
        .not('id', 'is', null);
      
      if (deleteCardsError) {
        console.error('Error deleting cards:', deleteCardsError);
      }
      
      // Then delete card sets
      const { error: deleteSetsError } = await supabase
        .from('card_sets')
        .delete()
        .not('id', 'is', null);
      
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
        const setIdsToCheck = ['swsh1', 'swsh7'];
        
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
    const { error: setsError } = await supabase
      .from('card_sets')
      .insert(sampleCardSets);

    if (setsError) {
      console.error(`Error inserting card sets:`, setsError);
      return false;
    }

    console.log('Successfully inserted card sets, now adding cards...');

    // For each set, insert its cards
    for (const set of sampleCardSets) {
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
    const cards = sampleCards[setId as keyof typeof sampleCards];
    
    if (!cards || cards.length === 0) {
      console.log(`No cards found for set ${setId}, skipping`);
      return false;
    }
    
    console.log(`Adding ${cards.length} cards for set: ${setId}`);
    
    // Insert in smaller batches to avoid payload size issues
    const batchSize = 50;
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize);
      const { error: cardsError } = await supabase
        .from('cards')
        .insert(batch);

      if (cardsError) {
        console.error(`Error inserting cards batch for set ${setId}:`, cardsError);
        // Continue to next batch even if there's an error
      } else {
        console.log(`Added batch ${i/batchSize + 1}/${Math.ceil(cards.length/batchSize)} for set ${setId}`);
      }
    }

    return true;
  } catch (error) {
    console.error(`Error seeding cards for set ${setId}:`, error);
    return false;
  }
};
