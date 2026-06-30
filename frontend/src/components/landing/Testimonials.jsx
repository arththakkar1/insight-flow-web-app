import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "InsightFlow cut our report development time in half. The ML modeling tool is incredibly simple yet powerful.",
      author: "Sarah Jenkins",
      role: "Lead BI Developer, TechNova",
      initials: "SJ",
      color: "bg-[#ff7a3d]/15 text-[#ff7a3d]"
    },
    {
      quote: "I used to spend hours manually profiling CSV dumps. Now, I just upload it and get model reports in minutes.",
      author: "Michael Chen",
      role: "Data Analyst, FinServe",
      initials: "MC",
      color: "bg-[#ff5577]/15 text-[#ff5577]"
    },
    {
      quote: "The feature importances and diagnostics visualizer helped us validate our predictive targets with key executives.",
      author: "Elena Rodriguez",
      role: "VP of Analytics, RetailPro",
      initials: "ER",
      color: "bg-[#6a4cf5]/15 text-[#6a4cf5]"
    }
  ];

  return (
    <section className="bg-background py-[96px] border-t border-border">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-[50px] font-medium tracking-framer-lg text-foreground mb-4 leading-tight">
            Loved by analytical teams
          </h2>
          <p className="text-base text-muted-foreground max-w-xl font-sans">
            See how data teams are optimizing their preprocessing and predictions with InsightFlow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <div key={index} className="p-8 rounded-[20px] bg-card border border-border flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex gap-1 mb-5 text-[#ff7a3d]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-8 font-sans">
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold font-sans ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none mb-1 font-sans">{t.author}</p>
                  <p className="text-xs text-muted-foreground font-sans leading-none">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
