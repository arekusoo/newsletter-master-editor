import React from 'react';
import { NewsletterBlock, NewsletterSettings } from '../types';
import * as LucideIcons from 'lucide-react';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Type, Image as ImageIcon, Star, Minus, LayoutGrid, Settings2, MousePointer2, Upload, ArrowUp, ArrowDown, Smile, Sparkles, Loader2, Link as LinkIcon, RefreshCw, Maximize2, Square, Circle } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { GoogleGenAI } from "@google/genai";

interface PropertiesPanelProps {
  selectedBlock: NewsletterBlock | null;
  onUpdateBlock: (id: string, data: any) => void;
  settings: NewsletterSettings;
  onUpdateSettings: (settings: Partial<NewsletterSettings>) => void;
  onOpenIconPicker: (callback: (iconName: string) => void) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedBlock,
  onUpdateBlock,
  settings,
  onUpdateSettings,
  onOpenIconPicker
}) => {
  const [emojiPickerTarget, setEmojiPickerTarget] = React.useState<'main' | number | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');

  const generateImage = async (onSuccess: (url: string) => void) => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          onSuccess(imageUrl);
          setPrompt('');
          break;
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Erro ao gerar imagem. Verifique sua chave de API.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedBlock) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-slate-800">
          <Settings2 size={20} className="text-blue-600" />
          <h3 className="font-bold">Configurações Gerais</h3>
        </div>

        <div className="space-y-6">
          <section>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tipografia</label>
            <select
              value={settings.fontFamily}
              onChange={(e) => onUpdateSettings({ fontFamily: e.target.value as any })}
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="sans-serif">Padrão (Sans-serif)</option>
              <option value="Poppins">Poppins</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Helvetica">Helvetica</option>
            </select>
          </section>

          <section>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Cores da Página</label>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">Fundo Externo</p>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none p-0"
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
                    className="flex-1 p-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Fundo do Conteúdo (600px)</p>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.contentBackgroundColor}
                    onChange={(e) => onUpdateSettings({ contentBackgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none p-0"
                  />
                  <input
                    type="text"
                    value={settings.contentBackgroundColor}
                    onChange={(e) => onUpdateSettings({ contentBackgroundColor: e.target.value })}
                    className="flex-1 p-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const updateData = (newData: any) => {
    onUpdateBlock(selectedBlock.id, { ...selectedBlock.data, ...newData });
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-800">
          {selectedBlock.type === 'text' && <Type size={20} className="text-blue-600" />}
          {selectedBlock.type === 'image' && <ImageIcon size={20} className="text-blue-600" />}
          {selectedBlock.type === 'icon' && <Star size={20} className="text-blue-600" />}
          {selectedBlock.type === 'divider' && <Minus size={20} className="text-blue-600" />}
          {selectedBlock.type === 'button' && <MousePointer2 size={20} className="text-blue-600" />}
          {selectedBlock.type === 'column-layout' && <LayoutGrid size={20} className="text-blue-600" />}
          <h3 className="font-bold capitalize">{selectedBlock.type === 'column-layout' ? 'Colunas' : selectedBlock.type}</h3>
        </div>
      </div>

      <div className="space-y-6">
        {selectedBlock.type === 'text' && (
          <>
            <section className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conteúdo</label>
                <textarea
                  value={selectedBlock.data.content}
                  onChange={(e) => updateData({ content: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50"
                  placeholder="Digite seu texto aqui..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alinhamento</label>
                  <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    {['left', 'center', 'right'].map(a => (
                      <button
                        key={a}
                        onClick={() => updateData({ textAlign: a })}
                        className={`flex-1 py-1.5 rounded-md transition-all ${selectedBlock.data.textAlign === a ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {a === 'left' ? <AlignLeft size={14} className="mx-auto" /> : a === 'center' ? <AlignCenter size={14} className="mx-auto" /> : <AlignRight size={14} className="mx-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estilo</label>
                  <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <button
                      onClick={() => updateData({ fontWeight: selectedBlock.data.fontWeight === 'bold' ? 'normal' : 'bold' })}
                      className={`flex-1 py-1.5 rounded-md transition-all ${selectedBlock.data.fontWeight === 'bold' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Bold size={14} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => updateData({ fontStyle: selectedBlock.data.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      className={`flex-1 py-1.5 rounded-md transition-all ${selectedBlock.data.fontStyle === 'italic' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Italic size={14} className="mx-auto" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tamanho</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Type size={14} className="text-slate-400" />
                    <input
                      type="number"
                      value={selectedBlock.data.fontSize || 16}
                      onChange={(e) => updateData({ fontSize: parseInt(e.target.value) || 16 })}
                      className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                    <input
                      type="color"
                      value={selectedBlock.data.color || '#334155'}
                      onChange={(e) => updateData({ color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-500 uppercase">{selectedBlock.data.color || '#334155'}</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {selectedBlock.type === 'image' && (
          <>
            <section>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Imagem</label>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2 text-blue-700 mb-1">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Gerar com IA</span>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none min-h-[60px]"
                    placeholder="Descreva a imagem que deseja gerar..."
                  />
                  <button
                    onClick={() => generateImage((url) => updateData({ url }))}
                    disabled={isGenerating || !prompt}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {isGenerating ? 'Gerando...' : 'Gerar Imagem'}
                  </button>
                </div>

                <button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => {
                          updateData({ url: re.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-200"
                >
                  <Upload size={14} />
                  Fazer Upload
                </button>
                <div className="relative">
                  <p className="text-[10px] text-slate-500 mb-1">Ou insira o link</p>
                  <input
                    type="text"
                    value={selectedBlock.data.url}
                    onChange={(e) => updateData({ url: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                <div className="relative">
                  <p className="text-[10px] text-slate-500 mb-1">Link ao clicar (URL)</p>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    <LinkIcon size={14} className="text-slate-400" />
                    <input
                      type="text"
                      value={selectedBlock.data.linkUrl || ''}
                      onChange={(e) => updateData({ linkUrl: e.target.value })}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="https://exemplo.com"
                    />
                  </div>
                </div>
              </div>
            </section>
            <section>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Configurações</label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-[10px] text-slate-500">Largura (%)</p>
                    <span className="text-[10px] font-bold">{selectedBlock.data.width}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={selectedBlock.data.width}
                    onChange={(e) => updateData({ width: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-[10px] text-slate-500">Arredondamento (px)</p>
                    <span className="text-[10px] font-bold">{selectedBlock.data.borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedBlock.data.borderRadius}
                    onChange={(e) => updateData({ borderRadius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {selectedBlock.type === 'icon' && (
          <>
            <section className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ícone Selecionado</label>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm"
                      style={{ 
                        color: selectedBlock.data.color || '#3b82f6',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                        {selectedBlock.data.iconName || 'star'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 capitalize">{selectedBlock.data.iconName || 'star'}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Material Symbol</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenIconPicker((iconName) => updateData({ iconName }))}
                    className="p-2 bg-white hover:bg-slate-50 text-blue-600 rounded-lg border border-slate-200 transition-all shadow-sm"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tamanho</label>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large'].map(s => (
                      <button
                        key={s}
                        onClick={() => updateData({ size: s })}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                          (selectedBlock.data.size || 'medium') === s ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {s === 'small' ? 'P' : s === 'medium' ? 'M' : 'G'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor do Ícone</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                    <input
                      type="color"
                      value={selectedBlock.data.color || '#3b82f6'}
                      onChange={(e) => updateData({ color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-500 uppercase">{selectedBlock.data.color || '#3b82f6'}</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {selectedBlock.type === 'emoji' && (
          <section className="space-y-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Configurações do Emoji</label>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emoji Selecionado</label>
                <div className="relative">
                  <button
                    onClick={() => setEmojiPickerTarget(emojiPickerTarget === 'main' ? null : 'main')}
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl text-5xl text-center hover:bg-slate-100 transition-all focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
                  >
                    {selectedBlock.data.emoji || '😊'}
                  </button>
                  
                  {emojiPickerTarget === 'main' && (
                    <div className="absolute left-0 right-0 z-50 mt-2 shadow-2xl rounded-xl overflow-hidden border border-slate-200">
                      <EmojiPicker 
                        onEmojiClick={(emojiData: EmojiClickData) => {
                          updateData({ emoji: emojiData.emoji });
                          setEmojiPickerTarget(null);
                        }}
                        width="100%"
                        height={350}
                        previewConfig={{ showPreview: false }}
                        skinTonesDisabled
                        searchPlaceHolder="Procurar emoji..."
                      />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center">Clique no emoji para trocar</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tamanho</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Maximize2 size={14} className="text-slate-400" />
                    <input
                      type="number"
                      value={selectedBlock.data.fontSize || 48}
                      onChange={(e) => updateData({ fontSize: parseInt(e.target.value) || 24 })}
                      className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alinhamento</label>
                  <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    {['left', 'center', 'right'].map(a => (
                      <button
                        key={a}
                        onClick={() => updateData({ textAlign: a })}
                        className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center ${selectedBlock.data.textAlign === a ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {a === 'left' ? <AlignLeft size={14} /> : a === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {selectedBlock.type === 'divider' && (
          <section className="space-y-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Configurações do Divisor</label>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor do Divisor</label>
                <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                  <input
                    type="color"
                    value={selectedBlock.data.color || '#e2e8f0'}
                    onChange={(e) => updateData({ color: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-500 uppercase">{selectedBlock.data.color || '#e2e8f0'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Espessura (px)</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Maximize2 size={14} className="text-slate-400" />
                    <input
                      type="number"
                      value={selectedBlock.data.height || 1}
                      onChange={(e) => updateData({ height: parseInt(e.target.value) || 1 })}
                      className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Margem (px)</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Maximize2 size={14} className="text-slate-400" />
                    <input
                      type="number"
                      value={selectedBlock.data.margin || 16}
                      onChange={(e) => updateData({ margin: parseInt(e.target.value) || 0 })}
                      className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {selectedBlock.type === 'button' && (
          <>
            <section>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Estilo do Botão</label>
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                {(['button', 'link'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => updateData({ variant: v })}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                      (selectedBlock.data.variant || 'button') === v ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {v === 'button' ? 'Botão' : 'Link'}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Texto do Botão</label>
              <input
                type="text"
                value={selectedBlock.data.text}
                onChange={(e) => updateData({ text: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
            </section>
            <section>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Link (URL)</label>
              <input
                type="text"
                value={selectedBlock.data.url}
                onChange={(e) => updateData({ url: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                placeholder="https://exemplo.com"
              />
            </section>
            <section className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Estilo</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor de Fundo</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                    <input
                      type="color"
                      value={selectedBlock.data.backgroundColor || '#3b82f6'}
                      onChange={(e) => updateData({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-500 uppercase">{selectedBlock.data.backgroundColor || '#3b82f6'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor do Texto</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                    <input
                      type="color"
                      value={selectedBlock.data.color || '#ffffff'}
                      onChange={(e) => updateData({ color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-500 uppercase">{selectedBlock.data.color || '#ffffff'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arredondamento</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Maximize2 size={14} className="text-slate-400" />
                    <input
                      type="number"
                      value={selectedBlock.data.borderRadius}
                      onChange={(e) => updateData({ borderRadius: parseInt(e.target.value) })}
                      className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tamanho Fonte</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Type size={14} className="text-slate-400" />
                    <input
                      type="number"
                      value={selectedBlock.data.fontSize}
                      onChange={(e) => updateData({ fontSize: parseInt(e.target.value) })}
                      className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pad. X</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Maximize2 size={14} className="text-slate-400" />
                    <input
                      type="number"
                      value={selectedBlock.data.paddingX}
                      onChange={(e) => updateData({ paddingX: parseInt(e.target.value) })}
                      className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pad. Y</label>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Maximize2 size={14} className="text-slate-400" />
                    <input
                      type="number"
                      value={selectedBlock.data.paddingY}
                      onChange={(e) => updateData({ paddingY: parseInt(e.target.value) })}
                      className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer group">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Largura Total (100%)</span>
                <input
                  type="checkbox"
                  checked={selectedBlock.data.fullWidth}
                  onChange={(e) => updateData({ fullWidth: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alinhamento</label>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                  {['left', 'center', 'right'].map(a => (
                    <button
                      key={a}
                      onClick={() => updateData({ textAlign: a })}
                      className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center ${selectedBlock.data.textAlign === a ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {a === 'left' ? <AlignLeft size={14} /> : a === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {selectedBlock.type === 'column-layout' && (
          <>
            <section>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Conteúdo das Colunas</label>
              <p className="text-[10px] text-slate-400 mb-4 italic">Arraste blocos da barra lateral para as colunas no canvas para preenchê-las.</p>
              <div className="space-y-4">
                {selectedBlock.data.items.map((item: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Coluna {i + 1}</p>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 rounded text-slate-600 font-bold uppercase">{item.type}</span>
                    </div>

                    {item.type === 'text' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conteúdo</label>
                          <textarea
                            value={item.data.content}
                            onChange={(e) => {
                              const newItems = [...selectedBlock.data.items];
                              newItems[i].data = { ...newItems[i].data, content: e.target.value };
                              updateData({ items: newItems });
                            }}
                            className="w-full p-3 border border-slate-200 rounded-xl text-sm h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Texto da coluna..."
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alinhamento</label>
                            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                              {['left', 'center', 'right'].map(a => (
                                <button
                                  key={a}
                                  onClick={() => {
                                    const newItems = [...selectedBlock.data.items];
                                    newItems[i].data = { ...newItems[i].data, textAlign: a };
                                    updateData({ items: newItems });
                                  }}
                                  className={`flex-1 py-1.5 rounded-md transition-all ${item.data.textAlign === a ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                  {a === 'left' ? <AlignLeft size={14} className="mx-auto" /> : a === 'center' ? <AlignCenter size={14} className="mx-auto" /> : <AlignRight size={14} className="mx-auto" />}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estilo</label>
                            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                              <button
                                onClick={() => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, fontWeight: item.data.fontWeight === 'bold' ? 'normal' : 'bold' };
                                  updateData({ items: newItems });
                                }}
                                className={`flex-1 py-1.5 rounded-md transition-all ${item.data.fontWeight === 'bold' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                <Bold size={14} className="mx-auto" />
                              </button>
                              <button
                                onClick={() => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, fontStyle: item.data.fontStyle === 'italic' ? 'normal' : 'italic' };
                                  updateData({ items: newItems });
                                }}
                                className={`flex-1 py-1.5 rounded-md transition-all ${item.data.fontStyle === 'italic' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                <Italic size={14} className="mx-auto" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tamanho</label>
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                              <Type size={14} className="text-slate-400" />
                              <input
                                type="number"
                                value={item.data.fontSize || 14}
                                onChange={(e) => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, fontSize: parseInt(e.target.value) || 14 };
                                  updateData({ items: newItems });
                                }}
                                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor</label>
                            <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                              <input
                                type="color"
                                value={item.data.color || '#334155'}
                                onChange={(e) => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, color: e.target.value };
                                  updateData({ items: newItems });
                                }}
                                className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                              />
                              <span className="text-xs font-mono text-slate-500 uppercase">{item.data.color || '#334155'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type === 'image' && (
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                          <div className="flex items-center gap-2 text-blue-700">
                            <Sparkles size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">IA</span>
                          </div>
                          <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full p-2 bg-white border border-blue-200 rounded-lg text-[10px] focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Descreva a imagem..."
                          />
                          <button
                            onClick={() => generateImage((url) => {
                              const newItems = [...selectedBlock.data.items];
                              newItems[i].data = { ...newItems[i].data, url };
                              updateData({ items: newItems });
                            })}
                            disabled={isGenerating || !prompt}
                            className="w-full py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            Gerar
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">URL da Imagem</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={item.data.url}
                              onChange={(e) => {
                                const newItems = [...selectedBlock.data.items];
                                newItems[i].data = { ...newItems[i].data, url: e.target.value };
                                updateData({ items: newItems });
                              }}
                              className="flex-1 p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                              placeholder="https://..."
                            />
                            <label className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-all text-slate-600">
                              <ImageIcon size={20} />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const newItems = [...selectedBlock.data.items];
                                      newItems[i].data = { ...newItems[i].data, url: reader.result as string };
                                      updateData({ items: newItems });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-500 mb-1">Link ao clicar (URL)</p>
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                            <LinkIcon size={14} className="text-slate-400" />
                            <input
                              type="text"
                              value={item.data.linkUrl || ''}
                              onChange={(e) => {
                                const newItems = [...selectedBlock.data.items];
                                newItems[i].data = { ...newItems[i].data, linkUrl: e.target.value };
                                updateData({ items: newItems });
                              }}
                              className="w-full bg-transparent text-xs outline-none"
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Largura</label>
                              <span className="text-[10px] font-bold text-blue-600">{item.data.width || 100}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={item.data.width || 100}
                              onChange={(e) => {
                                const newItems = [...selectedBlock.data.items];
                                newItems[i].data = { ...newItems[i].data, width: parseInt(e.target.value) };
                                updateData({ items: newItems });
                              }}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Borda</label>
                              <span className="text-[10px] font-bold text-blue-600">{item.data.borderRadius || 0}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              value={item.data.borderRadius || 0}
                              onChange={(e) => {
                                const newItems = [...selectedBlock.data.items];
                                newItems[i].data = { ...newItems[i].data, borderRadius: parseInt(e.target.value) };
                                updateData({ items: newItems });
                              }}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type === 'button' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estilo</label>
                          <div className="flex bg-slate-100 p-1 rounded-lg">
                            {(['button', 'link'] as const).map((v) => (
                              <button
                                key={v}
                                onClick={() => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, variant: v };
                                  updateData({ items: newItems });
                                }}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all capitalize ${
                                  (item.data.variant || 'button') === v ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                              >
                                {v === 'button' ? 'Botão' : 'Link'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Texto do Botão</label>
                          <input
                            type="text"
                            value={item.data.text}
                            onChange={(e) => {
                              const newItems = [...selectedBlock.data.items];
                              newItems[i].data = { ...newItems[i].data, text: e.target.value };
                              updateData({ items: newItems });
                            }}
                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Texto..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Link (URL)</label>
                          <input
                            type="text"
                            value={item.data.url}
                            onChange={(e) => {
                              const newItems = [...selectedBlock.data.items];
                              newItems[i].data = { ...newItems[i].data, url: e.target.value };
                              updateData({ items: newItems });
                            }}
                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="https://..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor de Fundo</label>
                            <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                              <input
                                type="color"
                                value={item.data.backgroundColor || '#3b82f6'}
                                onChange={(e) => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, backgroundColor: e.target.value };
                                  updateData({ items: newItems });
                                }}
                                className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                              />
                              <span className="text-xs font-mono text-slate-500 uppercase">{item.data.backgroundColor || '#3b82f6'}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor do Texto</label>
                            <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                              <input
                                type="color"
                                value={item.data.color || '#ffffff'}
                                onChange={(e) => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, color: e.target.value };
                                  updateData({ items: newItems });
                                }}
                                className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                              />
                              <span className="text-xs font-mono text-slate-500 uppercase">{item.data.color || '#ffffff'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alinhamento</label>
                            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                              {['left', 'center', 'right'].map(a => (
                                <button
                                  key={a}
                                  onClick={() => {
                                    const newItems = [...selectedBlock.data.items];
                                    newItems[i].data = { ...newItems[i].data, textAlign: a };
                                    updateData({ items: newItems });
                                  }}
                                  className={`flex-1 py-1.5 rounded-md transition-all ${item.data.textAlign === a ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                  {a === 'left' ? <AlignLeft size={14} className="mx-auto" /> : a === 'center' ? <AlignCenter size={14} className="mx-auto" /> : <AlignRight size={14} className="mx-auto" />}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Borda</label>
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                              <input
                                type="number"
                                value={item.data.borderRadius || 4}
                                onChange={(e) => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, borderRadius: parseInt(e.target.value) || 0 };
                                  updateData({ items: newItems });
                                }}
                                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Largura Total</label>
                          <button
                            onClick={() => {
                              const newItems = [...selectedBlock.data.items];
                              newItems[i].data = { ...newItems[i].data, fullWidth: !item.data.fullWidth };
                              updateData({ items: newItems });
                            }}
                            className={`w-10 h-5 rounded-full transition-all relative ${item.data.fullWidth ? 'bg-blue-600' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.data.fullWidth ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>
                      </div>
                    )}

                    {item.type === 'icon' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ícone</label>
                          <button
                            onClick={() => onOpenIconPicker((iconName) => {
                              const newItems = [...selectedBlock.data.items];
                              newItems[i].data = { ...newItems[i].data, iconName };
                              updateData({ items: newItems });
                            })}
                            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-lg">{item.data.iconName || 'star'}</span>
                            Trocar Ícone
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor do Ícone</label>
                            <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                              <input
                                type="color"
                                value={item.data.color || '#3b82f6'}
                                onChange={(e) => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, color: e.target.value };
                                  updateData({ items: newItems });
                                }}
                                className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                              />
                              <span className="text-xs font-mono text-slate-500 uppercase">{item.data.color || '#3b82f6'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider">Tamanho</p>
                            <div className="flex gap-2">
                              {['small', 'medium', 'large'].map(s => (
                                <button
                                  key={s}
                                  onClick={() => {
                                    const newItems = [...selectedBlock.data.items];
                                    newItems[i].data = { ...newItems[i].data, size: s };
                                    updateData({ items: newItems });
                                  }}
                                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                                    (item.data.size || 'medium') === s ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                  }`}
                                >
                                  {s === 'small' ? 'P' : s === 'medium' ? 'M' : 'G'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type === 'emoji' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emoji</label>
                          <div className="relative">
                            <button
                              onClick={() => setEmojiPickerTarget(emojiPickerTarget === i ? null : i)}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-3xl text-center hover:bg-slate-100 transition-all focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              {item.data.emoji || '😊'}
                            </button>
                            
                            {emojiPickerTarget === i && (
                              <div className="absolute left-0 right-0 z-50 mt-2 shadow-2xl rounded-xl overflow-hidden border border-slate-200">
                                <EmojiPicker 
                                  onEmojiClick={(emojiData: EmojiClickData) => {
                                    const newItems = [...selectedBlock.data.items];
                                    newItems[i].data = { ...newItems[i].data, emoji: emojiData.emoji };
                                    updateData({ items: newItems });
                                    setEmojiPickerTarget(null);
                                  }}
                                  width="100%"
                                  height={300}
                                  previewConfig={{ showPreview: false }}
                                  skinTonesDisabled
                                  searchPlaceHolder="Procurar..."
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between mb-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tamanho (px)</p>
                            <span className="text-[10px] font-bold">{item.data.fontSize || 48}px</span>
                          </div>
                          <input
                            type="range"
                            min="12"
                            max="120"
                            value={item.data.fontSize || 48}
                            onChange={(e) => {
                              const newItems = [...selectedBlock.data.items];
                              newItems[i].data = { ...newItems[i].data, fontSize: parseInt(e.target.value) };
                              updateData({ items: newItems });
                            }}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alinhamento Horizontal</label>
                          <div className="flex bg-slate-100 p-1 rounded-xl">
                            {(['left', 'center', 'right'] as const).map((align) => (
                              <button
                                key={align}
                                onClick={() => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, textAlign: align };
                                  updateData({ items: newItems });
                                }}
                                className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${
                                  item.data.textAlign === align ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                {align === 'left' && <AlignLeft size={18} />}
                                {align === 'center' && <AlignCenter size={18} />}
                                {align === 'right' && <AlignRight size={18} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type === 'divider' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor do Divisor</label>
                          <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                            <input
                              type="color"
                              value={item.data.color || '#e2e8f0'}
                              onChange={(e) => {
                                const newItems = [...selectedBlock.data.items];
                                newItems[i].data = { ...newItems[i].data, color: e.target.value };
                                updateData({ items: newItems });
                              }}
                              className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                            />
                            <span className="text-xs font-mono text-slate-500 uppercase">{item.data.color || '#e2e8f0'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Espessura (px)</label>
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                              <Maximize2 size={14} className="text-slate-400" />
                              <input
                                type="number"
                                value={item.data.height || 1}
                                onChange={(e) => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, height: parseInt(e.target.value) || 1 };
                                  updateData({ items: newItems });
                                }}
                                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Margem (px)</label>
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                              <Maximize2 size={14} className="text-slate-400" />
                              <input
                                type="number"
                                value={item.data.margin || 16}
                                onChange={(e) => {
                                  const newItems = [...selectedBlock.data.items];
                                  newItems[i].data = { ...newItems[i].data, margin: parseInt(e.target.value) || 0 };
                                  updateData({ items: newItems });
                                }}
                                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type !== 'empty' && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alinhamento Vertical</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                          {(['top', 'bottom'] as const).map((align) => (
                            <button
                              key={align}
                              onClick={() => {
                                const newItems = [...selectedBlock.data.items];
                                newItems[i].data = { ...newItems[i].data, verticalAlign: align };
                                updateData({ items: newItems });
                              }}
                              className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${
                                (item.data.verticalAlign || 'top') === align ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {align === 'top' && <ArrowUp size={18} />}
                              {align === 'bottom' && <ArrowDown size={18} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.type !== 'empty' && (
                      <button
                        onClick={() => {
                          const newItems = [...selectedBlock.data.items];
                          newItems[i] = { type: 'empty', data: {} };
                          updateData({ items: newItems });
                        }}
                        className="mt-2 w-full py-1 text-[10px] text-red-500 font-bold hover:bg-red-50 rounded transition-colors"
                      >
                        Limpar Coluna
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Common Padding Controls */}
        <section className="pt-6 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Espaçamento do Bloco</label>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-[10px] text-slate-500">Padding Superior (px)</p>
                <span className="text-[10px] font-bold">{selectedBlock.data.paddingTop ?? 10}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedBlock.data.paddingTop ?? 10}
                onChange={(e) => updateData({ paddingTop: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-[10px] text-slate-500">Padding Inferior (px)</p>
                <span className="text-[10px] font-bold">{selectedBlock.data.paddingBottom ?? 10}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedBlock.data.paddingBottom ?? 10}
                onChange={(e) => updateData({ paddingBottom: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alinhamento Vertical do Conteúdo</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['top', 'bottom'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateData({ verticalAlign: align })}
                    className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${
                      (selectedBlock.data.verticalAlign || 'top') === align ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {align === 'top' && <ArrowUp size={18} />}
                    {align === 'bottom' && <ArrowDown size={18} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PropertiesPanel;
