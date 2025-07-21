import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ManageQuestions from './pages/admin/ManageQuestions';
import AdminRoute from './router/AdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="questions" element={<ManageQuestions />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;