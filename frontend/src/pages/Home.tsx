import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Bell, BarChart3, Shield } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-quebec-blue to-quebec-blue-light text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">{t('app.title')}</h1>
          <p className="text-2xl mb-8">{t('app.subtitle')}</p>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            {t('nav.home') === 'Home'
              ? 'Real-time monitoring of epidemic outbreaks across Quebec. Stay informed and protect your community.'
              : 'Surveillance en temps réel des éclosions épidémiques au Québec. Restez informé et protégez votre communauté.'}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/map"
              className="px-8 py-3 bg-white text-quebec-blue rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              {t('nav.map')}
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-quebec-red text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('nav.home') === 'Home' ? 'Features' : 'Fonctionnalités'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
              <div className="flex justify-center mb-4">
                <MapPin size={48} className="text-quebec-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('nav.home') === 'Home' ? 'Interactive Map' : 'Carte interactive'}
              </h3>
              <p className="text-gray-600">
                {t('nav.home') === 'Home'
                  ? 'Visualize outbreaks across Quebec regions with real-time data'
                  : 'Visualisez les éclosions dans les régions du Québec avec des données en temps réel'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
              <div className="flex justify-center mb-4">
                <Bell size={48} className="text-quebec-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('nav.home') === 'Home' ? 'Smart Alerts' : 'Alertes intelligentes'}
              </h3>
              <p className="text-gray-600">
                {t('nav.home') === 'Home'
                  ? 'Receive notifications for outbreaks in your region'
                  : 'Recevez des notifications pour les éclosions dans votre région'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
              <div className="flex justify-center mb-4">
                <BarChart3 size={48} className="text-quebec-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('nav.home') === 'Home' ? 'Analytics' : 'Analytique'}
              </h3>
              <p className="text-gray-600">
                {t('nav.home') === 'Home'
                  ? 'Track trends and statistics over time'
                  : 'Suivez les tendances et statistiques dans le temps'}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
              <div className="flex justify-center mb-4">
                <Shield size={48} className="text-quebec-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('nav.home') === 'Home' ? 'Reliable Data' : 'Données fiables'}
              </h3>
              <p className="text-gray-600">
                {t('nav.home') === 'Home'
                  ? 'Based on Quebec public health laboratory results'
                  : 'Basé sur les résultats de laboratoires de santé publique du Québec'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-quebec-gray">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            {t('nav.home') === 'Home' ? 'Stay Informed' : 'Restez informé'}
          </h2>
          <p className="text-lg mb-8 text-gray-600">
            {t('nav.home') === 'Home'
              ? 'Create an account to customize your alerts and track outbreaks in your area'
              : 'Créez un compte pour personnaliser vos alertes et suivre les éclosions dans votre région'}
          </p>
          <Link
            to="/register"
            className="px-8 py-3 bg-quebec-blue text-white rounded-lg font-semibold hover:bg-quebec-blue-dark transition inline-block"
          >
            {t('nav.register')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
