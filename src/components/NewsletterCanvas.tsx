import React from 'react';
import { Trash2, ChevronUp, ChevronDown, Settings2, Type, Image as ImageIcon, Star, Minus, LayoutGrid } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { NewsletterBlock } from '../types';

interface NewsletterCanvasProps {
  blocks: NewsletterBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
  onAddBlock: (type: string, data?: any) => void;
  onUpdateBlock: (id: string, data: any) => void;
  backgroundColor: string;
  contentBackgroundColor: string;
  fontFamily: string;
}

const NewsletterCanvas: React.FC<NewsletterCanvasProps> = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onMoveBlock,
  onAddBlock,
  onUpdateBlock,
  backgroundColor,
  contentBackgroundColor,
  fontFamily
}) => {
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const [dragOverSlot, setDragOverSlot] = React.useState<{ blockId: string, index: number } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setDragOverSlot(null);
    const type = e.dataTransfer.getData('blockType');
    const dataStr = e.dataTransfer.getData('blockData');
    const data = dataStr ? JSON.parse(dataStr) : undefined;
    
    if (type) {
      onAddBlock(type, data);
    }
  };

  const handleSlotDragOver = (e: React.DragEvent, blockId: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot({ blockId, index });
  };

  const handleSlotDrop = (e: React.DragEvent, blockId: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);
    setIsDraggingOver(false);
    
    const type = e.dataTransfer.getData('blockType');
    if (!type || type === 'column-layout' || type === 'divider') return;

    const block = blocks.find(b => b.id === blockId);
    if (block && block.type === 'column-layout') {
      const newData = { ...block.data };
      const defaultData = getDefaultDataForType(type);
      newData.items[index] = {
        type: type as any,
        data: defaultData
      };
      onUpdateBlock(blockId, newData);
    }
  };

  const getDefaultDataForType = (type: string) => {
    switch (type) {
      case 'text': return { content: 'Texto...', fontSize: 14, color: '#334155', textAlign: 'left', fontWeight: 'normal', fontStyle: 'normal', verticalAlign: 'top' };
      case 'image': return { url: 'https://picsum.photos/seed/newsletter/400/400', alt: 'Image', borderRadius: 0, width: 100, verticalAlign: 'top' };
      case 'icon': return { iconName: 'star', color: '#3b82f6', verticalAlign: 'top' };
      case 'button': return { text: 'Botão', url: '#', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: 4, fontSize: 14, paddingX: 16, paddingY: 8, verticalAlign: 'top' };
      case 'emoji': return { emoji: '😊', fontSize: 48, textAlign: 'center', verticalAlign: 'top' };
      default: return { verticalAlign: 'top' };
    }
  };

  const fontStyle = {
    fontFamily: fontFamily === 'Poppins' ? 'var(--font-poppins)' : 
                fontFamily === 'Open Sans' ? 'var(--font-opensans)' : 
                fontFamily === 'Helvetica' ? 'Helvetica, Arial, sans-serif' : 'sans-serif'
  };

  return (
    <div 
      className="flex-1 overflow-y-auto p-8 flex justify-center transition-colors"
      style={{ backgroundColor }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onSelectBlock(null)}
    >
      <div 
        className={`w-[600px] min-h-[800px] shadow-2xl transition-all relative ${
          isDraggingOver ? 'ring-4 ring-blue-400 ring-offset-4' : ''
        }`}
        style={{ backgroundColor: contentBackgroundColor, ...fontStyle }}
        onClick={(e) => e.stopPropagation()}
      >
        {blocks.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 m-4 rounded-xl">
            <LayoutGrid size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Arraste blocos aqui para começar</p>
            <p className="text-sm opacity-60">Sua newsletter terá 600px de largura</p>
          </div>
        )}

        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`group relative border-2 transition-all ${
              selectedBlockId === block.id ? 'border-blue-500 z-10' : 'border-transparent hover:border-slate-200'
            }`}
            onClick={() => onSelectBlock(block.id)}
          >
            {/* Block Controls */}
            {selectedBlockId === block.id && (
              <div className="absolute -right-12 top-0 flex flex-col gap-1">
                <button
                  onClick={() => onMoveBlock(block.id, 'up')}
                  disabled={index === 0}
                  className="p-2 bg-white shadow-md rounded-lg text-slate-600 hover:text-blue-600 disabled:opacity-30 transition-all"
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  onClick={() => onMoveBlock(block.id, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-2 bg-white shadow-md rounded-lg text-slate-600 hover:text-blue-600 disabled:opacity-30 transition-all"
                >
                  <ChevronDown size={18} />
                </button>
                <button
                  onClick={() => onDeleteBlock(block.id)}
                  className="p-2 bg-white shadow-md rounded-lg text-slate-600 hover:text-red-600 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}

            {/* Block Content */}
            <div 
              className={`w-full flex flex-col ${block.data.verticalAlign === 'bottom' ? 'justify-end' : 'justify-start'}`}
              style={{ 
                paddingTop: `${block.data.paddingTop ?? 10}px`, 
                paddingBottom: `${block.data.paddingBottom ?? 10}px`,
                minHeight: block.type === 'column-layout' ? 'auto' : 'unset'
              }}
            >
              {block.type === 'column-layout' ? (
                <div className="grid gap-4 px-4" style={{ gridTemplateColumns: `repeat(${block.data.columns}, 1fr)` }}>
                  {block.data.items.map((item: any, i: number) => (
                    <div 
                      key={i} 
                      onDragOver={(e) => handleSlotDragOver(e, block.id, i)}
                      onDragLeave={() => setDragOverSlot(null)}
                      onDrop={(e) => handleSlotDrop(e, block.id, i)}
                      className={`min-h-[100px] bg-slate-50/50 rounded-lg overflow-hidden flex flex-col ${
                        item.data?.verticalAlign === 'bottom' ? 'justify-end' : 'justify-start'
                      } items-center border-2 border-dashed transition-all ${
                        dragOverSlot?.blockId === block.id && dragOverSlot?.index === i 
                        ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                        : 'border-slate-200'
                      }`}
                    >
                      {renderColumnItem(item)}
                    </div>
                  ))}
                </div>
              ) : renderBlockContent(block)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const renderBlockContent = (block: NewsletterBlock) => {
  switch (block.type) {
    case 'text': {
      const d = block.data;
      return (
        <div 
          style={{ 
            fontSize: `${d.fontSize}px`, 
            color: d.color, 
            textAlign: d.textAlign,
            fontWeight: d.fontWeight,
            fontStyle: d.fontStyle,
            padding: '0 20px',
            whiteSpace: 'pre-wrap'
          }}
        >
          {d.content || 'Clique para editar o texto...'}
        </div>
      );
    }
    case 'image': {
      const d = block.data;
      const content = d.url ? (
        <img 
          src={d.url} 
          alt={d.alt} 
          style={{ borderRadius: `${d.borderRadius}px`, width: `${d.width}%` }} 
          className="max-w-full h-auto"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-48 bg-slate-100 flex flex-col items-center justify-center text-slate-400 rounded-lg">
          <ImageIcon size={32} className="mb-2" />
          <p className="text-sm">Nenhuma imagem selecionada</p>
        </div>
      );

      return (
        <div className="flex justify-center px-4">
          {d.linkUrl ? (
            <a href={d.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center" onClick={(e) => e.preventDefault()}>
              {content}
            </a>
          ) : content}
        </div>
      );
    }
    case 'icon': {
      const d = block.data;
      const sizeMap = { small: 24, medium: 48, large: 64 };
      const size = sizeMap[d.size as keyof typeof sizeMap] || 48;
      
      return (
        <div className="flex justify-center px-4">
          <div 
            style={{ 
              color: d.color || '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: `${size}px` }}>
              {d.iconName || 'star'}
            </span>
          </div>
        </div>
      );
    }
    case 'divider': {
      const d = block.data;
      return (
        <div style={{ padding: `${d.paddingY}px 20px` }}>
          <hr style={{ border: 0, borderTop: `${d.thickness}px solid ${d.color}` }} />
        </div>
      );
    }
    case 'button': {
      const d = block.data;
      const isLink = d.variant === 'link';
      return (
        <div className="px-4" style={{ textAlign: d.textAlign }}>
          <a
            href={d.url}
            style={{
              display: d.fullWidth ? 'block' : 'inline-block',
              backgroundColor: isLink ? 'transparent' : d.backgroundColor,
              color: isLink ? '#3b82f6' : d.color,
              padding: isLink ? '4px 0' : `${d.paddingY}px ${d.paddingX}px`,
              borderRadius: isLink ? '0' : `${d.borderRadius}px`,
              fontSize: `${d.fontSize}px`,
              textDecoration: isLink ? 'underline' : 'none',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
            onClick={(e) => e.preventDefault()}
          >
            {d.text}
          </a>
        </div>
      );
    }
    case 'emoji': {
      const d = block.data;
      return (
        <div 
          style={{ 
            fontSize: `${d.fontSize || 48}px`, 
            textAlign: d.textAlign || 'center',
            padding: '10px'
          }}
        >
          {d.emoji || '😊'}
        </div>
      );
    }
    case 'column-layout': {
      const d = block.data;
      return (
        <div className="grid gap-4 px-4" style={{ gridTemplateColumns: `repeat(${d.columns}, 1fr)` }}>
          {d.items.map((item: any, i: number) => (
            <div key={i} className="min-h-[100px] bg-slate-50/50 rounded-lg overflow-hidden flex items-center justify-center border border-dashed border-slate-200">
              {renderColumnItem(item)}
            </div>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
};

const renderColumnItem = (item: any) => {
  if (item.type === 'empty') return <div className="text-[10px] text-slate-300 uppercase font-bold">Arraste um bloco aqui</div>;
  
  switch (item.type) {
    case 'text': {
      const d = item.data;
      return (
        <div 
          style={{ 
            fontSize: `${d.fontSize || 14}px`, 
            color: d.color || '#334155', 
            textAlign: d.textAlign || 'left',
            fontWeight: d.fontWeight || 'normal',
            fontStyle: d.fontStyle || 'normal',
            padding: '10px',
            width: '100%',
            whiteSpace: 'pre-wrap'
          }}
        >
          {d.content || 'Texto...'}
        </div>
      );
    }
    case 'image': {
      const d = item.data;
      const content = d.url ? (
        <img 
          src={d.url} 
          alt={d.alt} 
          style={{ borderRadius: `${d.borderRadius || 0}px`, width: `${d.width || 100}%` }} 
          className="max-w-full h-auto"
          referrerPolicy="no-referrer" 
        />
      ) : (
        <div className="w-full h-20 bg-slate-100 flex flex-col items-center justify-center text-slate-400 rounded-lg">
          <ImageIcon size={20} />
        </div>
      );

      return (
        <div className="p-2 w-full flex justify-center">
          {d.linkUrl ? (
            <a href={d.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center" onClick={(e) => e.preventDefault()}>
              {content}
            </a>
          ) : content}
        </div>
      );
    }
    case 'icon': {
      const d = item.data;
      const sizeMap = { small: 24, medium: 48, large: 64 };
      const size = sizeMap[d.size as keyof typeof sizeMap] || 24;
      
      return (
        <div className="p-2 flex justify-center w-full">
          <div 
            style={{ 
              color: d.color || '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: `${size}px` }}>
              {d.iconName || 'star'}
            </span>
          </div>
        </div>
      );
    }
    case 'button': {
      const d = item.data;
      const isLink = d.variant === 'link';
      return (
        <div className="p-2 w-full" style={{ textAlign: d.textAlign || 'center' }}>
          <a 
            href={d.url || '#'}
            style={{ 
              display: d.fullWidth ? 'block' : 'inline-block',
              backgroundColor: isLink ? 'transparent' : (d.backgroundColor || '#3b82f6'), 
              color: isLink ? '#3b82f6' : (d.color || '#ffffff'),
              padding: isLink ? '2px 0' : `${d.paddingY || 6}px ${d.paddingX || 12}px`,
              borderRadius: isLink ? '0' : `${d.borderRadius || 4}px`,
              fontSize: `${d.fontSize || 12}px`,
              fontWeight: 'bold',
              textAlign: 'center',
              textDecoration: isLink ? 'underline' : 'none'
            }}
            onClick={(e) => e.preventDefault()}
          >
            {d.text || 'Botão'}
          </a>
        </div>
      );
    }
    case 'emoji': {
      const d = item.data;
      return (
        <div 
          style={{ 
            fontSize: `${d.fontSize || 48}px`, 
            textAlign: d.textAlign || 'center',
            padding: '10px',
            width: '100%'
          }}
        >
          {d.emoji || '😊'}
        </div>
      );
    }
    default:
      return null;
  }
};

export default NewsletterCanvas;
