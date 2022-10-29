import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import create, { createStandContext } from '../src';

interface CounterState {
  counter: number;
  increment: () => void;
  decrement: () => void;
  setCounter: (value: number | string) => void;
}

const initContext = () => createStandContext<CounterState>(({ setState }) => ({
  counter: 0,
  increment: () => setState((state) => ({ counter: state.counter + 1 })),
  decrement: () => setState((state) => ({ counter: state.counter - 1 })),
  setCounter: (value) => setState({ counter: value as number }),
}));

let [useMyState, MyStateProvider] = initContext();

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
  const { counter, increment, decrement } = useMyState();
  return (
    <div>
      <p data-testid="value">value: {counter}</p>
      <button onClick={increment} data-testid="inc">Increment</button>
      <button onClick={decrement} data-testid="dec">Decrement</button>
    </div>
  );
}

function TestComponentUseStandContextWithSelect() {
  const counter = useMyState((s) => s.counter);
  const increment = useMyState((s) => s.increment);
  const decrement = useMyState((s) => s.decrement);

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
  const counter = useMyState((s) => s.counter, (a, b) => String(a) === String(b));
  const increment = useMyState((s) => s.increment);
  const decrement = useMyState((s) => s.decrement);
  const setCounter = useMyState((s) => s.setCounter);

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
function TestComponentUseStandContextWithSelectAndEqualityAlwaysFail() {
  const counter = useMyState((s) => s.counter, () => true);
  const increment = useMyState((s) => s.increment);
  const decrement = useMyState((s) => s.decrement);
  const setCounter = useMyState((s) => s.setCounter);

  return (
    <div>
      <p data-testid="value">value: {counter}</p>
      <button onClick={increment} data-testid="inc">Increment</button>
      <button onClick={decrement} data-testid="dec">Decrement</button>
      <button onClick={() => setCounter('0')} data-testid="set">Set</button>
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
    const inc = getByTestId('inc');
    const dec = getByTestId('dec');
    expect(getByTestId('value').textContent).toBe('value: 0');
    fireEvent.click(inc);
    expect(getByTestId('value').textContent).toBe('value: 1');
    fireEvent.click(dec);
    expect(getByTestId('value').textContent).toBe('value: 0');
  });
});

describe('useStandContext', () => {
  beforeEach(() => {
    [useMyState, MyStateProvider] = initContext();
  });

  it('should increment', () => {
    const { getByTestId } = render(<MyStateProvider><TestComponentUseStandContext /></MyStateProvider>);
    const value = getByTestId('value');
    const inc = getByTestId('inc');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(inc);
    expect(value.textContent).toBe('value: 1');
  });

  it('should decrement', () => {
    const { getByTestId } = render(<MyStateProvider><TestComponentUseStandContext /></MyStateProvider>);
    const value = getByTestId('value');
    const dec = getByTestId('dec');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(dec);
    expect(value.textContent).toBe('value: -1');
  });

  it('should set counter', () => {
    const { getByText } = render(<MyStateProvider><TestComponentUseStandContext /></MyStateProvider>);

    expect(getByText('value: 0')).toBeInTheDocument();

    fireEvent.click(getByText('Increment'));
    expect(getByText('value: 1')).toBeInTheDocument();

    fireEvent.click(getByText('Decrement'));
    expect(getByText('value: 0')).toBeInTheDocument();

    fireEvent.click(getByText('Decrement'));
    expect(getByText('value: -1')).toBeInTheDocument();
  });
});

describe('useStandContext with select', () => {
  beforeEach(() => {
    [useMyState, MyStateProvider] = initContext();
  });

  it('should increment', () => {
    const { getByTestId } = render(<MyStateProvider><TestComponentUseStandContextWithSelect /></MyStateProvider>);
    const value = getByTestId('value');
    const inc = getByTestId('inc');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(inc);
    expect(value.textContent).toBe('value: 1');
  });

  it('should decrement', () => {
    const { getByTestId } = render(<MyStateProvider><TestComponentUseStandContextWithSelect /></MyStateProvider>);
    const value = getByTestId('value');
    const dec = getByTestId('dec');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(dec);
    expect(value.textContent).toBe('value: -1');
  });

  it('should set counter', () => {
    const { getByText } = render(<MyStateProvider><TestComponentUseStandContextWithSelect /></MyStateProvider>);

    expect(getByText('value: 0')).toBeInTheDocument();

    fireEvent.click(getByText('Increment'));
    expect(getByText('value: 1')).toBeInTheDocument();

    fireEvent.click(getByText('Decrement'));
    expect(getByText('value: 0')).toBeInTheDocument();

    fireEvent.click(getByText('Decrement'));
    expect(getByText('value: -1')).toBeInTheDocument();
  });
});

describe('useStandContext with select and equality', () => {
  beforeEach(() => {
    [useMyState, MyStateProvider] = initContext();
  });

  it('should increment', () => {
    const { getByTestId } = render(<MyStateProvider><TestComponentUseStandContextWithSelectAndEqualityUpdate /></MyStateProvider>);
    const value = getByTestId('value');
    const inc = getByTestId('inc');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(inc);
    expect(value.textContent).toBe('value: 1');
  });

  it('should decrement', () => {
    const { getByTestId } = render(<MyStateProvider><TestComponentUseStandContextWithSelectAndEqualityUpdate /></MyStateProvider>);
    const value = getByTestId('value');
    const dec = getByTestId('dec');
    expect(value.textContent).toBe('value: 0');
    fireEvent.click(dec);
    expect(value.textContent).toBe('value: -1');
  });

  it('should set counter', () => {
    const { getByText } = render(<MyStateProvider><TestComponentUseStandContextWithSelectAndEqualityUpdate /></MyStateProvider>);

    expect(getByText('value: 0')).toBeInTheDocument();

    fireEvent.click(getByText('Set'));
    expect(getByText('value: 100')).toBeInTheDocument();
  });

  it('should increment [restrict compares]', () => {
    const { getByText } = render(<MyStateProvider><TestComponentUseStandContextWithSelectAndEqualityAlwaysFail /></MyStateProvider>);

    expect(getByText('value: 0')).toBeInTheDocument();

    fireEvent.click(getByText('Increment'));
    expect(getByText('value: 0')).toBeInTheDocument();
  });

  it('should decrement [restrict compares]', () => {
    [useMyState, MyStateProvider] = initContext();

    const { getByText } = render(<MyStateProvider><TestComponentUseStandContextWithSelectAndEqualityAlwaysFail /></MyStateProvider>);

    expect(getByText('value: 0')).toBeInTheDocument();

    fireEvent.click(getByText('Increment'));
    expect(getByText('value: 0')).toBeInTheDocument();

    fireEvent.click(getByText('Decrement'));
    expect(getByText('value: 0')).toBeInTheDocument();
  });

  it('should not set counter [restrict compares]', () => {
    const { getByText } = render(<MyStateProvider><TestComponentUseStandContextWithSelectAndEqualityAlwaysFail /></MyStateProvider>);

    expect(getByText('value: 0')).toBeInTheDocument();

    fireEvent.click(getByText('Set'));
    expect(getByText('value: 0')).toBeInTheDocument();
  });
});
