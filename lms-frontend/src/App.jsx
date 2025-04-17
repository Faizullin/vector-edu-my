// third party
import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// -----------------------|| APP ||-----------------------//

export default function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <RouterProvider router={router}></RouterProvider>
        <ToastContainer />
      </ModalProvider>
    </AuthProvider>
  );
}
