import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import create, { useStandContext, createStandContext } from '../src';

interface CounterState {
  counter: number;
  increment: () => void;
  decrement: () => void;
  setCounter: (value: number | string) => void;
}

const ctx = createStandContext<CounterState>(({ setState }) => ({
  counter: 0,
  increment: () => setState((state) => ({ counter: state.counter + 1 })),
  decrement: () => setState((state) => ({ counter: state.counter - 1 })),
  setCounter: (value) => setState({ counter: value as number }),
}));

const useStand = create<CounterState>(({ setState }) => ({
  counter: 0,
  increment: () => setState((state) => ({ counter: state.counter + 1 })),
  decrement: () => setState((state) => ({ counter: state.counter - 1 })),
  setCounter: (value) => setState({ counter: value as number }),
}));

function TestComponentUseStand() {
  const { counter, increment, decrement } = useStand();
  return (
    <div>
      <p data-testid="value">value: {counter}</p>
      <button onClick={increment} data-testid="inc">Increment</button>
      <button onClick={decrement} data-testid="dec">Decrement</button>
    </div>
  );
}

function TestComponentUseStandContext() {
  const { counter, increment, decrement } = useStandContext(ctx);
  return (
    <div>
      <p data-testid="value">value: {counter}</p>
      <button onClick={increment} data-testid="inc">Increment</button>
      <button onClick={decrement} data-testid="dec">Decrement</button>
    </div>
  );
}

function TestComponentUseStandContextWithSelect() {
  const counter = useStandContext(ctx, (s) => s.counter);
  const increment = useStandContext(ctx, (s) => s.increment);
  const decrement = useStandContext(ctx, (s) => s.decrement);

  return (
    <div>
      <p data-testid="value">value: {counter}</p>
      <button onClick={increment} data-testid="inc">Increment</button>
      <button onClick={decrement} data-testid="dec">Decrement</button>
    </div>
  );
}

// this component should update when click Set button
function TestComponentUseStandContextWithSelectAndEqualityUpdate() {
  const counter = useStandContext(ctx, (s) => s.counter, (a, b) => String(a) === String(b));
  const increment = useStandContext(ctx, (s) => s.increment);
  const decrement = useStandContext(ctx, (s) => s.decrement);
  const setCounter = useStandContext(ctx, (s) => s.setCounter);

  return (
    <div>
      <p data-testid="value">value: {counter}</p>
      <button onClick={increment} data-testid="inc">Increment</button>
      <button onClick={decrement} data-testid="dec">Decrement</button>
      <button onClick={() => setCounter('100')} data-testid="set">Set</button>
    </div>
  );
}
// this component should not update when click Set button
function TestComponentUseStandContextWithSelectAndEqualityNotUpdate() {
  const counter = useStandContext(ctx, (s) => s.counter, (a, b) => a === b);
  const increment = useStandContext(ctx, (s) => s.increment);
  const decrement = useStandContext(ctx, (s) => s.decrement);
  const setCounter = useStandContext(ctx, (s) => s.setCounter);

  return (
    <div>
      <p data-testid="value">value: {counter}</p>
      <button onClick={increment} data-testid="inc">Increment</button>
      <button onClick={decrement} data-testid="dec">Decrement</button>
      <button onClick={() => setCounter('100')} data-testid="set">Set</button>
    </div>
  );
}

describe('useStand', () => {
  it('should increment', () => {
    const { getByTestId } = render(<TestComponentUseStand />);
    const value = getByTestId('value');
    const inc = getByTestId('inc');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(inc);
    expect(value.textContent).toBe('value: 1');
  });

  it('should decrement', () => {
    const { getByTestId } = render(<TestComponentUseStand />);
    const value = getByTestId('value');
    const dec = getByTestId('dec');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(dec);
    expect(value.textContent).toBe('value: -1');
  });

  it('should set counter', () => {
    const { getByTestId } = render(<TestComponentUseStand />);
    const value = getByTestId('value');
    const inc = getByTestId('inc');
    const dec = getByTestId('dec');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(inc);
    expect(value.textContent).toBe('value: 1');
    fireEvent.click(dec);
    expect(value.textContent).toBe('value: 0');
  });
});

describe('useStandContext', () => {
  it('should increment', () => {
    const { getByTestId } = render(<ctx.Provider><TestComponentUseStandContext /></ctx.Provider>);
    const value = getByTestId('value');
    const inc = getByTestId('inc');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(inc);
    expect(value.textContent).toBe('value: 1');
  });

  it('should decrement', () => {
    const { getByTestId } = render(<ctx.Provider><TestComponentUseStandContext /></ctx.Provider>);
    const value = getByTestId('value');
    const dec = getByTestId('dec');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(dec);
    expect(value.textContent).toBe('value: -1');
  });

  it('should set counter', () => {
    const { getByTestId } = render(<ctx.Provider><TestComponentUseStandContext /></ctx.Provider>);
    const value = getByTestId('value');
    const inc = getByTestId('inc');
    const dec = getByTestId('dec');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(inc);
    expect(value.textContent).toBe('value: 1');
    fireEvent.click(dec);
    expect(value.textContent).toBe('value: 0');
  });
});
