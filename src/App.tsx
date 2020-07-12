import React from 'react';
import './App.css';
import { Machine, interpret } from 'xstate';

const promiseMachine = Machine({
  id: 'promise',
  initial: 'pending',
  states: {
    pending: {
      on: {
        RESOLVE: 'resolved',
        REJECT: 'rejected'
      }
    },
    resolved: {
      type: 'final'
    },
    rejected: {
      type: 'final'
    }
  }
});

const promiseService = interpret(promiseMachine).onTransition(state =>
  console.log(state.value)
);

function App() {
  promiseService.start();
  // => 'pending'
  promiseService.send('RESOLVE');
  return (
    <div className="App">
      <h1>Getting Started</h1>
    </div>
  );
}

export default App;
