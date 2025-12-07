import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Pods from '../pages/Pods';
import Create from '../pages/Create';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/pods',
    element: <Pods />,
  },
  {
    path: '/create',
    element: <Create />,
  },
]);

export default router;
