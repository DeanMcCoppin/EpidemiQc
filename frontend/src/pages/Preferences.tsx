import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { preferenceService } from '../services/preference.service';
import { regionService } from '../services/region.service';
import { conditionService } from '../services/condition.service';
import { UserPreference, Region, Condition } from '../types';
import { Plus, Trash2 } from 'lucide-react';

const Preferences = () => {
  const { t, i18n } = useTranslation();
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    conditionId: 0,
    regionId: 0,
    emailEnabled: true,
    pushEnabled: true,
    minSeverity: 'warning',
  });

  useEffect(() => {
    loadData();
  }, [i18n.language]);

  const loadData = async () => {
    try {
      const [prefRes, regionRes, condRes] = await Promise.all([
        preferenceService.getPreferences(i18n.language),
        regionService.getRegions(i18n.language),
        conditionService.getConditions(i18n.language),
      ]);

      if (prefRes.success && prefRes.data) setPreferences(prefRes.data.preferences);
      if (regionRes.success && regionRes.data) setRegions(regionRes.data.regions);
      if (condRes.success && condRes.data) setConditions(condRes.data.conditions);
    } catch (error) {
      toast.error('Error loading preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPreference = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.conditionId === 0 || formData.regionId === 0) {
      toast.error('Please select both condition and region');
      return;
    }

    try {
      await preferenceService.createPreference(formData);
      toast.success('Preference added successfully');
      setShowAddForm(false);
      setFormData({
        conditionId: 0,
        regionId: 0,
        emailEnabled: true,
        pushEnabled: true,
        minSeverity: 'warning',
      });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Error adding preference');
    }
  };

  const handleDeletePreference = async (id: number) => {
    if (!confirm(t('preferences.deleteConfirm'))) return;

    try {
      await preferenceService.deletePreference(id);
      toast.success('Preference deleted');
      loadData();
    } catch (error) {
      toast.error('Error deleting preference');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('preferences.title')}</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-quebec-blue text-white rounded-lg hover:bg-quebec-blue-dark transition"
          >
            <Plus size={20} />
            <span>{t('preferences.addNew')}</span>
          </button>
        </div>

        {/* Add Preference Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <form onSubmit={handleAddPreference} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('preferences.selectCondition')}
                </label>
                <select
                  value={formData.conditionId}
                  onChange={(e) => setFormData({ ...formData, conditionId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-quebec-blue focus:border-quebec-blue"
                  required
                >
                  <option value={0}>-- Select --</option>
                  {conditions.map((cond) => (
                    <option key={cond.id} value={cond.id}>
                      {cond.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('preferences.selectRegion')}
                </label>
                <select
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-quebec-blue focus:border-quebec-blue"
                  required
                >
                  <option value={0}>-- Select --</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('preferences.minSeverity')}
                </label>
                <select
                  value={formData.minSeverity}
                  onChange={(e) => setFormData({ ...formData, minSeverity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-quebec-blue focus:border-quebec-blue"
                >
                  <option value="warning">{t('severity.warning')}</option>
                  <option value="alert">{t('severity.alert')}</option>
                  <option value="critical">{t('severity.critical')}</option>
                </select>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.emailEnabled}
                    onChange={(e) => setFormData({ ...formData, emailEnabled: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{t('preferences.emailNotifications')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.pushEnabled}
                    onChange={(e) => setFormData({ ...formData, pushEnabled: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{t('preferences.pushNotifications')}</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-quebec-blue text-white rounded hover:bg-quebec-blue-dark transition"
                >
                  {t('preferences.save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  {t('preferences.cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Preferences List */}
        {preferences.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">{t('preferences.noPreferences')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {preferences.map((pref) => (
              <div key={pref.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{pref.condition.name}</h3>
                    <p className="text-gray-600">{pref.region.name}</p>
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">{t('preferences.minSeverity')}:</span>{' '}
                        {t(`severity.${pref.minSeverity}`)}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">{t('preferences.emailNotifications')}:</span>{' '}
                        {pref.emailEnabled ? 'Yes' : 'No'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">{t('preferences.pushNotifications')}:</span>{' '}
                        {pref.pushEnabled ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePreference(pref.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Preferences;
