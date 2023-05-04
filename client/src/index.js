import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import App from './App';
import Signin from './pages/Signin/Signin';
import Signup from './pages/Signup/Signup';
import Trade from './pages/Trade/Trade';
import Wallet from './pages/Wallet/Wallet';
import Home from './pages/Home/Home';
import OrderBook from './pages/OrderBook/OrderBook';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}>
        <Route path='' element={<Home />} />
        <Route path='trade' element={<Trade />} />
        <Route path='wallet' element={<Wallet />} />
        <Route path='signin' element={<Signin />} />
        <Route path='signup' element={<Signup />} />
        <Route path='orderbook' element={<OrderBook />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
