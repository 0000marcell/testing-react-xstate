import React from 'react';
import './App.css';
import { Machine, interpret } from 'xstate';

const lightMachine = Machine(
  {
    id: 'light',
    initial: 'green',
    states: {
      green: {
        // action referenced via string
        entry: 'alertGreen'
      }
    }
  },
  {
    actions: {
      // action implementation
      alertGreen: (context, event) => {
        alert('Green!');
      }
    },
  }
);

const promiseService = interpret(lightMachine).onTransition(state =>
  console.log(state.value)
);

function App() {
  promiseService.start();
  return (
    <div className="App">
      <h1>Getting Started</h1>
    </div>
  );
}

export default App;
