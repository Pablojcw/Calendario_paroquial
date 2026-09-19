import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { PublicLayout } from './components/PublicLayout.js';
import { AdminLayout } from './components/AdminLayout.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { CalendarPage } from './pages/CalendarPage.js';
import { UpcomingPage } from './pages/UpcomingPage.js';
import { MassSchedulePage } from './pages/MassSchedulePage.js';
import { ChapelsPage } from './pages/ChapelsPage.js';
import { PastoralActivitiesPage } from './pages/PastoralActivitiesPage.js';
import { SacramentsPage } from './pages/SacramentsPage.js';
import { InstitutionalPage } from './pages/InstitutionalPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/Admin/DashboardPage.js';
import { EventsPage } from './pages/Admin/EventsPage.js';
import { EventFormPage } from './pages/Admin/EventFormPage.js';
import { EventDetailPage } from './pages/Admin/EventDetailPage.js';
import { SequenceFormPage } from './pages/Admin/SequenceFormPage.js';
import { CategoriesPage } from './pages/Admin/CategoriesPage.js';
import { CommunitiesPage } from './pages/Admin/CommunitiesPage.js';
import { InstitutionFormPage } from './pages/Admin/InstitutionFormPage.js';
import { ChangelogPage } from './pages/Admin/ChangelogPage.js';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/proximos" element={<UpcomingPage />} />
          <Route path="/missas" element={<MassSchedulePage />} />
          <Route path="/capelas" element={<ChapelsPage />} />
          <Route path="/atividades" element={<PastoralActivitiesPage />} />
          <Route path="/sacramentos" element={<SacramentsPage />} />
          <Route path="/institucional" element={<InstitutionalPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="eventos" element={<EventsPage />} />
          <Route path="eventos/novo" element={<EventFormPage />} />
          <Route path="eventos/:id" element={<EventDetailPage />} />
          <Route path="eventos/:id/editar" element={<EventFormPage />} />
          <Route path="sequencia-nova" element={<SequenceFormPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="comunidades" element={<CommunitiesPage />} />
          <Route path="institucional" element={<InstitutionFormPage />} />
          <Route path="historico" element={<ChangelogPage />} />
        </Route>

        <Route path="*" element={<PublicLayout />}>
          <Route path="*" element={<CalendarPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}