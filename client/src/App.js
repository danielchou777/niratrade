import { Outlet } from 'react-router-dom';
import React from 'react';
import { createGlobalStyle } from 'styled-components';
import { Reset } from 'styled-reset';
import { UserContext } from './store/UserContext';

import Header from './components/Header';
import socketIOClient from 'socket.io-client';
//TODO change to your own endpoint
const ENDPOINT = 'https://www.danielchou.online';
// const ENDPOINT = 'http://localhost:3000';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Noto Sans TC', sans-serif;
    background-color: black
  }

  #root {
    height: 100vh;
    padding: 60px 0 80px;
    position: relative;

  }
`;

function App() {
  const [user, setUser] = React.useState(null);
  const [refreshSocket, setRefreshSocket] = React.useState(0);
  const socketRef = React.useRef(null);

  React.useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = socketIOClient(ENDPOINT);
      setRefreshSocket((prev) => prev + 1);
    }
  }, []);

  const socket = socketRef.current;

  return (
    <UserContext.Provider value={{ user, setUser, refreshSocket, socket }}>
      <Reset />
      <GlobalStyle />
      <>
        <Header />
        <Outlet />
      </>
    </UserContext.Provider>
  );
}

export default App;
