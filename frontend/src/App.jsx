import "./index.css";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Trash from "./pages/Trash";
import Photos from "./pages/PhotosPage";
import Albums from "./pages/Albums";
import Layout from "./components/Layout";

// Define the routes array
const router = createBrowserRouter([
  {
    path: "/trash",
    element: (
      <Layout>
        <Trash />
      </Layout>
    ),
  },
  {
    path: "/photos",
    element: (
      <Layout>
        <Photos />
      </Layout>
    ),
  },
  {
    path: "/albums",
    element: (
      <Layout>
        <Albums />
      </Layout>
    ),
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};
export default App;
