import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for individuals exploring data optimization.",
      features: ["Up to 3 datasets", "Basic data profiling", "Community support"],
      cta: "Get started",
      featured: false
    },
    {
      name: "Teams",
      price: "$49",
      period: "/mo",
      description: "For professionals needing predictive modeling.",
      features: ["Unlimited datasets", "Predictive ML models", "Priority support", "Dashboard reports"],
      cta: "Start free trial",
      featured: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For organizations requiring custom integrations.",
      features: ["Custom data connectors", "SSO & Advanced Security", "Dedicated manager", "Custom AI fine-tuning"],
      cta: "Contact sales",
      featured: false
    }
  ];

  return (
    <section className="bg-background py-[96px] border-t border-border" id="pricing">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-[50px] font-medium tracking-framer-lg text-foreground mb-4 leading-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-base text-muted-foreground max-w-xl font-sans">
            Start for free, upgrade when you need predictive capabilities and unlimited datasets.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`p-8 rounded-[20px] border flex flex-col justify-between min-h-[480px] transition-all ${
                plan.featured 
                  ? 'border-border bg-accent text-foreground shadow-md' 
                  : 'border-border bg-card text-foreground shadow-sm'
              }`}
            >
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2 font-sans">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-8 font-sans">
                  {plan.description}
                </p>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground font-sans">{plan.period}</span>}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check size={16} className="text-[#22c55e] shrink-0" />
                      <span className="text-sm text-muted-foreground font-sans font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link 
                to={plan.name === 'Enterprise' ? '#contact' : '/register'} 
                className={`w-full py-2.5 rounded-full text-center text-sm font-semibold transition active:scale-[0.98] ${
                  plan.featured 
                    ? 'bg-primary text-primary-foreground hover:opacity-90' 
                    : 'bg-secondary text-foreground hover:bg-accent border border-border hover:opacity-90'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
