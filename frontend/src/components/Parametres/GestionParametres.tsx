import React, { useState } from 'react';
import { Save, Plus, Trash2, Settings, Clock, Bell, Shield, Globe } from 'lucide-react';
import { useParametres } from '../../context/ParametresContext';
import { Parametre } from '../../types';

export function GestionParametres() {
  const { parametres, mettreAJourParametre, ajouterParametre, supprimerParametre } = useParametres();
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cle: '',
    valeur: '',
    description: '',
    type: 'text' as Parametre['type'],
    categorie: 'general' as Parametre['categorie'],
    options: [] as string[]
  });

  const categories = [
    { id: 'general', label: 'Général', icon: Globe },
    { id: 'workflow', label: 'Workflow', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'securite', label: 'Sécurité', icon: Shield }
  ];

  const filteredParametres = selectedCategorie 
    ? parametres.filter(p => p.categorie === selectedCategorie)
    : parametres;

  const handleSave = (parametreId: string, valeur: string) => {
    mettreAJourParametre(parametreId, valeur);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ajouterParametre(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cle: '',
      valeur: '',
      description: '',
      type: 'text',
      categorie: 'general',
      options: []
    });
    setShowModal(false);
  };

  const renderParametreInput = (parametre: Parametre) => {
    const [localValue, setLocalValue] = useState(parametre.valeur);
    const [hasChanged, setHasChanged] = useState(false);

    const handleChange = (value: string) => {
      setLocalValue(value);
      setHasChanged(value !== parametre.valeur);
    };

    const handleSaveLocal = () => {
      handleSave(parametre.id, localValue);
      setHasChanged(false);
    };

    switch (parametre.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={localValue === 'true'}
              onChange={(e) => handleChange(e.target.checked ? 'true' : 'false')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            {hasChanged && (
              <button
                onClick={handleSaveLocal}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <Save className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {hasChanged && (
              <button
                onClick={handleSaveLocal}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <Save className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div className="flex items-center space-x-3">
            <select
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {parametre.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {hasChanged && (
              <button
                onClick={handleSaveLocal}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <Save className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      
      default:
        return (
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {hasChanged && (
              <button
                onClick={handleSaveLocal}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <Save className="w-3 h-3" />
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Paramètres système</h2>
            <p className="text-gray-600 mt-1">Configuration de l'application</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau paramètre</span>
          </button>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategorie('')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              !selectedCategorie ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Toutes les catégories</span>
          </button>
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategorie(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCategorie === cat.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des paramètres */}
      <div className="space-y-6">
        {categories.map(categorie => {
          const parametresCategorie = filteredParametres.filter(p => p.categorie === categorie.id);
          if (parametresCategorie.length === 0 && selectedCategorie) return null;
          if (parametresCategorie.length === 0) return null;

          const Icon = categorie.icon;
          
          return (
            <div key={categorie.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{categorie.label}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {parametresCategorie.map(parametre => (
                    <div key={parametre.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1 mr-6">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{parametre.cle}</h4>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {parametre.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{parametre.description}</p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <span>Modifié par {parametre.modifiePar.prenom} {parametre.modifiePar.nom}</span>
                          <span>•</span>
                          <span>{new Date(parametre.dateModification).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {renderParametreInput(parametre)}
                        <button
                          onClick={() => supprimerParametre(parametre.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal d'ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Nouveau paramètre</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clé *
                </label>
                <input
                  type="text"
                  value={formData.cle}
                  onChange={(e) => setFormData(prev => ({ ...prev, cle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Parametre['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="text">Texte</option>
                    <option value="number">Nombre</option>
                    <option value="boolean">Booléen</option>
                    <option value="select">Sélection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={formData.categorie}
                    onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value as Parametre['categorie'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur par défaut *
                </label>
                <input
                  type="text"
                  value={formData.valeur}
                  onChange={(e) => setFormData(prev => ({ ...prev, valeur: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {formData.type === 'select' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options (séparées par des virgules)
                  </label>
                  <input
                    type="text"
                    placeholder="option1,option2,option3"
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      options: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}