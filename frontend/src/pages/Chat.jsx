import { Send } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function Chat() {
  const { chatId } = useParams();
  
  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card">
        <h2 className="text-lg font-semibold tracking-tight">
          {chatId ? `Conversation / ${chatId}` : 'New AI Analytics Chat'}
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-xs font-medium text-muted-foreground">LM Studio Active</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 bg-muted/10">
        <div className="flex gap-4 max-w-3xl">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
            AI
          </div>
          <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed shadow-sm">
            Hello. I am your InsightFlow AI Assistant. I can generate DAX measures, explain data anomalies, or suggest visualizations. How can I help?
          </div>
        </div>
        
        {chatId && (
          <div className="flex gap-4 max-w-3xl self-end flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
              U
            </div>
            <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed shadow-sm">
              Can you write a DAX measure to calculate Year-to-Date sales?
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-card">
        <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="text" 
            placeholder="Ask about your data..." 
            className="w-full pl-5 pr-14 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
          <button type="submit" className="absolute right-2 p-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition shadow-sm">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
