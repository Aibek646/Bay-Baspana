import CitiesPage from './pages/CitiesPage.tsx';
import { Route, Routes } from 'react-router-dom';
import ApartmentsPage from './pages/ApartmentsPage.tsx';
import ApartmentDetailPage from './pages/ApartmentDetailPage.tsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<CitiesPage />} />
            <Route path="/city/:cityId" element={<ApartmentsPage />} />
            <Route path="/apartment/:id" element={<ApartmentDetailPage />} />
        </Routes>
    );
}

export default App;
