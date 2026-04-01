import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { MATERIAL_SYMBOLS } from '../constants/materialSymbols';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
}

const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredIcons = MATERIAL_SYMBOLS.filter(name => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Escolher Ícone (Material Symbols)</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar ícones..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {filteredIcons.map(name => (
            <button
              key={name}
              onClick={() => {
                onSelect(name);
                onClose();
              }}
              className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all group"
              title={name}
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                {name}
              </span>
              <span className="text-[10px] mt-1 truncate w-full text-center text-slate-500 group-hover:text-blue-500">
                {name.replace(/_/g, ' ')}
              </span>
            </button>
          ))}
          {filteredIcons.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              Nenhum ícone encontrado para "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IconPickerModal;
