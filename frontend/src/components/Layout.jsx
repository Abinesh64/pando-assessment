import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideBar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <SideBar />
      {children}
      <ToastContainer position="bottom-center" autoClose={3000} />
    </div>
  );
};

export default Layout;
