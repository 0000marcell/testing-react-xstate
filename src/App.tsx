import React from 'react';
import './App.css';
import { Machine } from 'xstate';

const wizardMachine = Machine({
  id: 'wizard',
  initial: 'open',
  states: {
    open: {
      initial: 'step1',
      states: {
        step1: {
          on: { NEXT: 'step2' }
        },
        step2: {
          /* ... */
        },
        step3: {
          /* ... */
        }
      },
      on: {
        NEXT: 'goodbye',
        CLOSE: 'closed'
      }
    },
    goodbye: {
      on: { CLOSE: 'closed' }
    },
    closed: { type: 'final' }
  }
});


function App() {
  // { open: 'step1' }
  const { initialState } = wizardMachine;

  // the NEXT transition defined on 'open.step1'
  // supersedes the NEXT transition defined
  // on the parent 'open' state
  const nextStepState = wizardMachine.transition(initialState, 'NEXT');
  console.log(nextStepState.value);
  // => { open: 'step2' }

  // there is no CLOSE transition on 'open.step1'
  // so the event is passed up to the parent
  // 'open' state, where it is defined
  const closedState = wizardMachine.transition(initialState, 'CLOSE');
  console.log(closedState.value);
  // => 'closed'

  return (
    <div className="App">
    <h1>Getting Started</h1>
    </div>
  );
}

export default App;
