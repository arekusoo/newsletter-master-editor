import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToUseModal({ isOpen, onClose }: HowToUseModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      text: "Arraste o conteúdo e edite conforme o necessário OU selecione entre os modelos prontos e ajuste as informações"
    },
    {
      text: "Clique no botão \"Exportar HTML\""
    },
    {
      text: "Crie um novo e-mail no Gmail"
    },
    {
      text: "(Importante) Instale a extensão de \"HTMaiL\"",
      link: "https://chromewebstore.google.com/detail/htmail-insert-html-into-g/omojcahabhafmagldeheegggbakefhlh"
    },
    {
      text: "Clique no ícone de código (Inserir HTML) no e-mail criado"
    },
    {
      text: "Selecione a opção \"Carregar arquivo\" e faça o upload do seu e-mail"
    },
    {
      text: "Clique em aplicar e envie seu e-mail"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Como usar?</h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500 font-medium">Veja aqui detalhes de como usar o construtor de e-mails:</p>
          
          <ul className="space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold border border-blue-100">
                  {index + 1}
                </span>
                <div className="text-[13px] text-slate-600 leading-snug">
                  {step.text}
                  {step.link && (
                    <a 
                      href={step.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline ml-1 font-bold"
                    >
                      (Link da Extensão)
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
