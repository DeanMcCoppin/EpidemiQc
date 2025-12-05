import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { LogOut, Globe } from 'lucide-react';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-quebec-blue text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-quebec-blue font-bold text-xl">EQ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{t('app.title')}</h1>
              <p className="text-xs text-quebec-blue-light">{t('app.subtitle')}</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-quebec-blue-light transition">
              {t('nav.home')}
            </Link>
            <Link to="/map" className="hover:text-quebec-blue-light transition">
              {t('nav.map')}
            </Link>
            <Link to="/hospitals" className="hover:text-quebec-blue-light transition">
              {i18n.language === 'fr' ? 'Hôpitaux' : 'Hospitals'}
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="hover:text-quebec-blue-light transition">
                  {t('nav.dashboard')}
                </Link>
                <Link to="/preferences" className="hover:text-quebec-blue-light transition">
                  {t('nav.preferences')}
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="hover:text-quebec-blue-light transition">
                    {t('nav.admin')}
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Side - Language Toggle and Auth */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-quebec-blue-dark transition"
              title="Change language"
            >
              <Globe size={18} />
              <span className="text-sm font-medium">{i18n.language.toUpperCase()}</span>
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm">
                  {user?.firstName || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 bg-quebec-red rounded hover:bg-red-700 transition"
                >
                  <LogOut size={18} />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 border border-white rounded hover:bg-white hover:text-quebec-blue transition"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-quebec-blue rounded hover:bg-gray-100 transition"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
