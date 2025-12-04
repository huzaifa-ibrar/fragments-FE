import React from 'react';
import CreateFragment from './CreateFragment';
import FragmentList from './FragmentList';
import './index.css';

export default function App() {
  const [refresh, setRefresh] = React.useState(false);

  return (
    <div className="App">
      <h1>Fragments UI</h1>
      <CreateFragment onCreated={() => setRefresh(!refresh)} />
      <FragmentList key={refresh} />
    </div>
  );
}
