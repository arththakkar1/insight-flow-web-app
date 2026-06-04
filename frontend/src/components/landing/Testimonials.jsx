export default function Testimonials() {
  const testimonials = [
    {
      quote: "InsightFlow cut our dashboard development time in half. The DAX generator alone is worth its weight in gold.",
      author: "Sarah Jenkins",
      role: "Lead BI Developer, TechNova"
    },
    {
      quote: "I used to spend hours manually profiling Excel dumps. Now, I just upload it and let the AI do the heavy lifting. Incredible.",
      author: "Michael Chen",
      role: "Data Analyst, FinServe"
    },
    {
      quote: "The layout blueprints helped our team standardize how we present data to executives. Highly recommended.",
      author: "Elena Rodriguez",
      role: "VP of Analytics, RetailPro"
    }
  ];

  return (
    <section className="bg-card py-32 border-t border-border/50">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Loved by data teams</h2>
          <p className="text-lg text-muted-foreground">See how InsightFlow is changing the way analysts work.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div key={index} className="p-8 rounded-3xl bg-background border border-border/50 shadow-sm flex flex-col justify-between">
              <p className="text-lg mb-8 leading-relaxed italic text-foreground/80">"{t.quote}"</p>
              <div>
                <p className="font-semibold">{t.author}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
