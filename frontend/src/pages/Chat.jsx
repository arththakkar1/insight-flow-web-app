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
    <div className="flex flex-col flex-1 min-h-0 bg-background border-0 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="px-8 py-4 border-b border-border flex justify-between items-center bg-card/80 backdrop-blur-md z-10 relative">
        <div>
          <h2 className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground font-sans">
            <Terminal size={16} className="text-[#0099ff]" />
            {chatId ? `Session / ${chatId}` : 'AI Analytics Terminal'}
          </h2>
          <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">Status: Active Connection</p>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background rounded-full border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-muted-foreground">Online</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 p-8 flex flex-col gap-8 bg-background relative">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-5 max-w-4xl relative z-10 ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-foreground text-background border-foreground' : 'bg-card text-foreground border-border shadow-sm'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Terminal size={16} />}
            </div>
            <div className={`rounded-xl p-5 text-[14px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-[4px]' : 'bg-card border border-border text-foreground rounded-tl-[4px]'}`}>
              {msg.role === 'ai' && <div className="text-[9px] font-sans font-bold text-[#0099ff] uppercase tracking-wider mb-3 border-b border-border/50 pb-2">System Response</div>}
              <div className="max-w-full overflow-x-auto break-words">
              <ReactMarkdown
                components={{
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1.5 my-3 break-words" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1.5 my-3 break-words" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1 break-words font-sans text-muted-foreground" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 last:mb-0 break-words font-sans text-muted-foreground" {...props} />,
                  table: ({node, ...props}) => <div className="overflow-x-auto my-4 border border-border rounded-[15px] shadow-sm"><table className="w-full text-xs text-left whitespace-nowrap" {...props} /></div>,
                  thead: ({node, ...props}) => <thead className="text-[10px] uppercase bg-background text-foreground border-b border-border" {...props} />,
                  th: ({node, ...props}) => <th className="px-4 py-2.5 font-semibold" {...props} />,
                  td: ({node, ...props}) => <td className="px-4 py-2.5 border-b border-border/50 bg-card text-muted-foreground" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                  code: ({node, inline, className, children, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline ? (
                      <pre className="bg-background text-foreground rounded-[10px] p-4 my-4 font-mono text-[12px] overflow-x-auto border border-border shadow-inner">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/60">
                          <span className="text-[9px] font-mono uppercase text-muted-foreground">{match?.[1] || 'code'}</span>
                        </div>
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-background text-foreground px-1.5 py-0.5 rounded font-mono text-[12px] border border-border" {...props}>
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
                    <button onClick={() => handleCopy(msg.content, i)} className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-[9px] font-sans font-bold uppercase tracking-wider bg-background px-2.5 py-1 rounded-md border border-border transition-colors">
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
            <div className="w-9 h-9 rounded-full bg-card text-foreground border border-border flex items-center justify-center shrink-0 shadow-sm">
              <Terminal size={16} />
            </div>
            <div className="bg-card border border-border rounded-xl rounded-tl-[4px] p-5 text-sm shadow-sm flex items-center gap-3 text-muted-foreground font-mono uppercase tracking-wider text-[10px]">
              <Loader2 size={14} className="animate-spin text-[#0099ff]" /> Processing query...
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
            className="absolute left-3 p-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors z-10 rounded-lg hover:bg-card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </label>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || uploadingFile}
            placeholder={uploadingFile ? "Uploading file..." : "Initialize query..."}
            className="w-full pl-12 pr-16 py-3.5 bg-card border border-border rounded-[20px] focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/50 text-foreground transition-all text-sm disabled:opacity-50 font-mono placeholder:font-sans placeholder:text-muted-foreground"
          />
          <button type="submit" disabled={!input.trim() || loading || uploadingFile} className="absolute right-2 w-9 h-9 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all shadow-sm flex items-center justify-center disabled:opacity-50">
            <Send size={14} />
          </button>
        </form>
        <div className="text-center mt-3">
          <span className="text-[9px] font-sans text-muted-foreground uppercase tracking-wider">InsightFlow AI can make mistakes. Verify critical data.</span>
        </div>
      </div>
    </div>
  );
}
