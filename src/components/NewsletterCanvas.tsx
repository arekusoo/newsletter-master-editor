import React, { useRef, useState, useEffect } from 'react';
import { Trash2, ChevronUp, ChevronDown, Settings2, Type, Image as ImageIcon, Star, Minus, LayoutGrid, Copy, Bold, Italic, Underline } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { NewsletterBlock } from '../types';

interface NewsletterCanvasProps {
  blocks: NewsletterBlock[];
  selectedBlockId: string | null;
  selectedSubBlockIndex: number | null;
  onSelectBlock: (id: string | null, subIndex?: number | null) => void;
  onDeleteBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
  onDuplicateBlock: (id: string) => void;
  onAddBlock: (type: string, data?: any) => void;
  onUpdateBlock: (id: string, data: any, topLevelProps?: any, subIndex?: number | null) => void;
  backgroundColor: string;
  contentBackgroundColor: string;
  fontFamily: string;
}

const NewsletterCanvas: React.FC<NewsletterCanvasProps> = ({
  blocks,
  selectedBlockId,
  selectedSubBlockIndex,
  onSelectBlock,
  onDeleteBlock,
  onMoveBlock,
  onDuplicateBlock,
  onAddBlock,
  onUpdateBlock,
  backgroundColor,
  contentBackgroundColor,
  fontFamily
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<{ blockId: string, index: number } | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

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
    if (!type || type === 'column-layout' || type === 'divider' || type === 'flex-row') return;

    const block = blocks.find(b => b.id === blockId);
    if (block && (block.type === 'column-layout' || block.type === 'flex-row')) {
      const newData = { ...block.data };
      const defaultData = getDefaultDataForType(type);
      
      if (block.type === 'column-layout') {
        newData.items[index] = {
          type: type as any,
          data: defaultData
        };
      } else if (block.type === 'flex-row') {
        // For flex-row, we can either replace or append. Let's append if dropping on a specific slot or just add to the end.
        // Actually, let's make it replace the slot if it's an existing one, or add a new one.
        if (index === -1) {
          newData.items.push({ type: type as any, data: defaultData });
        } else {
          newData.items[index] = { type: type as any, data: defaultData };
        }
      }
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
                fontFamily === 'Montserrat' ? 'var(--font-montserrat)' :
                fontFamily === 'Inter' ? 'var(--font-inter)' :
                fontFamily === 'Helvetica' ? '"Helvetica Neue", Helvetica, Arial, sans-serif' : 'sans-serif'
  };

  const renderBlockContent = (block: NewsletterBlock) => {
    switch (block.type) {
      case 'text': {
        const d = block.data;
        return (
          <div 
            ref={selectedBlockId === block.id ? textRef : null}
            data-block-id={block.id}
            contentEditable={selectedBlockId === block.id}
            onBlur={(e) => {
              onUpdateBlock(block.id, { content: e.currentTarget.innerHTML }, {}, null);
            }}
            onMouseDown={(e) => {
              if (selectedBlockId === block.id) {
                e.stopPropagation(); // Allow text selection
              }
            }}
            onClick={(e) => {
              if (selectedBlockId === block.id) {
                e.stopPropagation(); // Prevent re-selecting block
              }
            }}
            dangerouslySetInnerHTML={{ __html: d.content || 'Clique para editar o texto...' }}
            style={{ 
              fontSize: `${d.fontSize}px`, 
              color: d.color, 
              textAlign: d.textAlign,
              fontWeight: d.fontWeight,
              fontStyle: d.fontStyle,
              padding: '10px 20px',
              whiteSpace: 'pre-wrap',
              outline: 'none',
              minHeight: '1em'
            }}
          />
        );
      }
      case 'image': {
        const d = block.data;
        const content = d.url ? (
          <img 
            src={d.url} 
            alt={d.alt} 
            style={{ 
              borderRadius: `${d.borderRadius}px`, 
              width: `${d.width}%`,
              height: d.height ? `${d.height}px` : 'auto',
              objectFit: d.height ? 'cover' : 'initial'
            }} 
            className="max-w-full"
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
        const sizeMap = { small: 48, medium: 96, large: 128 };
        const size = sizeMap[d.size as keyof typeof sizeMap] || 96;
        
        return (
          <div className="flex justify-center p-4">
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
          <div className="px-4" style={{ margin: `${d.margin || 16}px 0` }}>
            <div style={{ height: `${d.height || 1}px`, backgroundColor: d.color || '#e2e8f0' }} />
          </div>
        );
      }
      case 'button': {
        const d = block.data;
        const isLink = d.variant === 'link';
        
        return (
          <div className="px-4" style={{ textAlign: d.textAlign || 'center' }}>
            <a 
              href={d.url || '#'}
              style={{ 
                display: d.fullWidth ? 'flex' : 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${d.iconGap || 8}px`,
                backgroundColor: isLink ? 'transparent' : (d.backgroundColor || '#3b82f6'), 
                color: isLink ? '#3b82f6' : (d.color || '#ffffff'),
                padding: isLink ? '2px 0' : `${d.paddingY || 12}px ${d.paddingX || 24}px`,
                borderRadius: isLink ? '0' : `${d.borderRadius || 8}px`,
                fontSize: `${d.fontSize || 16}px`,
                fontWeight: 'bold',
                textAlign: 'center',
                textDecoration: isLink ? 'underline' : 'none'
              }}
              onClick={(e) => e.preventDefault()}
            >
              {d.iconName && (
                <span className="material-symbols-outlined" style={{ fontSize: `${d.fontSize || 16}px` }}>
                  {d.iconName}
                </span>
              )}
              {d.text || 'Botão'}
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
      default:
        return null;
    }
  };

  const renderColumnItem = (item: any, parentBlock: NewsletterBlock, subIndex: number, isSelected: boolean) => {
    if (item.type === 'empty') return <div className="text-[10px] text-slate-300 uppercase font-bold">Arraste um bloco aqui</div>;
    
    switch (item.type) {
      case 'text': {
        const d = item.data;
        return (
          <div 
            ref={isSelected ? textRef : null}
            data-block-id={parentBlock.id}
            contentEditable={isSelected}
            onBlur={(e) => {
              onUpdateBlock(parentBlock.id, { content: e.currentTarget.innerHTML }, {}, subIndex);
            }}
            onMouseDown={(e) => {
              if (isSelected) {
                e.stopPropagation();
              }
            }}
            onClick={(e) => {
              if (isSelected) {
                e.stopPropagation();
              }
            }}
            dangerouslySetInnerHTML={{ __html: d.content || 'Clique para editar...' }}
            style={{ 
              fontSize: `${d.fontSize || 14}px`, 
              color: d.color || '#334155', 
              textAlign: d.textAlign || 'left',
              fontWeight: d.fontWeight || 'normal',
              fontStyle: d.fontStyle || 'normal',
              padding: '10px',
              width: '100%',
              whiteSpace: 'pre-wrap',
              outline: 'none',
              minHeight: '1em'
            }}
          />
        );
      }
      case 'image': {
        const d = item.data;
        const content = d.url ? (
          <img 
            src={d.url} 
            alt={d.alt} 
            style={{ 
              borderRadius: `${d.borderRadius || 0}px`, 
              width: `${d.width || 100}%`,
              height: d.height ? `${d.height}px` : 'auto',
              objectFit: d.height ? 'cover' : 'initial'
            }} 
            className="max-w-full"
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
                display: d.fullWidth ? 'flex' : 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${d.iconGap || 6}px`,
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
              {d.iconName && (
                <span className="material-symbols-outlined" style={{ fontSize: `${d.fontSize || 12}px` }}>
                  {d.iconName}
                </span>
              )}
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

  return (
    <div 
      className="flex-1 overflow-y-auto p-8 transition-colors"
      style={{ backgroundColor }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onSelectBlock(null)}
    >
      <div className="min-h-full flex flex-col items-center">
        <div 
          className={`w-[600px] min-h-[800px] shadow-2xl transition-all relative mb-8 ${
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
            className={`group relative transition-all ${
              selectedBlockId === block.id ? 'z-10' : 'hover:outline hover:outline-2 hover:outline-slate-200'
            }`}
            style={{
              backgroundColor: block.backgroundColor || 'transparent',
              borderColor: block.borderColor || 'transparent',
              borderWidth: `${block.borderWidth || 0}px`,
              borderStyle: 'solid',
              borderRadius: `${block.borderRadius || 0}px`,
              boxShadow: selectedBlockId === block.id ? '0 0 0 3px rgba(59, 130, 246, 0.5)' : 'none',
              outline: selectedBlockId === block.id ? '2px solid #3b82f6' : 'none',
              outlineOffset: '-2px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectBlock(block.id);
            }}
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
                  onClick={() => onDuplicateBlock(block.id)}
                  className="p-2 bg-white shadow-md rounded-lg text-slate-600 hover:text-emerald-600 transition-all"
                  title="Duplicar"
                >
                  <Copy size={18} />
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
                paddingTop: `${block.data.paddingTop ?? 0}px`, 
                paddingBottom: `${block.data.paddingBottom ?? 0}px`,
                minHeight: block.type === 'column-layout' ? 'auto' : 'unset'
              }}
            >
              {block.type === 'column-layout' ? (
                <div 
                  className="flex px-4 items-stretch relative" 
                  style={{ gap: '1rem' }}
                >
                  {block.data.items.map((item: any, i: number) => {
                    const isSubSelected = selectedBlockId === block.id && selectedSubBlockIndex === i;
                    const width = block.data.widths?.[i] ?? (100 / block.data.columns);
                    return (
                      <React.Fragment key={i}>
                        <div 
                          onDragOver={(e) => handleSlotDragOver(e, block.id, i)}
                          onDragLeave={() => setDragOverSlot(null)}
                          onDrop={(e) => handleSlotDrop(e, block.id, i)}
                          className={`min-h-[40px] rounded-lg overflow-hidden flex flex-col ${
                            item.data?.verticalAlign === 'bottom' ? 'justify-end' : 'justify-start'
                          } items-center border-2 transition-all ${
                            isSubSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
                          } ${
                            dragOverSlot?.blockId === block.id && dragOverSlot?.index === i 
                            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                            : ''
                          }`}
                          style={{
                            width: `${width}%`,
                            backgroundColor: item.backgroundColor || 'transparent',
                            borderColor: item.borderColor || 'transparent',
                            borderWidth: `${item.borderWidth || 0}px`,
                            borderStyle: 'solid',
                            borderRadius: `${item.borderRadius || 8}px`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBlock(block.id, i);
                          }}
                        >
                          {renderColumnItem(item, block, i, isSubSelected)}
                        </div>

                        {/* Resize handle */}
                        {selectedBlockId === block.id && i < block.data.columns - 1 && (
                          <div
                            className="absolute z-30 w-4 -ml-2 cursor-col-resize flex items-center justify-center group/handle h-full"
                            style={{ 
                              left: `calc(${block.data.widths?.slice(0, i + 1).reduce((a: number, b: number) => a + b, 0) ?? (100 / block.data.columns * (i + 1))}% + 1rem * ${(i+1) / block.data.columns})` 
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const startX = e.clientX;
                              const currentWidths = block.data.widths || (block.data.columns === 2 ? [50, 50] : [33.33, 33.33, 33.34]);
                              const initialWidthLeft = currentWidths[i];
                              const initialWidthRight = currentWidths[i + 1];
                              const containerWidth = e.currentTarget.parentElement?.clientWidth || 600;

                              const onMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = moveEvent.clientX - startX;
                                const deltaPercent = (deltaX / containerWidth) * 100;
                                
                                const newWidths = [...currentWidths];
                                const newLeft = Math.round(Math.max(10, Math.min(80, initialWidthLeft + deltaPercent)));
                                const diff = newLeft - initialWidthLeft;
                                
                                newWidths[i] = newLeft;
                                newWidths[i + 1] = Math.round(Math.max(10, initialWidthRight - diff));
                                
                                if (block.data.columns === 2) {
                                  newWidths[1] = 100 - newWidths[0];
                                } else if (block.data.columns === 3) {
                                  newWidths[2] = 100 - newWidths[0] - newWidths[1];
                                }

                                onUpdateBlock(block.id, { ...block.data, widths: newWidths });
                              };

                              const onMouseUp = () => {
                                document.removeEventListener('mousemove', onMouseMove);
                                document.removeEventListener('mouseup', onMouseUp);
                              };

                              document.addEventListener('mousemove', onMouseMove);
                              document.addEventListener('mouseup', onMouseUp);
                            }}
                          >
                            <div className="w-1 h-3/4 bg-blue-300 group-hover/handle:bg-blue-500 rounded-full transition-colors opacity-0 group-hover/handle:opacity-100" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-blue-400 rounded-full shadow-lg flex items-center justify-center scale-75 group-hover/handle:scale-100 opacity-0 group-hover/handle:opacity-100 transition-all">
                              <div className="flex gap-0.5">
                                <div className="w-0.5 h-2 bg-blue-500 rounded-full" />
                                <div className="w-0.5 h-2 bg-blue-500 rounded-full" />
                              </div>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : block.type === 'flex-row' ? (
                <div 
                  className="flex flex-wrap items-center px-4 py-2 min-h-[60px]"
                  style={{ 
                    gap: `${block.data.gap || 10}px`, 
                    justifyContent: block.data.textAlign === 'center' ? 'center' : block.data.textAlign === 'right' ? 'flex-end' : 'flex-start',
                    alignItems: block.data.alignItems || 'center'
                  }}
                  onDragOver={(e) => handleSlotDragOver(e, block.id, -1)}
                  onDrop={(e) => handleSlotDrop(e, block.id, -1)}
                >
                  {block.data.items && block.data.items.length > 0 ? (
                    block.data.items.map((item: any, i: number) => {
                      const isSubSelected = selectedBlockId === block.id && selectedSubBlockIndex === i;
                      return (
                        <div 
                          key={i} 
                          className={`relative group/sub min-w-[20px] rounded-lg transition-all ${isSubSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                          style={{
                            backgroundColor: item.backgroundColor || 'transparent',
                            borderColor: item.borderColor || 'transparent',
                            borderWidth: `${item.borderWidth || 0}px`,
                            borderStyle: 'solid',
                            borderRadius: `${item.borderRadius || 4}px`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBlock(block.id, i);
                          }}
                        >
                          {renderColumnItem(item, block, i, isSubSelected)}
                          {isSubSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newItems = [...block.data.items];
                                newItems.splice(i, 1);
                                onUpdateBlock(block.id, { ...block.data, items: newItems });
                                onSelectBlock(block.id, null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg z-10"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full h-12 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                      Arraste itens aqui para alinhar lado a lado
                    </div>
                  )}
                </div>
              ) : renderBlockContent(block)}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default NewsletterCanvas;
