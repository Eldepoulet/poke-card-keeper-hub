// Mock data for Pokemon card sets
export const cardSets = [
  {
    id: 'swsh1',
    name: 'Sword & Shield Base Set',
    releaseDate: 'Feb 7, 2020',
    totalCards: 202,
    collectedCards: 120,
    imageUrl: 'https://images.pokemontcg.io/swsh1/logo.png',
    description: 'The Sword & Shield Base Set includes Pokémon V and Pokémon VMAX, powerful cards that showcase Dynamax and Gigantamax Pokémon from the Galar region.'
  },
  {
    id: 'swsh2',
    name: 'Rebel Clash',
    releaseDate: 'May 1, 2020',
    totalCards: 209,
    collectedCards: 80,
    imageUrl: 'https://images.pokemontcg.io/swsh2/logo.png',
    description: 'Rebel Clash expands on the Sword & Shield series with more Pokémon V and Pokémon VMAX cards, including powerful Trainer cards featuring characters from Sword & Shield.'
  },
  {
    id: 'swsh3',
    name: 'Darkness Ablaze',
    releaseDate: 'Aug 14, 2020',
    totalCards: 189,
    collectedCards: 150,
    imageUrl: 'https://images.pokemontcg.io/swsh3/logo.png',
    description: 'Darkness Ablaze features Charizard VMAX and many other powerful Pokémon V and VMAX from the Galar region.'
  },
  {
    id: 'swsh4',
    name: 'Vivid Voltage',
    releaseDate: 'Nov 13, 2020',
    totalCards: 185,
    collectedCards: 40,
    imageUrl: 'https://images.pokemontcg.io/swsh4/logo.png',
    description: 'Vivid Voltage introduces Amazing Rare Pokémon, featuring rainbow-colored artwork and multiple types of Energy, as well as Pikachu VMAX.'
  },
  {
    id: 'swsh5',
    name: 'Battle Styles',
    releaseDate: 'Mar 19, 2021',
    totalCards: 183,
    collectedCards: 20,
    imageUrl: 'https://images.pokemontcg.io/swsh5/logo.png',
    description: 'Battle Styles introduces Single Strike and Rapid Strike cards, reflecting different fighting styles from the Isle of Armor expansion from the video games.'
  },
  {
    id: 'swsh6',
    name: 'Chilling Reign',
    releaseDate: 'Jun 18, 2021',
    totalCards: 198,
    collectedCards: 0,
    imageUrl: 'https://images.pokemontcg.io/swsh6/logo.png',
    description: 'Chilling Reign features the Legendary Pokémon Calyrex in its Ice Rider and Shadow Rider forms, as well as the Galarian forms of Articuno, Zapdos, and Moltres.'
  },
  {
    id: 'swsh7',
    name: 'Evolving Skies',
    releaseDate: 'Aug 27, 2021',
    totalCards: 237,
    collectedCards: 0,
    imageUrl: 'https://images.pokemontcg.io/swsh7/logo.png',
    description: 'Evolving Skies features Dragon-type Pokémon returning to the game, as well as Eevee and all of its evolutions in their VMAX forms.'
  }
];

// Mock data for Pokémon cards in a set
export const getCardsForSet = (setId: string) => {
  switch(setId) {
    case 'swsh1':
      return [
        {
          id: 'swsh1-1',
          name: 'Celebi V',
          number: '1/202',
          imageUrl: 'https://images.pokemontcg.io/swsh1/1.png',
          rarity: 'Ultra Rare',
          owned: true,
          setId: 'swsh1',
          type: 'Grass',
          description: 'Celebi V is a Grass-type Basic Pokémon V card. It has the Natural Cure ability and the Spiral Dive attack.',
          hp: 180,
          attacks: [
            {
              name: 'Spiral Dive',
              cost: ['Grass', 'Colorless'],
              damage: '50',
              text: 'This attack does 20 more damage for each Energy attached to this Pokémon (including Grass Energy).'
            }
          ]
        },
        {
          id: 'swsh1-2',
          name: 'Grookey',
          number: '11/202',
          imageUrl: 'https://images.pokemontcg.io/swsh1/11.png',
          rarity: 'Common',
          owned: true,
          setId: 'swsh1',
          type: 'Grass',
          description: 'Grookey is a Grass-type Basic Pokémon card. It has the Double Hit attack.',
          hp: 60,
          attacks: [
            {
              name: 'Double Hit',
              cost: ['Grass'],
              damage: '10×2',
              text: 'This attack does 10 damage 2 times.'
            }
          ]
        },
        {
          id: 'swsh1-3',
          name: 'Rillaboom V',
          number: '17/202',
          imageUrl: 'https://images.pokemontcg.io/swsh1/17.png',
          rarity: 'Ultra Rare',
          owned: false,
          setId: 'swsh1',
          type: 'Grass',
          description: 'Rillaboom V is a Grass-type Basic Pokémon V card. It has the Wood Hammer and Super Bash attacks.',
          hp: 220,
          attacks: [
            {
              name: 'Wood Hammer',
              cost: ['Grass', 'Grass', 'Colorless'],
              damage: '110',
              text: 'This Pokémon also does 30 damage to itself.'
            },
            {
              name: 'Super Bash',
              cost: ['Grass', 'Grass', 'Grass', 'Grass'],
              damage: '200',
              text: ''
            }
          ]
        },
        {
          id: 'swsh1-4',
          name: 'Charizard V',
          number: '25/202',
          imageUrl: 'https://images.pokemontcg.io/swsh1/25.png',
          rarity: 'Ultra Rare',
          owned: true,
          setId: 'swsh1',
          type: 'Fire',
          description: 'Charizard V is a Fire-type Basic Pokémon V card. It has the Claw Slash and Fire Spin attacks.',
          hp: 220,
          attacks: [
            {
              name: 'Claw Slash',
              cost: ['Fire', 'Colorless'],
              damage: '80',
              text: ''
            },
            {
              name: 'Fire Spin',
              cost: ['Fire', 'Fire', 'Fire', 'Colorless'],
              damage: '220',
              text: 'Discard 2 Energy from this Pokémon.'
            }
          ]
        },
        {
          id: 'swsh1-5',
          name: 'Pikachu',
          number: '65/202',
          imageUrl: 'https://images.pokemontcg.io/swsh1/65.png',
          rarity: 'Common',
          owned: true,
          setId: 'swsh1',
          type: 'Electric',
          description: 'Pikachu is an Electric-type Basic Pokémon card. It has the Thunder Shock and Quick Attack moves.',
          hp: 70,
          attacks: [
            {
              name: 'Thunder Shock',
              cost: ['Electric'],
              damage: '10',
              text: "Flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed."
            },
            {
              name: 'Quick Attack',
              cost: ['Colorless', 'Colorless'],
              damage: '30+',
              text: 'Flip a coin. If heads, this attack does 30 more damage.'
            }
          ]
        },
        {
          id: 'swsh1-6',
          name: 'Zacian V',
          number: '138/202',
          imageUrl: 'https://images.pokemontcg.io/swsh1/138.png',
          rarity: 'Ultra Rare',
          owned: false,
          setId: 'swsh1',
          type: 'Metal',
          description: 'Zacian V is a Metal-type Basic Pokémon V card. It has the Intrepid Sword ability and the Brave Blade attack.',
          hp: 220,
          attacks: [
            {
              name: 'Brave Blade',
              cost: ['Metal', 'Metal', 'Colorless'],
              damage: '230',
              text: "During your next turn, this Pokémon can't attack."
            }
          ]
        }
      ];
    case 'swsh7':
      return [
        {
          id: 'swsh7-1',
          name: 'Leafeon V',
          number: '1/237',
          imageUrl: 'https://images.pokemontcg.io/swsh7/1.png',
          rarity: 'Ultra Rare',
          owned: false,
          setId: 'swsh7',
          type: 'Grass',
          description: 'Leafeon V is a Grass-type Basic Pokémon V card with the Blend In ability.',
          hp: 210,
          attacks: [
            {
              name: 'Grass Knot',
              cost: ['Grass', 'Colorless'],
              damage: '30+',
              text: 'This attack does 30 more damage for each Energy in your opponent\'s Active Pokémon\'s Retreat Cost.'
            }
          ]
        },
        {
          id: 'swsh7-2',
          name: 'Leafeon VMAX',
          number: '8/237',
          imageUrl: 'https://images.pokemontcg.io/swsh7/8.png',
          rarity: 'Ultra Rare',
          owned: false,
          setId: 'swsh7',
          type: 'Grass',
          description: 'Leafeon VMAX is a Grass-type VMAX Pokémon with the Grassroot\'s Guard ability.',
          hp: 310,
          attacks: [
            {
              name: 'Max Leaf',
              cost: ['Grass', 'Grass', 'Colorless'],
              damage: '130',
              text: 'Heal 30 damage from this Pokémon.'
            }
          ]
        },
        {
          id: 'swsh7-3',
          name: 'Rayquaza V',
          number: '110/237',
          imageUrl: 'https://images.pokemontcg.io/swsh7/110.png',
          rarity: 'Ultra Rare',
          owned: false,
          setId: 'swsh7',
          type: 'Dragon',
          description: 'Rayquaza V is a Dragon-type Basic Pokémon V card with the Sky-High Powers ability.',
          hp: 220,
          attacks: [
            {
              name: 'Dragon Pulse',
              cost: ['Fire', 'Lightning', 'Colorless'],
              damage: '180',
              text: 'Discard the top 3 cards of your deck.'
            }
          ]
        },
        {
          id: 'swsh7-4',
          name: 'Rayquaza VMAX',
          number: '111/237',
          imageUrl: 'https://images.pokemontcg.io/swsh7/111.png',
          rarity: 'Ultra Rare',
          owned: false,
          setId: 'swsh7',
          type: 'Dragon',
          description: 'Rayquaza VMAX is a Dragon-type VMAX Pokémon with the Max Burst attack.',
          hp: 330,
          attacks: [
            {
              name: 'Max Burst',
              cost: ['Fire', 'Lightning', 'Colorless', 'Colorless'],
              damage: '170+',
              text: 'Discard any amount of Energy from your Pokémon. This attack does 30 more damage for each card you discarded in this way.'
            }
          ]
        },
        {
          id: 'swsh7-5',
          name: 'Umbreon V',
          number: '189/237',
          imageUrl: 'https://images.pokemontcg.io/swsh7/189.png',
          rarity: 'Ultra Rare',
          owned: false,
          setId: 'swsh7',
          type: 'Dark',
          description: 'Umbreon V is a Dark-type Basic Pokémon V card with the Fast Search ability.',
          hp: 210,
          attacks: [
            {
              name: 'Dark Pulse',
              cost: ['Dark', 'Colorless', 'Colorless'],
              damage: '90+',
              text: 'This attack does 30 more damage for each Dark Energy attached to all of your Pokémon.'
            }
          ]
        },
        {
          id: 'swsh7-6',
          name: 'Umbreon VMAX',
          number: '215/237',
          imageUrl: 'https://images.pokemontcg.io/swsh7/215.png',
          rarity: 'Ultra Rare',
          owned: false,
          setId: 'swsh7',
          type: 'Dark',
          description: 'Umbreon VMAX is a Dark-type VMAX Pokémon with the Max Darkness attack.',
          hp: 310,
          attacks: [
            {
              name: 'Max Darkness',
              cost: ['Dark', 'Dark', 'Colorless'],
              damage: '160',
              text: 'Discard an Energy from your opponent\'s Active Pokémon.'
            }
          ]
        }
      ];
    default:
      return [
        {
          id: `${setId}-1`,
          name: 'Sample Card',
          number: '1/100',
          imageUrl: 'https://images.pokemontcg.io/swsh1/1.png',
          rarity: 'Common',
          owned: false,
          setId: setId,
          type: 'Normal',
          description: 'This is a sample card for this set.',
          hp: 100,
          attacks: [
            {
              name: 'Sample Attack',
              cost: ['Colorless'],
              damage: '10',
              text: 'This is a sample attack.'
            }
          ]
        }
      ];
  }
};

// Get details for a specific card
export const getCardDetails = (setId: string, cardId: string) => {
  const cards = getCardsForSet(setId);
  return cards.find(card => card.id === cardId);
};

// Get details for a specific set
export const getSetDetails = (setId: string) => {
  return cardSets.find(set => set.id === setId);
};
