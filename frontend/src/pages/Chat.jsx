import { useState } from 'react';
import { Send, Loader2, Copy, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function Chat() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello. I am your InsightFlow AI Assistant. I can generate DAX measures, explain data anomalies, or suggest visualizations. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    fetch('http://localhost:8000/api/chat/messages/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: userMessage })
    })
      .then(res => res.json())
      .then(data => {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply || data.error }]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Chat error:", err);
        setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered a network error connecting to the backend.' }]);
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card">
        <h2 className="text-lg font-semibold tracking-tight">
          {chatId ? `Conversation / ${chatId}` : 'New AI Analytics Chat'}
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-medium text-muted-foreground">Connected</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 bg-muted/10">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
              {msg.role === 'user' ? 'U' : 'AI'}
            </div>
            <div className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm'}`}>
              <ReactMarkdown
                components={{
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                  code: ({node, inline, className, children, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline ? (
                      <pre className="bg-black/10 dark:bg-white/10 rounded-lg p-3 my-3 font-mono text-xs overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-black/10 dark:bg-white/10 rounded px-1.5 py-0.5 font-mono text-xs" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {msg.content}
              </ReactMarkdown>
              <div className="flex justify-end mt-2 opacity-50 hover:opacity-100 transition-opacity">
                 <button onClick={() => handleCopy(msg.content, i)} className="text-muted-foreground hover:text-primary flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider">
                   {copiedIndex === i ? <Check size={12}/> : <Copy size={12}/>}
                   {copiedIndex === i ? 'Copied' : 'Copy'}
                 </button>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 max-w-3xl">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              AI
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-4 text-sm shadow-sm flex items-center gap-2 text-muted-foreground">
              <Loader2 size={16} className="animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-card">
        <form className="relative flex items-center" onSubmit={handleSubmit}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask about your data..." 
            className="w-full pl-5 pr-14 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm disabled:opacity-50"
          />
          <button type="submit" disabled={!input.trim() || loading} className="absolute right-2 p-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition shadow-sm disabled:opacity-50">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
