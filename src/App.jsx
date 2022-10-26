/** @jsx h */

import h from "./core/h";
import { useState, useEffect, useRef } from './core/notReact';

export default function App() {
  const [count, setCount] = useState(0);
  const [cat, setCat] = useState('');
  const isHigherThan5 = useRef();

  const handleClick = () => {
    setCount(c => c + 1);
    setCat(str => str + '야옹! ');
  }

  useEffect(() => {
    if (count > 5) {
      isHigherThan5.current.style.color = 'red';
      isHigherThan5.current.style.backgroundColor = 'pink';
    } else {
      isHigherThan5.current.style.color = 'black';
      isHigherThan5.current.style.backgroundColor = 'white';
    }
  }, [count]);

  return (
    <div>
      <button onClick={handleClick}>Click</button>
      <h1>{count}</h1>
      <p>{cat}</p>
      <p className="description" ref={isHigherThan5} style={{ color: "blue", backgroundColor: 'yellow'}}>Too many have cats!!</p>
    </div>
  )
}
