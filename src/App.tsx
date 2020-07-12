import React from 'react';
import './App.css';
import { Machine, interpret } from 'xstate';

const answeringMachine = Machine({
  initial: 'unanswered',
  states: {
    unanswered: {
      on: {
        ANSWER: 'answered'
      }
    },
    answered: {
      type: 'final'
    }
  }
});



const answeringService = interpret(answeringMachine).onTransition(state => {
  console.log(state.done)
  console.log(state.toStrings())
});

function App() {
  answeringService.start();
  const { initialState } = answeringMachine;
  const answeredState = answeringMachine.transition(initialState, 'ANSWER');
  console.log(answeredState.done);
  return (
    <div className="App">
      <h1>Getting Started</h1>
    </div>
  );
}

export default App;
