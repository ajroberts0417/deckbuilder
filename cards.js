function attack(player, dmg) {
  if (player.gateHealth <= 0) {
    player.castleHealth -= dmg;
  } else if (player.gateHealth < dmg) {
    const diff = dmg - player.gateHealth;
    player.gateHealth = 0;
    player.castleHealth -= diff;
  } else {
    player.gateHealth -= dmg;
  }
}


export default [
  {
    name: 'archer',
    type: 'weapons',
    cost: 1,
    description: 'attack 2',
    icon: 'https://res.cloudinary.com/alexander-melo-assets/image/upload/v1549318612/archery.png',
    cast: (targets) => {
      attack(targets[0], 2)
    }
  },
  {
    name: 'platoon',
    type: 'weapons',
    cost: 4,
    description: 'attack 6'
  },
  {
    name: 'banshee',
    type: 'weapons',
    cost: 28,
    description: 'attack 32',
  },
  {
    name: 'swat',
    type: 'weapons',
    cost: 18,
    description: 'enemy castle -10',
  },
  {
    name: 'thief',
    type: 'weapons',
    cost: 15,
    description: 'transfer enemy stocks 5',
  },
  {
    name: 'saboteur',
    type: 'weapons',
    cost: 12,
    description: 'enemy stocks -4',
  },
  {
    name: 'attack',
    type: 'weapons',
    cost: 10,
    description: 'attack 12',
  },
  {
    name: 'recruit',
    type: 'weapons',
    cost: 8,
    description: 'soldiers +1',
  },
  {
    name: 'rider',
    type: 'weapons',
    cost: 2,
    description: 'attack 4',
  },
  {
    name: 'knight',
    type: 'weapons',
    cost: 2,
    description: 'attack 3',
  },
  {
    name: 'fence',
    type: 'bricks',
    cost: 12,
    description: 'fence +22',
  },
  {
    name: 'base',
    type: 'bricks',
    cost: 1,
    description: 'castle +2',
  },
  {
    name: 'school',
    type: 'bricks',
    cost: 8,
    description: 'builders +1',
  },
  {
    name: 'tower',
    type: 'bricks',
    cost: 5,
    description: 'castle +5',
  },
  {
    name: 'defense',
    type: 'bricks',
    cost: 3,
    description: 'fence +6'
  },
  {
    name: 'reserve',
    type: 'bricks',
    cost: 3,
    description: 'castle +8<br>fence -4',
  },
  {
    name: 'babylon',
    type: 'bricks',
    cost: 39,
    description: 'castle +32',
  },
  {
    name: 'fort',
    type: 'bricks',
    cost: 18,
    description: 'castle +20',
  },
  {
    name: 'wain',
    type: 'bricks',
    cost: 10,
    description: 'castle +8<br>enemy castle -4',
  },
  {
    name: 'wall',
    type: 'bricks',
    cost: 1,
    description: 'fence +3',
  },
  {
    name: 'conjure crystals',
    type: 'crystals',
    cost: 4,
    description: 'crystals +8'
  },
  {
    name: 'conjure weapons',
    type: 'crystals',
    cost: 4,
    description: 'weapons +8'
  },
  {
    name: 'conjure bricks',
    type: 'crystals',
    cost: 4,
    description: 'bricks +8'
  },
  {
    name: 'crush weapons',
    type: 'crystals',
    cost: 4,
    description: 'enemy weapons -8'
  },
  {
    name: 'crush bricks',
    type: 'crystals',
    cost: 4,
    description: 'enemy bricks -8'
  },
  {
    name: 'crush crystals',
    type: 'crystals',
    cost: 4,
    description: 'enemy crystals -8'
  },
  {
    name: 'sorcerer',
    type: 'crystals',
    cost: 8,
    description: 'magic +1'
  },
  {
    name: 'dragon',
    type: 'crystals',
    cost: 21,
    description: 'attack 25'
  },
  {
    name: 'pixies',
    type: 'crystals',
    cost: 22,
    description: 'castle +22'
  },
  {
    name: 'curse',
    type: 'crystals',
    cost: 45,
    description: 'all +1<br>enemies all -1'
  },
];
