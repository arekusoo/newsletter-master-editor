import React, { useState } from 'react';
import { Type, Image as ImageIcon, Minus, Star, LayoutGrid, Columns2, Columns3, MousePointer2, Smile, Bookmark, Search, Trash2, Edit2, Clock } from 'lucide-react';
import { BlockType, Preset } from '../types';

interface BlocksSidebarProps {
  activeTab: 'blocks' | 'layouts' | 'models';
  setActiveTab: (tab: 'blocks' | 'layouts' | 'models') => void;
  presets: Preset[];
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
  onRenamePreset: (id: string) => void;
}

const NewsletterPreview: React.FC<{ blocks: any[], settings: any }> = ({ blocks, settings }) => {
  return (
    <div 
      className="w-full aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative mb-3 group-hover:border-blue-300 transition-colors"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <div 
        className="absolute inset-x-0 top-0 origin-top scale-[0.15] w-[600px] mx-auto shadow-sm"
        style={{ backgroundColor: settings.contentBackgroundColor, minHeight: '800px' }}
      >
        {blocks.map((block: any, i: number) => (
          <div key={i} className="w-full border-b border-slate-100/10" style={{ padding: '4px 0' }}>
            <div className="h-4 bg-slate-200/50 mx-4 rounded" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
          <Clock size={16} className="text-blue-600" />
        </div>
      </div>
    </div>
  );
};

const BlocksSidebar: React.FC<BlocksSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  presets, 
  onLoadPreset, 
  onDeletePreset, 
  onRenamePreset
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragStart = (e: React.DragEvent, type: BlockType | string, data?: any) => {
    e.dataTransfer.setData('blockType', type);
    if (data) {
      e.dataTransfer.setData('blockData', JSON.stringify(data));
    }
  };

  const blocks = [
    { type: 'text', icon: Type, label: 'Texto' },
    { type: 'image', icon: ImageIcon, label: 'Imagem' },
    { type: 'button', icon: MousePointer2, label: 'Botão' },
    { type: 'icon', icon: Star, label: 'Ícone' },
    { type: 'divider', icon: Minus, label: 'Divisor' },
    { type: 'emoji', icon: Smile, label: 'Emoji' },
  ];

  const layouts = [
    { type: 'column-layout', data: { columns: 2 }, icon: Columns2, label: '2 Colunas' },
    { type: 'column-layout', data: { columns: 3 }, icon: Columns3, label: '3 Colunas' },
  ];

  const filteredPresets = presets.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm">
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'blocks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Blocos
        </button>
        <button
          onClick={() => setActiveTab('layouts')}
          className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'layouts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Layouts
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'models' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Modelos
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        {activeTab === 'blocks' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-4">Elementos Básicos</p>
            {blocks.map((block) => (
              <div
                key={block.type}
                draggable
                onDragStart={(e) => handleDragStart(e, block.type)}
                className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <block.icon size={20} className="text-slate-600 group-hover:text-blue-600 mr-3" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600">{block.label}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'layouts' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-4">Grades de Imagem</p>
            {layouts.map((layout, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => handleDragStart(e, layout.type, layout.data)}
                className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <layout.icon size={20} className="text-slate-600 group-hover:text-blue-600 mr-3" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600">{layout.label}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-4">
            <div className="relative mb-6">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar modelos..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {filteredPresets.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="group p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all flex flex-col"
                  >
                    <div 
                      className="cursor-pointer"
                      onClick={() => onLoadPreset(preset)}
                    >
                      <NewsletterPreview blocks={preset.blocks} settings={preset.settings} />
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors truncate pr-2">
                            {preset.name}
                          </h4>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            <Clock size={10} />
                            {new Date(preset.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); onRenamePreset(preset.id); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                            title="Renomear"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeletePreset(preset.id); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onLoadPreset(preset)}
                      className="w-full py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Carregar Modelo
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Bookmark size={20} className="text-slate-300" />
                </div>
                <h5 className="text-sm font-bold text-slate-700 mb-1">Nenhum modelo encontrado</h5>
                <p className="text-xs text-slate-400">
                  {searchQuery ? 'Tente uma busca diferente' : 'Salve seus layouts favoritos para acessá-los rapidamente aqui.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 text-center">
          {activeTab === 'models' ? 'Gerencie seus modelos salvos' : 'Arraste os elementos para o canvas'}
        </p>
      </div>
    </div>
  );
};

export default BlocksSidebar;
