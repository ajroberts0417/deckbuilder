export const Cards = {
  ATTACK: "attack",
  DEFEND: "defend",
  HEAL: "heal",
  BARRICADE: "barricade",
  INVEST: "invest",
  SORCERY: "sorcery"
}

const cardDatabase = {
  [Cards.ATTACK]: {
    id: Cards.ATTACK,
    name: 'Card 1',
    description: 'This is card 1',
    type: 'action',
    cost: 1,
    effect: () => { },
  },
  [Cards.DEFEND]: {
    id: Cards.DEFEND,
    name: 'Card 2',
    description: 'This is card 2',
    type: 'action',
    cost: 2,
    effect: () => { },
  },
  [Cards.HEAL]: {
    id: Cards.HEAL,
    name: 'Card 3',
    description: 'This is card 3',
    type: 'action',
    cost: 3,
    effect: () => { },
  },
  [Cards.BARRICADE]: {
    id: Cards.BARRICADE,
    name: 'Card 4',
    description: 'This is card 4',
    type: 'action',
    cost: 4,
    effect: () => { },
  },
  [Cards.INVEST]: {
    id: Cards.INVEST,
    name: 'Card 5',
    description: 'This is card 5',
    type: 'action',
    cost: 5,
    effect: () => { },
  },
  [Cards.SORCERY]: {
    id: Cards.SORCERY,
    name: 'Card 6',
    description: 'This is card 6',
    type: 'action',
    cost: 6,
    effect: () => { },
  }
}

export default cardDatabase;