/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Download, Layout as LayoutIcon, Laptop, Smartphone, Eye, X, Search, Trash2, Edit2, Plus, CheckCircle2, Bookmark, Link } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { NewsletterBlock, NewsletterSettings, BlockType, Preset } from './types';
import BlocksSidebar from './components/BlocksSidebar';
import NewsletterCanvas from './components/NewsletterCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import IconPickerModal from './components/IconPickerModal';
import PresetModal from './components/PresetModal';
import ConfirmModal from './components/ConfirmModal';
import HowToUseModal from './components/HowToUseModal';
import { exportToHtml } from './exportHtml';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, query, orderBy, setDoc, doc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [blocks, setBlocks] = useState<NewsletterBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedSubBlockIndex, setSelectedSubBlockIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'blocks' | 'layouts' | 'models'>('blocks');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isConfirmLoadOpen, setIsConfirmLoadOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<Preset | null>(null);
  const [iconPickerCallback, setIconPickerCallback] = useState<((name: string) => void) | null>(null);
  const [settings, setSettings] = useState<NewsletterSettings>({
    backgroundColor: '#f1f5f9',
    contentBackgroundColor: '#ffffff',
    fontFamily: 'Poppins'
  });

  // Firestore Presets Listener
  useEffect(() => {
    const q = query(collection(db, 'presets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPresets: Preset[] = [];
      snapshot.forEach((doc) => {
        loadedPresets.push(doc.data() as Preset);
      });
      setPresets(loadedPresets);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'presets');
    });
    return () => unsubscribe();
  }, []);

  const savePreset = async (name: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newPreset: Preset = {
      id,
      name,
      blocks: JSON.parse(JSON.stringify(blocks)),
      settings: { ...settings },
      createdAt: Date.now(),
      uid: 'anonymous'
    };

    try {
      await setDoc(doc(db, 'presets', id), newPreset);
      setIsSaveModalOpen(false);
      toast.success('Layout salvo com sucesso!', {
        description: `O layout "${name}" foi adicionado aos seus presets.`,
        icon: <CheckCircle2 className="text-emerald-500" size={16} />
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `presets/${id}`);
    }
  };

  const loadPreset = (preset: Preset) => {
    if (blocks.length > 0) {
      setActivePreset(preset);
      setIsConfirmLoadOpen(true);
    } else {
      applyPreset(preset);
    }
  };

  const applyPreset = (preset: Preset) => {
    setBlocks(JSON.parse(JSON.stringify(preset.blocks)));
    setSettings({ ...preset.settings });
    setSelectedBlockId(null);
    toast.success('Layout carregado!', {
      description: `"${preset.name}" agora está no seu editor.`,
    });
  };

  const deletePreset = (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (preset) {
      setActivePreset(preset);
      setIsConfirmDeleteOpen(true);
    }
  };

  const renamePreset = (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    setActivePreset(preset);
    setIsRenameModalOpen(true);
  };

  const confirmDeletePreset = async () => {
    if (activePreset) {
      try {
        await deleteDoc(doc(db, 'presets', activePreset.id));
        toast.info('Layout excluído.');
        setActivePreset(null);
        setIsConfirmDeleteOpen(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `presets/${activePreset.id}`);
      }
    }
  };

  const confirmRenamePreset = async (newName: string) => {
    if (activePreset) {
      try {
        await setDoc(doc(db, 'presets', activePreset.id), { ...activePreset, name: newName });
        setIsRenameModalOpen(false);
        toast.success('Layout renomeado.');
        setActivePreset(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `presets/${activePreset.id}`);
      }
    }
  };

  const addBlock = (type: string, customData?: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    let data: any = {
      paddingTop: 10,
      paddingBottom: 10
    };

    switch (type) {
      case 'text':
        data = {
          ...data,
          content: 'Novo bloco de texto. Clique aqui para editar e personalizar sua mensagem.',
          fontSize: 16,
          color: '#334155',
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal'
        };
        break;
      case 'image':
        data = {
          ...data,
          url: 'https://picsum.photos/seed/newsletter/1200/600',
          alt: 'Newsletter Image',
          borderRadius: 8,
          width: 100,
          linkUrl: ''
        };
        break;
      case 'icon':
        data = {
          ...data,
          iconName: 'star',
          size: 'medium',
          color: '#3b82f6'
        };
        break;
      case 'divider':
        data = {
          ...data,
          color: '#e2e8f0',
          thickness: 2,
          paddingY: 20
        };
        break;
      case 'column-layout':
        const cols = customData?.columns || 2;
        data = {
          ...data,
          columns: cols,
          items: Array(cols).fill(null).map(() => ({
            type: 'empty',
            data: {}
          })),
          borderRadius: 8
        };
        break;
      case 'button':
        data = {
          ...data,
          text: 'Clique Aqui',
          url: '#',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          borderRadius: 8,
          fontSize: 16,
          paddingX: 24,
          paddingY: 12,
          fullWidth: false,
          textAlign: 'center',
          variant: 'button'
        };
        break;
      case 'flex-row':
        data = {
          ...data,
          items: [],
          gap: 10,
          alignItems: 'center'
        };
        break;
    }

    const newBlock: NewsletterBlock = { id, type: type as BlockType, data: { ...data, ...customData } };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(id);
  };

  const updateBlock = (id: string, data: any, topLevelProps?: Partial<NewsletterBlock>, subIndex?: number | null) => {
    const targetSubIndex = subIndex !== undefined ? subIndex : selectedSubBlockIndex;
    setBlocks(prevBlocks => prevBlocks.map(b => {
      if (b.id === id) {
        // If we are updating a sub-block inside a layout
        if (targetSubIndex !== null && (b.type === 'column-layout' || b.type === 'flex-row')) {
          const newItems = [...b.data.items];
          const currentItem = newItems[targetSubIndex];
          if (!currentItem) return b;
          
          newItems[targetSubIndex] = {
            ...currentItem,
            data: { ...currentItem.data, ...data },
            ...topLevelProps
          };
          
          return { ...b, data: { ...b.data, items: newItems } };
        }
        return { ...b, data: { ...b.data, ...data }, ...topLevelProps };
      }
      return b;
    }));
  };

  const duplicateBlock = (id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;
    
    const blockToDuplicate = blocks[index];
    const newId = Math.random().toString(36).substr(2, 9);
    const duplicatedBlock: NewsletterBlock = {
      ...JSON.parse(JSON.stringify(blockToDuplicate)),
      id: newId
    };
    
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, duplicatedBlock);
    setBlocks(newBlocks);
    setSelectedBlockId(newId);
    toast.success('Bloco duplicado!');
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;
    
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < blocks.length) {
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  const handleExport = () => {
    const html = exportToHtml(blocks, settings);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-slate-800 tracking-tight">
              Editor de e-mail personalizado | <span className="text-blue-600">USES</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSaveModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-100"
          >
            <Bookmark size={18} />
            Salvar como modelo
          </button>

          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
          >
            <Eye size={18} />
            Visualizar
          </button>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Download size={18} />
            Exportar HTML
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <BlocksSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          presets={presets}
          onLoadPreset={loadPreset}
          onDeletePreset={deletePreset}
          onRenamePreset={renamePreset}
          onAddAIGeneratedBlocks={(newBlocks) => {
            setBlocks([...blocks, ...newBlocks]);
            toast.success('Modelo gerado com IA!', {
              description: `${newBlocks.length} blocos foram adicionados.`,
            });
          }}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <NewsletterCanvas
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            selectedSubBlockIndex={selectedSubBlockIndex}
            onSelectBlock={(id, subIndex) => {
              setSelectedBlockId(id);
              setSelectedSubBlockIndex(subIndex ?? null);
            }}
            onDeleteBlock={deleteBlock}
            onMoveBlock={moveBlock}
            onDuplicateBlock={duplicateBlock}
            onAddBlock={addBlock}
            onUpdateBlock={updateBlock}
            backgroundColor={settings.backgroundColor}
            contentBackgroundColor={settings.contentBackgroundColor}
            fontFamily={settings.fontFamily}
          />
        </div>

        {/* Right Sidebar */}
        <PropertiesPanel
          selectedBlock={selectedBlock}
          selectedSubBlockIndex={selectedSubBlockIndex}
          onUpdateBlock={updateBlock}
          settings={settings}
          onUpdateSettings={(s) => setSettings({ ...settings, ...s })}
          onOpenIconPicker={(callback) => {
            setIconPickerCallback(() => callback);
            setIsIconPickerOpen(true);
          }}
        />
      </main>

    <IconPickerModal
      isOpen={isIconPickerOpen}
      onClose={() => {
        setIsIconPickerOpen(false);
        setIconPickerCallback(null);
      }}
      onSelect={(iconName) => {
        if (iconPickerCallback) {
          iconPickerCallback(iconName);
        } else if (selectedBlock && selectedBlock.type === 'icon') {
          updateBlock(selectedBlock.id, { ...selectedBlock.data, iconName });
        }
        setIsIconPickerOpen(false);
        setIconPickerCallback(null);
      }}
    />

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-slate-800">Visualização do E-mail</h3>
                <div className="flex bg-slate-200 p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode('desktop')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  >
                    Desktop
                  </button>
                  <button 
                    onClick={() => setViewMode('mobile')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  >
                    Mobile
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-100 p-8">
              <div className="min-h-full flex flex-col items-center">
                <div 
                  className={`bg-white shadow-lg transition-all duration-300 mb-8 ${viewMode === 'mobile' ? 'w-[375px]' : 'w-[600px]'}`}
                  dangerouslySetInnerHTML={{ __html: exportToHtml(blocks, settings) }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preset Name Modal */}
      <PresetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={savePreset}
        title="Salvar Novo Layout"
      />

      {/* Rename Modal */}
      <PresetModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false);
          setActivePreset(null);
        }}
        onSave={confirmRenamePreset}
        initialValue={activePreset?.name}
        title="Renomear Layout"
      />

      {/* Confirm Load Modal */}
      <ConfirmModal
        isOpen={isConfirmLoadOpen}
        onClose={() => {
          setIsConfirmLoadOpen(false);
          setActivePreset(null);
        }}
        onConfirm={() => activePreset && applyPreset(activePreset)}
        title="Carregar Layout"
        message={`Tem certeza que deseja carregar o layout "${activePreset?.name}"? Isso substituirá o conteúdo atual do editor.`}
        confirmText="Carregar"
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setActivePreset(null);
        }}
        onConfirm={confirmDeletePreset}
        title="Excluir Layout"
        message={`Tem certeza que deseja excluir o layout "${activePreset?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
      />

      <Toaster position="bottom-right" richColors />

      {/* Floating Help Button */}
      <button
        onClick={() => setIsHowToUseOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 hover:shadow-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all group"
      >
        <Link size={18} />
        Como usar?
      </button>

      <HowToUseModal 
        isOpen={isHowToUseOpen} 
        onClose={() => setIsHowToUseOpen(false)} 
      />
    </div>
  );
}
