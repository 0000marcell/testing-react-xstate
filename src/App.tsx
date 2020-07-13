import React from 'react';
import './App.css';
import { Machine } from 'xstate';

const isAdult = (age: any | undefined) => age >= 18;
const isMinor = (age: any | undefined) => age < 18;

const ageMachine = Machine({
  id: 'age',
  context: undefined, // age unknown
  initial: 'unknown',
  states: {
    unknown: {
      on: {
        // immediately take transition that satisfies conditional guard.
        // otherwise, no transition occurs
        '': [
          { target: 'adult', cond: isAdult },
          { target: 'child', cond: isMinor }
        ]
      }
    },
    adult: { type: 'final' },
    child: { type: 'final' }
  }
});



function App() {
  console.log(ageMachine.initialState.value);
  // => 'unknown'
  const personMachine = ageMachine.withContext(28);
  console.log(personMachine.initialState.value); 
  return (
    <div className="App">
      <h1>Getting Started</h1>
    </div>
  );
}

export default App;
