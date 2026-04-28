import React, { useState } from 'react';
import { Type, Image as ImageIcon, Minus, Star, LayoutGrid, Columns2, Columns3, MousePointer2, Smile, Bookmark, Search, Trash2, Edit2, Clock, Sparkles, Loader2, Send } from 'lucide-react';
import { BlockType, Preset, NewsletterBlock } from '../types';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';

interface BlocksSidebarProps {
  activeTab: 'blocks' | 'layouts' | 'models';
  setActiveTab: (tab: 'blocks' | 'layouts' | 'models') => void;
  presets: Preset[];
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
  onRenamePreset: (id: string) => void;
  onAddAIGeneratedBlocks: (blocks: NewsletterBlock[]) => void;
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
  onRenamePreset,
  onAddAIGeneratedBlocks
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    const toastId = toast.loading('Gerando modelo com IA...');

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Configuração da API Key do Gemini não encontrada.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemPrompt = `Você é um designer de newsletters especialista. 
      Gere uma estrutura de newsletter em formato JSON baseada na descrição do usuário.
      O JSON deve ser um array de objetos seguindo esta estrutura EXATA:
      [
        {
          "id": "string",
          "type": "text" | "image" | "button" | "divider" | "emoji" | "icon" | "column-layout",
          "data": { ... }
        }
      ]
      
      Regras de dados:
      - text: { content: string, fontSize: number, color: string, textAlign: 'left'|'center'|'right' }
      - image: { url: string, alt: string, borderRadius: number, width: number }
      - button: { text: string, url: string, backgroundColor: string, color: string, borderRadius: number, textAlign: 'center' }
      - divider: { color: string, height: number, margin: number }
      - emoji: { emoji: string, fontSize: number, textAlign: 'center' }
      - icon: { iconName: string, size: 'small'|'medium'|'large', color: string }
      - column-layout: { columns: 2|3, items: [{ type, data }] }
      
      Importante: Gere IDs únicos usando Math.random().toString(36).substr(2, 9).
      Retorne APENAS o array JSON puro.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${systemPrompt}\n\nPedido do usuário: ${aiPrompt}`,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const text = result.text;
      if (!text) {
        throw new Error('A IA não retornou conteúdo.');
      }
      
      // Robust JSON extraction
      let generatedBlocks;
      try {
        const match = text.match(/\[[\s\S]*\]/);
        const jsonStr = match ? match[0] : text;
        generatedBlocks = JSON.parse(jsonStr);
      } catch (e) {
        console.error('Failed to parse AI JSON:', text);
        throw new Error('A resposta da IA não está em um formato JSON válido.');
      }
      
      if (Array.isArray(generatedBlocks)) {
        onAddAIGeneratedBlocks(generatedBlocks);
        setAiPrompt('');
        setShowAiInput(false);
        toast.success('Modelo gerado com sucesso!', { id: toastId });
      } else {
        throw new Error('A resposta da IA não é um formato de lista válido.');
      }
    } catch (error) {
      console.error('Error generating with AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro deconhecido';
      toast.error(`Falha ao gerar com IA: ${errorMessage}`, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

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
    { type: 'flex-row', data: { items: [], gap: 10, alignItems: 'center' }, icon: LayoutGrid, label: 'Linha Flexível' },
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
            <button
              onClick={() => setShowAiInput(!showAiInput)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all mb-6"
            >
              <Sparkles size={16} />
              Criar com IA
            </button>

            {showAiInput && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Descreva sua newsletter</p>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Uma newsletter minimalista para uma agência de viagens com tons de azul e fotos de praias..."
                  className="w-full p-3 bg-white border border-blue-200 rounded-lg text-xs h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                <button
                  onClick={generateWithAI}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Gerar Modelo
                    </>
                  )}
                </button>
              </div>
            )}

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
