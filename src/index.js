import React from 'react';
import ReactDOM from 'react-dom/client';

// React Router相关
import { RouterProvider } from 'react-router-dom';
import router from './routers/router_index';

// Redux相关
import { Provider } from 'react-redux';
import store from './store';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}></RouterProvider>
    </Provider>
  </React.StrictMode>
);

