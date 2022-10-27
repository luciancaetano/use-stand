# use-stand the useState with steroids

A small, fast local state-management solution using simplified redux/flux principles.

## Why?

Redux is a great library, but it's a bit too much for some projects. This library is a simplified version of redux/fux.

### Installation

```bash
npm install use-stand # or yarn add use-stand
```

### Create a store

```javascript
import create from 'use-stand';

const useStand = create((store) =>({
    count: 0,
    inc: () => store.setState(state => ({ count: state.count + 1})),
    dec: () => store.setState(state => ({ count: state.count - 1})),
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
import create from 'use-stand';

interface State {
    count: number;
    inc: () => void;
    dec: () => void;
}

const useStand = create<State>((store) =>({
    count: 0,
    inc: () => store.setState({ count: store.getState().count + 1 }), // direct getState
    dec: () => store.setState(state => ({ count: state.count - 1})), // getState in callback
}));
```


### Reading state in actions
``store.setState`` can receive a callback with the current state as parameter, or you can use store to get the current state.

```javascript
import create from 'use-stand';

const useStand = create((store) =>({
    count: 0,
    inc: () => store.setState(state => ({ count: store.getState().count + 1})),
    dec: () => store.setState(state => ({ count: store.getState().count - 1})),
}));

```

### Async actions

```javascript
import create from 'use-stand';

const useStand = create((store) =>({
    count: 0,
    inc: async () => {
        const lastCount = await getLastCount();
        store.setState({ count: lastCount + 1});
    },
}));
```

### Overriding state
The setState function has a second parameter to override the state, this is useful when you want to set the state with a new value.
**Attention this will not override the functions in the state, so you can't override automaticaly the actions.**

```javascript
import create from 'use-stand';

const useStand = create((store) =>({
    count: 0,
    inc: () => {
        store.setState({count: 0}, true); // override state
    },
}));
```