export default [
  {
    name: 'starting zone',
    background: 'https://res.cloudinary.com/alexander-melo-assets/image/upload/v1549318612/archery.png',
    narrator: 'You are a young prince, and your father has just passed away. You are now the king of your kingdom. You have a castle, a small army, and a few stocks of food. You must defend your castle from the enemy, and attack theirs. You must also manage your stocks of food, and your army. Good luck!',
    actions: [

    ], // actions the player can take in this area
    events: [
      {
        type: 'enter', // this will be called every time the player enters this area
      },
      {
        type: 'exit', // this will be called every time the player leaves this area
      },
    ], // events that can happen in this area, given certain triggers. Most often triggered by actions
  },
]