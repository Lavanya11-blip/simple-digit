import { Calculator } from '@/components/Calculator';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />
      </div>
      
      {/* Title */}
      <h1 className="text-2xl font-semibold text-foreground mb-8 tracking-tight animate-fade-in">
        Calculator
      </h1>
      
      {/* Calculator */}
      <Calculator />
      
      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground opacity-40 animate-fade-in">
        Built with React & TypeScript
      </p>
    </div>
  );
};

export default Index;
