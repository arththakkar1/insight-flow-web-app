import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function PromptModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'default',
  confirmText
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isConfirm = typeof onConfirm === 'function';

  let Icon = HelpCircle;
  let iconColor = 'text-[#f10303] bg-accent';
  if (type === 'destructive') {
    Icon = AlertCircle;
    iconColor = 'text-[#f10303] bg-[#3d0000] border-[#f10303]/40';
  } else if (type === 'success') {
    Icon = CheckCircle2;
    iconColor = 'text-[#22c55e] bg-[#0a2e18] border-[#22c55e]/40';
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm animate-in fade-in duration-150 p-4">
      <div className="bg-card w-full max-w-md border border-border rounded-[20px] shadow-2xl overflow-hidden animate-in fade-in duration-150">
        <div className="p-6 space-y-6">
          <div className="flex gap-4">
            <div className={cn("p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border border-border/40", iconColor)}>
              <Icon size={20} />
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <h2 className="text-sm font-bold text-foreground font-sans truncate">{title}</h2>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed break-words">{message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {isConfirm && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-background hover:bg-accent border border-border text-foreground transition-all active:scale-95"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isConfirm) {
                  onConfirm();
                } else {
                  onClose();
                }
              }}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-semibold transition-all active:scale-95",
                type === 'destructive' 
                  ? 'bg-[#f10303] hover:opacity-90 text-white' 
                  : type === 'success'
                    ? 'bg-[#22c55e] hover:opacity-90 text-white'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
              )}
            >
              {confirmText || (isConfirm ? 'Confirm' : 'OK')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
