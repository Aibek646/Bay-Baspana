import CitiesPage from './pages/CitiesPage.tsx';
import { Route, Routes } from 'react-router-dom';
import ApartmentsPage from './pages/ApartmentsPage.tsx';
import ApartmentDetailPage from './pages/ApartmentDetailPage.tsx';
import AddApartmentPage from './pages/AddApartmentPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import EditApartmentPage from './pages/EditApartmentPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<CitiesPage />} />
            <Route path="/city/:cityId" element={<ApartmentsPage />} />
            <Route path="/city/:cityId/add" element={<AddApartmentPage />} />
            <Route path="/apartment/:id" element={<ApartmentDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/apartment/:id/edit" element={<EditApartmentPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;
