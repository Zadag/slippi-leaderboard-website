import "./App.css";
import UserList from "./components/UserList";
import Login from "./components/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<UserList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
