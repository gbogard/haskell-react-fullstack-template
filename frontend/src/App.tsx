import "./App.css";
import { Suspense, lazy } from "react";
import reactLogo from "./assets/react.svg";
import { getConfig } from "./server/config";

// Works also with SSR as expected
const Card = lazy(() => import("./Card"));

const Config = () => {
  const config = getConfig();
  return <p>Runtime config: {JSON.stringify(config, null, 2)}</p>;
};

function App() {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      <Suspense fallback={<p>Loading card component...</p>}>
        <Card />
      </Suspense>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <Config />
    </>
  );
}

export default App;
