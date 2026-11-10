import { startState } from './mocks/states';

export default function App() {
  return <pre>{JSON.stringify(startState, null, 2)}</pre>;
}
