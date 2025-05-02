import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from './context/userContext';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import FindBillboards from "./pages/FindBillboards";
import BillboardDetails from "./pages/BillboardDetails";
import AddBillboard from "./pages/AddBillboard";
import Analytics from "./pages/Analytics";
import Contact from "./pages/Contact";
import About from "./pages/About";
import CreateBillboard from "./pages/CreateBillboard";
import QuotationPage from "./pages/QuotationPage";
function App() {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/find-billboards" element={<FindBillboards />} />
        <Route path="/billboard-details/:id" element={<BillboardDetails />} />
        <Route path="/add-billboard" element={<AddBillboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/create-billboard" element={<CreateBillboard />} />
        <Route path="/billboards/:id/quotation" element={<QuotationPage />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
