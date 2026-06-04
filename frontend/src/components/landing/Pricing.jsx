import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for individuals exploring AI-driven analytics.",
      features: ["Up to 3 datasets", "Basic DAX generation", "Community support"],
      cta: "Get Started",
      primary: false
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "For data professionals needing advanced capabilities.",
      features: ["Unlimited datasets", "Advanced DAX & explanations", "Priority support", "Dashboard blueprints"],
      cta: "Start Free Trial",
      primary: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For organizations requiring custom integrations and security.",
      features: ["Custom data connectors", "Dedicated success manager", "SSO & Advanced Security", "Custom AI fine-tuning"],
      cta: "Contact Sales",
      primary: false
    }
  ];

  return (
    <section className="bg-background py-32 border-t border-border/50" id="pricing">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground">Start for free, upgrade when you need more power.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`p-8 rounded-3xl border flex flex-col ${plan.primary ? 'border-primary bg-primary/5 relative shadow-xl shadow-primary/10' : 'border-border/50 bg-card shadow-sm'}`}>
              {plan.primary && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">Most Popular</div>}
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">{plan.description}</p>
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check size={18} className="text-primary shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to={plan.name === 'Enterprise' ? '#contact' : '/register'} className={`w-full py-3 rounded-full text-center font-medium transition ${plan.primary ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-muted text-foreground hover:bg-border/50'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
