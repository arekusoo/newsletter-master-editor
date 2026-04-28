import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialValue?: string;
  title: string;
  isLoading?: boolean;
}

const PresetModal: React.FC<PresetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialValue = '', 
  title,
  isLoading = false
}) => {
  const [name, setName] = useState(initialValue);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim() && !isLoading) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome do Layout</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim() && !isLoading) {
                  handleSave();
                }
              }}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="Ex: Newsletter de Abril"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || isLoading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {title === 'Salvar Novo Layout' ? 'Salvar Layout' : 'Renomear'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresetModal;
