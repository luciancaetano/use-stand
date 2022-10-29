# Welcome to useStand the useState with steroids

A small, fast local/context state-management solution using simplified redux/flux principles.

## Why?

Redux is a great library, but it's a bit too much for some projects. This library is a simplified version of redux/flux.

### Installation

```bash
npm install usestand # or yarn add usestand
```

### Create a store

```javascript
import create from 'usestand';

const useStand = create(({getState, setState}) =>({
    count: 0,
    inc: () => setState(state => ({ count: state.count + 1})),
    dec: () => setState(state => ({ count: state.count - 1})),
}));

```

### Then bind it to your component

```javascript

function Counter() {
    const { count, inc, dec } = useStand();

    return (
        <div>
            <h1>{count}</h1>
            <button onClick={inc}>+</button>
            <button onClick={dec}>-</button>
        </div>
    );
}

```

### Usage with typescript

Typescript usage is very simples, just add the type of your state to the create function.

```typescript
import create from 'usestand';

interface State {
    count: number;
    inc: () => void;
    dec: () => void;
}

const useStand = create<State>(({getState, setState}) =>({
    count: 0,
    inc: () => setState({ count: getState().count + 1 }), // direct getState
    dec: () => setState(state => ({ count: state.count - 1})), // getState in callback
}));
```


### Reading state in actions
``setState`` can receive a callback with the current state as parameter, or you can use store to get the current state.

```javascript
import create from 'usestand';

const useStand = create(({getState, setState}) =>({
    count: 0,
    inc: () => setState(state => ({ count: getState().count + 1})),
    dec: () => setState(state => ({ count: getState().count - 1})),
}));

```

### Reading state in actions using selector
``setState`` can receive a callback with a parameter that is a selector function. This selector function will receive the current state and return the value you want to use in the action.

```javascript
import create from 'usestand';

const useStand = create(({getState, setState}) =>({
    count: 0,
    inc: () => setState(state => ({ count: getState(s => s.count) + 1})),
    dec: () => setState(state => ({ count: getState(s => s.count) - 1})),
}));

```

### Async actions

```javascript
import create from 'usestand';

const useStand = create(({getState, setState}) =>({
    count: 0,
    inc: async () => {
        const lastCount = await getLastCount();
        setState({ count: lastCount + 1});
    },
}));
```

### Equality check
The returned useStand hook as a parameter to check the equality of the state, this is useful when you dont want to re-render the component is some cases.

```javascript
import create from 'usestand';

const useStand = create(({getState, setState}) =>({
    count: 0,
    myOtherValue: 1,
    inc: () => {
        setState({
            count: 0,
            myOtherValue: Math.Random(),
        });
    },
}));

function Counter() {
    const { count, inc, dec } = useStand((a, b) => a.count === b.count); // only re-render if count changes

    return (
        <div>
            <h1>{count}</h1>
            <button onClick={inc}>+</button>
            <button onClick={dec}>-</button>
        </div>
    );
}
```
### Initial state
If you want to set/reuse/spread the initial state of the store, you can pass it as a second parameter to the create function.

```javascript
import create from 'usestand';

const useStand = create(({getState, setState, getInitialState}) =>({
    count: 0,
    inc: () => setState(state => ({ count: getState().count + 1})),
    dec: () => setState(state => ({ count: getState().count - 1})),
    reset: () => setState(getInitialState()),
}));

```
### Global State
If you want to share the state between components, you can use the global state using context api.

##### Fist create hooks and providers

```javascript
import { createStandContext } from 'usestand';

const [useMyState, MyStateProvider] = createStandContext(({ setState }) => ({
    counter: 0,
    increment: () => setState((state) => ({ counter: state.counter + 1 })),
    decrement: () => setState((state) => ({ counter: state.counter - 1 })),
}));

```

##### Then use it in your components

```javascript

function Counter() {
    const { counter, increment, decrement } = useMyState();

    return (
        <div>
            <h1>{count}</h1>
            <button onClick={inc}>+</button>
            <button onClick={dec}>-</button>
        </div>
    );
}

function Container() {
    return (
        <MyStateProvider>
            <Counter />
        </MyStateProvider>
    );
}

ReactDOM.render(<Container />, document.getElementById('root'));

```

### Global State selectors and equality check
On global state, you can use selectors to get a specific value from the state, and you can use a equality check to avoid unnecessary re-renders.

```javascript
import { createStandContext } from 'usestand';

const [useMyState, MyStateProvider] = createStandContext(({ setState }) => ({
    counter: 0,
    increment: () => setState((state) => ({ counter: state.counter + 1 })),
    decrement: () => setState((state) => ({ counter: state.counter - 1 })),
}));

function Counter() {
    // get only the counter value and check if the value is the same with string casting so '1' is equal 1 and don't re-render
    const counter = useMyState((s) => s.counter, (a, b) => String(a) === String(b));
    // get only the increment function
    const increment = useMyState((s) => s.increment);
    // get only the decrement function
    const decrement = useMyState((s) => s.decrement);

    return (
        <div>
            <h1>{count}</h1>
            <button onClick={inc}>+</button>
            <button onClick={dec}>-</button>
        </div>
    );
}

function Container() {
    return (
        <MyStateProvider>
            <Counter />
        </MyStateProvider>
    );
}

ReactDOM.render(<Container />, document.getElementById('root'));

```

### buil-in shallowCompare
If you want to use the shallowCompare function, you can import it from usestand.
**Note:** The default equality check is the shallowCompare function.

```javascript

import { shallowCompare } from 'usestand';

function Counter() {
    const { count, inc, dec } = useStand(shallowCompare);

    return (
        <div>
            <h1>{count}</h1>
            <button onClick={inc}>+</button>
            <button onClick={dec}>-</button>
        </div>
    );
}

```

## Builtin Middlewares 🚧(WIP)

- [] Builtin persistence middleware
- [] Builtin logger middleware