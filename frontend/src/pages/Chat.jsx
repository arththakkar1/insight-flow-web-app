import { apiFetch } from '../utils/api';
import { useState } from 'react';
import { Send, Loader2, Copy, Check, Terminal, User } from 'lucide-react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function Chat() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello. I am the InsightFlow AI protocol. I can generate DAX measures, explain data anomalies, or optimize queries. Awaiting input.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading || uploadingFile) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    apiFetch('http://localhost:8000/api/chat/messages/', {
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
        setMessages(prev => [...prev, { role: 'ai', content: 'SYSTEM ERROR: Network anomaly detected.' }]);
        setLoading(false);
      });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    
    setMessages(prev => [...prev, { role: 'user', content: `[System]: Uploading dataset ${file.name}...` }]);

    apiFetch('http://localhost:8000/api/datasets/', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      setUploadingFile(false);
      if (data.error) {
        setMessages(prev => [...prev, { role: 'ai', content: `Error uploading file: ${data.error}` }]);
        return;
      }
      
      const autoMessage = `I just uploaded a dataset named ${file.name}. Please clean it.`;
      setMessages(prev => [...prev, { role: 'user', content: autoMessage }]);
      setLoading(true);
      
      apiFetch('http://localhost:8000/api/chat/messages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: autoMessage })
      })
        .then(res => res.json())
        .then(data => {
          setMessages(prev => [...prev, { role: 'ai', content: data.reply || data.error }]);
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          setMessages(prev => [...prev, { role: 'ai', content: 'SYSTEM ERROR during cleaning.' }]);
        });
    })
    .catch(err => {
      console.error("Upload error", err);
      setUploadingFile(false);
      setMessages(prev => [...prev, { role: 'ai', content: 'SYSTEM ERROR: Failed to upload file.' }]);
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-card border border-border rounded-[16px] shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="px-8 py-3 border-b border-border flex justify-between items-center bg-background/50 backdrop-blur-md z-10 relative">
        <div>
          <h2 className="text-xl font-medium tracking-tight flex items-center gap-2">
            <Terminal size={20} className="text-primary" />
            {chatId ? `Session / ${chatId}` : 'AI Analytics Terminal'}
          </h2>
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mt-1">Status: Active Connection</p>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-muted rounded-full border border-border">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground">Online</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 p-8 flex flex-col gap-8 bg-muted/20 relative">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none opacity-50 dark:opacity-20" />

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-5 max-w-4xl relative z-10 ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border shadow-sm'}`}>
              {msg.role === 'user' ? <User size={18} /> : <Terminal size={18} />}
            </div>
            <div className={`rounded-[12px] p-5 text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-[4px]' : 'bg-background border border-border rounded-tl-[4px]'}`}>
              {msg.role === 'ai' && <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 border-b border-border/50 pb-2">System Response</div>}
              <div className="max-w-full overflow-x-auto break-words">
              <ReactMarkdown
                components={{
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1.5 my-3 break-words" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1.5 my-3 break-words" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1 break-words" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 last:mb-0 break-words" {...props} />,
                  table: ({node, ...props}) => <div className="overflow-x-auto my-4 border border-border rounded-lg shadow-sm"><table className="w-full text-sm text-left whitespace-nowrap" {...props} /></div>,
                  thead: ({node, ...props}) => <thead className="text-xs uppercase bg-muted/50 text-muted-foreground" {...props} />,
                  th: ({node, ...props}) => <th className="px-4 py-3 border-b border-border font-semibold" {...props} />,
                  td: ({node, ...props}) => <td className="px-4 py-3 border-b border-border/50" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                  code: ({node, inline, className, children, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline ? (
                      <pre className="bg-[#18181B] text-white rounded-[8px] p-4 my-4 font-mono text-[13px] overflow-x-auto border border-border/20 shadow-inner">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                          <span className="text-[10px] font-mono uppercase text-white/50">{match?.[1] || 'code'}</span>
                        </div>
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-muted px-1.5 py-0.5 rounded-[4px] font-mono text-[13px] border border-border" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {msg.content}
              </ReactMarkdown>
              </div>
              {msg.role === 'ai' && (
                <div className="flex justify-end mt-4 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                   <button onClick={() => handleCopy(msg.content, i)} className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest bg-muted px-2 py-1 rounded-[4px] border border-border transition-colors">
                     {copiedIndex === i ? <Check size={12}/> : <Copy size={12}/>}
                     {copiedIndex === i ? 'Copied' : 'Copy Text'}
                   </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-5 max-w-4xl relative z-10">
            <div className="w-10 h-10 rounded-[8px] bg-background text-foreground border border-border flex items-center justify-center shrink-0 shadow-sm">
              <Terminal size={18} />
            </div>
            <div className="bg-background border border-border rounded-[12px] rounded-tl-[4px] p-5 text-sm shadow-sm flex items-center gap-3 text-muted-foreground font-mono uppercase tracking-wider text-[11px]">
              <Loader2 size={16} className="animate-spin text-primary" /> Processing query...
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-border bg-background z-10 relative">
        <form className="relative flex items-center" onSubmit={handleSubmit}>
          <input
            type="file"
            id="chat-file-upload"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            disabled={loading || uploadingFile}
          />
          <label 
            htmlFor="chat-file-upload" 
            className="absolute left-2 p-2.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors z-10 rounded-[8px] hover:bg-muted"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </label>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || uploadingFile}
            placeholder={uploadingFile ? "Uploading file..." : "Initialize query..."}
            className="w-full pl-12 pr-16 py-4 bg-muted/50 border border-border rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all text-[15px] disabled:opacity-50 font-mono placeholder:font-sans placeholder:text-muted-foreground/70"
          />
          <button type="submit" disabled={!input.trim() || loading || uploadingFile} className="absolute right-2 p-2.5 bg-primary text-primary-foreground rounded-[8px] hover:opacity-90 transition-all shadow-sm disabled:opacity-50">
            <Send size={18} />
          </button>
        </form>
        <div className="text-center mt-3">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">InsightFlow AI can make mistakes. Verify critical data.</span>
        </div>
      </div>
    </div>
  );
}
