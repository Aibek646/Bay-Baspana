import CitiesPage from './pages/CitiesPage.tsx';
import { Route, Routes } from 'react-router-dom';
import ApartmentsPage from './pages/ApartmentsPage.tsx';
import ApartmentDetailPage from './pages/ApartmentDetailPage.tsx';
import AddApartmentPage from './pages/AddApartmentPage.tsx';
import LoginPage from './pages/LoginPage.tsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<CitiesPage />} />
            <Route path="/city/:cityId" element={<ApartmentsPage />} />
            <Route path="/city/:cityId/add" element={<AddApartmentPage />} />
            <Route path="/apartment/:id" element={<ApartmentDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    );
}

export default App;
