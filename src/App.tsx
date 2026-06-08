import { Routes, Route } from 'react-router';
import HomePage from './pages/HomePage';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import ResearchList from './pages/ResearchList';
import ResearchDetail from './pages/ResearchDetail';
import Admin from './pages/Admin';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blogs" element={<BlogList />} />
      <Route path="/blogs/:slug" element={<BlogDetail />} />
      <Route path="/research" element={<ResearchList />} />
      <Route path="/research/:slug" element={<ResearchDetail />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
