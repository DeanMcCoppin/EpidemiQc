import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { Menu, X, MapPin, Building2, LayoutDashboard, Settings, Shield, LogOut, Globe, Home } from 'lucide-react';
import DecryptedText from './DecryptedText';

const BurgerMenu = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === '/') return i18n.language === 'fr' ? 'Accueil' : 'Home';
    if (path === '/map') return i18n.language === 'fr' ? 'Carte' : 'Map';
    if (path === '/hospitals') return i18n.language === 'fr' ? 'Hôpitaux' : 'Hospitals';
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/preferences') return i18n.language === 'fr' ? 'Préférences' : 'Preferences';
    if (path === '/admin') return 'Admin';
    return 'EpidemiQc';
  };

  const menuItems = [
    { path: '/', label: t('nav.home'), icon: Home, public: true },
    { path: '/map', label: t('nav.map'), icon: MapPin, public: true },
    { path: '/hospitals', label: i18n.language === 'fr' ? 'Hôpitaux' : 'Hospitals', icon: Building2, public: true },
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, public: false },
    { path: '/preferences', label: t('nav.preferences'), icon: Settings, public: false },
    { path: '/admin', label: t('nav.admin'), icon: Shield, public: false, adminOnly: true },
  ];

  const isMapPage = location.pathname === '/map';

  return (
    <>
      {/* Burger Button - Top right on map page, top left on other pages */}
      <div className={`fixed top-6 z-50 transition-all duration-300 ${
        isMapPage
          ? 'right-6'
          : (isOpen ? 'left-[304px]' : 'left-6')
      }`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-12 h-12 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 flex flex-col items-center justify-center gap-1.5"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <>
              <div className="w-6 h-0.5 bg-white rounded-full"></div>
              <div className="w-6 h-0.5 bg-white rounded-full"></div>
              <div className="w-6 h-0.5 bg-white rounded-full"></div>
            </>
          )}

          {/* Section name on hover - only show when closed */}
          {!isOpen && (
            <div className={`absolute px-4 py-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none ${
              isMapPage ? 'right-full mr-4' : 'left-full ml-4'
            }`}>
              <span className="text-white font-semibold">{getCurrentSection()}</span>
            </div>
          )}
        </button>
      </div>

      {/* Menu Panel */}
      <div
        className={`fixed top-0 left-0 h-screen w-80 bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-2xl border-r border-slate-700/50 shadow-2xl z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header - Now at the very top */}
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
            <h2 className="text-2xl font-bold text-white mb-1">
              <DecryptedText text="EpidemiQc" speed={80} sequential={true} />
            </h2>
            <p className="text-slate-400 text-sm">{i18n.language === 'fr' ? 'Surveillance Épidémique' : 'Epidemic Monitoring'}</p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              // Skip admin-only items if not admin
              if (item.adminOnly && user?.role !== 'admin') return null;
              // Skip private items if not authenticated
              if (!item.public && !isAuthenticated) return null;

              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-700/50 space-y-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {i18n.language === 'fr' ? 'Langue' : 'Language'}
              </span>
              <span className="text-sm font-bold">{i18n.language.toUpperCase()}</span>
            </button>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-400 text-xs">{i18n.language === 'fr' ? 'Connecté en tant que' : 'Logged in as'}</p>
                  <p className="text-white font-semibold truncate">{user?.firstName || user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-medium transition-all duration-200 border border-red-500/30"
                >
                  <LogOut className="w-5 h-5" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-medium transition-all duration-200 text-center border border-slate-700"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:shadow-blue-500/30 text-white rounded-xl font-medium transition-all duration-200 text-center"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default BurgerMenu;
