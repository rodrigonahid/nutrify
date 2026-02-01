import { LogoutButton } from "./logout-button";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-8 flex items-center justify-between max-w-300">
        <h1 className="text-xl font-bold">{title}</h1>
        {children || <LogoutButton />}
      </div>
    </header>
  );
}
