import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import CalendarPage from './pages/CalendarPage';
import SubjectsPage from './pages/SubjectsPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import GradesPage from './pages/GradesPage';
import ProfilePage from './pages/ProfilePage';
import './components.css';

export default function App() {
  return (
    <>
      <div className="app-background" />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/subjects/:id" element={<SubjectDetailPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  );
}
