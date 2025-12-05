import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Bell, BarChart3, Shield, Activity, ArrowRight, Building2, Users, TrendingUp, Zap } from 'lucide-react';
import Beams from '../components/Beams';
import DecryptedText from '../components/DecryptedText';

const Home = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = t('nav.home') === 'Home';

  return (
    <div className="min-h-screen relative bg-black">
      {/* Beams Background - React Bits Style */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Beams
          beamWidth={2.5}
          beamHeight={30}
          beamNumber={48}
          lightColor="#60a5fa"
          speed={2}
          noiseIntensity={1.5}
          scale={0.2}
          rotation={0}
        />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32" style={{ zIndex: 10 }}>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium mb-8">
              <Activity className="w-4 h-4" />
              {isEnglish ? 'Real-Time Epidemic Monitoring' : 'Surveillance Épidémique en Temps Réel'}
            </div>

            {/* Main Title */}
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <DecryptedText
                text="EpidemiQc"
                speed={80}
                sequential={true}
                animateOn="both"
              />
            </h1>
            <p className="text-xl lg:text-2xl text-slate-300 mb-6">
              {t('app.subtitle')}
            </p>
            <p className="text-lg text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              {isEnglish
                ? 'Advanced real-time monitoring of epidemic outbreaks across Quebec. Protect your community with instant alerts, interactive maps, and comprehensive analytics.'
                : 'Surveillance avancée en temps réel des éclosions épidémiques au Québec. Protégez votre communauté avec des alertes instantanées, des cartes interactives et des analyses complètes.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link
                to="/map"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                {isEnglish ? 'Explore Interactive Map' : 'Explorer la Carte'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/hospitals"
                className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white rounded-xl font-semibold hover:bg-slate-700/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Building2 className="w-5 h-5" />
                {isEnglish ? 'Hospital Monitoring' : 'Surveillance Hôpitaux'}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-blue-400 mb-1">17</div>
                <div className="text-slate-400 text-sm">{isEnglish ? 'Regions' : 'Régions'}</div>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-purple-400 mb-1">40+</div>
                <div className="text-slate-400 text-sm">{isEnglish ? 'Hospitals' : 'Hôpitaux'}</div>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-pink-400 mb-1">24/7</div>
                <div className="text-slate-400 text-sm">{isEnglish ? 'Monitoring' : 'Surveillance'}</div>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-green-400 mb-1">6</div>
                <div className="text-slate-400 text-sm">{isEnglish ? 'Conditions' : 'Maladies'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative" style={{ zIndex: 10 }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              {isEnglish ? 'Powerful Features' : 'Fonctionnalités Puissantes'}
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {isEnglish
                ? 'Everything you need to stay informed and protect your community from epidemic outbreaks'
                : 'Tout ce dont vous avez besoin pour rester informé et protéger votre communauté'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors">
                <MapPin className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {isEnglish ? 'Interactive Map' : 'Carte Interactive'}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {isEnglish
                  ? 'Real-time visualization of outbreaks with color-coded severity levels and hospital locations'
                  : 'Visualisation en temps réel avec niveaux de gravité et emplacements des hôpitaux'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-colors">
                <Bell className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {isEnglish ? 'Smart Alerts' : 'Alertes Intelligentes'}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {isEnglish
                  ? 'Customizable notifications for outbreaks in your region with severity-based filtering'
                  : 'Notifications personnalisables avec filtrage par gravité pour votre région'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-pink-500/10 to-pink-600/5 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-8 hover:border-pink-500/40 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-pink-500/30 transition-colors">
                <BarChart3 className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {isEnglish ? 'Live Analytics' : 'Analyses en Direct'}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {isEnglish
                  ? 'Track trends, statistics, and diagnostic rates updated every minute'
                  : 'Suivez les tendances et taux de diagnostic mis à jour chaque minute'}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8 hover:border-green-500/40 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-colors">
                <Shield className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {isEnglish ? 'Verified Data' : 'Données Vérifiées'}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {isEnglish
                  ? 'Based on official Quebec public health laboratory test results and data'
                  : 'Basé sur les résultats officiels des laboratoires de santé publique'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Monitoring Section */}
      <section className="py-20 relative" style={{ zIndex: 10 }}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6 w-fit">
                  <Zap className="w-4 h-4" />
                  {isEnglish ? 'New Feature' : 'Nouvelle Fonctionnalité'}
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  {isEnglish ? 'Hospital Monitoring Dashboard' : 'Tableau de Bord Hospitalier'}
                </h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  {isEnglish
                    ? 'Track diagnostic rates for every hospital in real-time. Compare current rates with normal baselines and get instant updates every minute.'
                    : 'Suivez les taux de diagnostic de chaque hôpital en temps réel. Comparez avec les niveaux normaux et recevez des mises à jour instantanées.'}
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-slate-300">{isEnglish ? '40+ Hospitals Tracked' : '40+ Hôpitaux Surveillés'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-slate-300">{isEnglish ? 'Auto-refresh Every Minute' : 'Actualisation Automatique'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-pink-400" />
                    </div>
                    <span className="text-slate-300">{isEnglish ? 'Color-Coded Severity Levels' : 'Niveaux de Gravité Codés'}</span>
                  </div>
                </div>
                <Link
                  to="/hospitals"
                  className="group px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2 w-fit"
                >
                  {isEnglish ? 'View Hospital Dashboard' : 'Voir le Tableau de Bord'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-12 flex items-center justify-center">
                <div className="relative w-full aspect-square max-w-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center h-full">
                    <Activity className="w-24 h-24 text-purple-400 mb-6" />
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white mb-2">6</div>
                      <div className="text-slate-400">{isEnglish ? 'Diseases Monitored' : 'Maladies Surveillées'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative" style={{ zIndex: 10 }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-3xl p-12">
            <Users className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              {isEnglish ? 'Stay Ahead of Outbreaks' : 'Devancez les Éclosions'}
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              {isEnglish
                ? 'Join thousands of Quebecers protecting their communities. Create your account to customize alerts and track outbreaks in your region.'
                : 'Rejoignez des milliers de Québécois protégeant leurs communautés. Créez votre compte pour personnaliser vos alertes.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {t('nav.register')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white rounded-xl font-semibold hover:bg-slate-700/50 transition-all duration-300"
              >
                {t('nav.login')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Add custom animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;
