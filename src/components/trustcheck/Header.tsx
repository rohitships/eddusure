import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">TrustCheck</h1>
      </div>
    </header>
  );
}
