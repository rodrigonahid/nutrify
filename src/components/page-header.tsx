import { LogoutButton } from "./logout-button";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-white">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between max-w-300">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {children || <LogoutButton />}
      </div>
    </header>
  );
}
