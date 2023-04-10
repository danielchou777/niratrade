import { Outlet } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { Reset } from 'styled-reset';

import Header from './components/Header';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Noto Sans TC', sans-serif;
    background-color: black
  }

  #root {
    min-height: 100vh;
    padding: 60px 0 80px;
    position: relative;

  }
`;

function App() {
  return (
    <>
      <Reset />
      <GlobalStyle />
      <>
        <Header />
        <Outlet />
      </>
    </>
  );
}

export default App;
