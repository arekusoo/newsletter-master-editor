import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

const EmojiPicker = lazy(() => import('emoji-picker-react'));

interface LazyEmojiPickerProps {
  onEmojiClick: (emojiData: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LazyEmojiPicker: React.FC<LazyEmojiPickerProps> = ({ onEmojiClick, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 right-0 z-50 mt-2 shadow-2xl rounded-xl overflow-hidden border border-slate-200 bg-white">
      <Suspense fallback={
        <div className="flex items-center justify-center p-8 bg-white h-[300px]">
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      }>
        <EmojiPicker 
          onEmojiClick={(emojiData) => {
            onEmojiClick(emojiData);
            onClose();
          }}
          width="100%"
          height={300}
          autoFocusSearch={false}
          previewConfig={{ showPreview: false }}
          skinTonesDisabled
          searchPlaceHolder="Procurar..."
          lazyLoadEmojis={true}
        />
      </Suspense>
    </div>
  );
};
