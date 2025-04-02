import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './scss/style.scss';

// Layouts
import DefaultLayout from './layouts/DefaultLayout';

// Pages
/*const Login = React.lazy(() => import('./views/pages/login/Login'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));*/

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={loading}>
        <Routes>
          {/*<Route exact path="/login" name="Login Page" element={<Login />} />*/}
          {/*<Route exact path="/register" name="Register Page" element={<Register />} />*/}
          {/*<Route exact path="/404" name="Page 404" element={<Page404 />} />*/}
          {/*<Route exact path="/500" name="Page 500" element={<Page500 />} />*/}
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </Router>
  );
}

export default App;