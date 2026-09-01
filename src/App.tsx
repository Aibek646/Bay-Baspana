import CitiesPage from './pages/CitiesPage.tsx';
import { Route, Routes } from 'react-router-dom';
import ApartmentsPage from './pages/ApartmentsPage.tsx';
import ApartmentDetailPage from './pages/ApartmentDetailPage.tsx';
import AddApartmentPage from './pages/AddApartmentPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import EditApartmentPage from './pages/EditApartmentPage.tsx';
import PrivacyPage from './pages/PrivacyPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import PasswordPage from './pages/PasswordPage.tsx';
import ContactsPage from './pages/ContactsPage.tsx';
import ContactFormPage from './pages/ContactFormPage.tsx';
import SubscribePage from './pages/SubscribePage.tsx';
import SubscriptionsPage from './pages/SubscriptionsPage.tsx';
import RequireAccess from './components/RequireAccess.tsx';

function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RequireAccess>
                        <CitiesPage />
                    </RequireAccess>
                }
            />
            <Route
                path="/city/:cityId"
                element={
                    <RequireAccess>
                        <ApartmentsPage />
                    </RequireAccess>
                }
            />
            <Route path="/city/:cityId/add" element={<AddApartmentPage />} />
            <Route
                path="/apartment/:id"
                element={
                    <RequireAccess>
                        <ApartmentDetailPage />
                    </RequireAccess>
                }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/apartment/:id/edit" element={<EditApartmentPage />} />
            <Route path="/password" element={<PasswordPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/contacts/new" element={<ContactFormPage />} />
            <Route path="/contacts/:id/edit" element={<ContactFormPage />} />
            <Route path="/subscribe" element={<SubscribePage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            {/* без входа: ссылку на политику требуют магазины */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;
