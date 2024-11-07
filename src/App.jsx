// src/App.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Import your components
import Home from './pages/Home';
import About from './pages/About';
import Videos from './pages/Videos';
import View from './pages/View';
import Settings from './pages/Settings';
import RootLayout from './layouts/RootLayout'; // Import the layout

// Define your routes with RootLayout as the parent
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />, // Parent layout
      children: [               // Nested routes
        { path: '/', element: <Home /> },
        { path: '/about', element: <About /> },
        { path: '/videos', element: <Videos /> },
        { path: '/view', element: <View /> },
        { path: '/settings', element: <Settings /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,            // Enables React.startTransition wrapping
      v7_relativeSplatPath: true,          // Enables new relative route resolution
      v7_fetcherPersist: true,             // Enables fetcher persistence behavior
      v7_normalizeFormMethod: true,        // Normalizes formMethod casing
      v7_partialHydration: true,           // Changes RouterProvider hydration behavior
      v7_skipActionErrorRevalidation: true, // Modifies revalidation after action errors
    },
  }
);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
