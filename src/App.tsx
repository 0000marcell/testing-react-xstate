import React from 'react';
import './App.css';
import { Machine, assign, interpret } from 'xstate';

const gameMachine = Machine(
  {
    id: 'game',
    initial: 'playing',
    context: {
      points: 0
    },
    states: {
      playing: {
        // Eventless transition
        // Will transition to either 'win' or 'lose' immediately upon
        // (re)entering 'playing' state if the condition is met.
        always: [
          { target: 'win', cond: 'didPlayerWin' },
          { target: 'lose', cond: 'didPlayerLose' }
        ],
        on: {
          // Self-transition
          AWARD_POINTS: {
            actions: assign({
              points: 100
            })
          }
        }
      },
      win: { type: 'final' },
      lose: { type: 'final' }
    }
  },
  {
    guards: {
      didPlayerWin: (context, event) => {
        // check if player won
        return context.points > 99;
      },
      didPlayerLose: (context, event) => {
        // check if player lost
        return context.points < 0;
      }
    }
  }
);


function App() {
  const gameService = interpret(gameMachine)
    .onTransition((state) => console.log(state.value))
    .start();

  // Still in 'playing' state because no conditions of
  // transient transition were met
  // => 'playing'

  // When 'AWARD_POINTS' is sent, a self-transition to 'PLAYING' occurs.
  // The transient transition to 'win' is taken because the 'didPlayerWin'
  // condition is satisfied.
  gameService.send('AWARD_POINTS');
  // => 'win'

  return (
    <div className="App">
    <h1>Getting Started</h1>
    </div>
  );
}

export default App;
