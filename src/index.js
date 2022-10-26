/** @jsx h */

import App from "./App";
import notReact from "./core/notReact";
import h from "./core/h";


const root = notReact.createRoot(document.getElementById('root'));
root.render(<App/>)