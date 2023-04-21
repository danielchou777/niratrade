import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import App from './App';
import Signin from './pages/Signin/Signin';
import Signup from './pages/Signup/Signup';
import Trade from './pages/Trade/Trade';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}>
        <Route path='trade' element={<Trade />} />
        <Route path='signin' element={<Signin />} />
        <Route path='signup' element={<Signup />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
