import { Link } from "wouter";

export default function SiteHeader() {
  return (
    <header className="w-full border-b bg-background">
      <div className="container flex h-14 items-center justify-between px-4 max-w-5xl mx-auto">
        <Link href="/">
          <a className="font-bold text-sm tracking-tight hover:underline" data-testid="link-home">
            INTHEEPSTEINFILES.COM
          </a>
        </Link>
        
        <nav className="flex items-center gap-6 text-sm">
          <a 
            href="https://twitter.com/jessicasuarez" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
            data-testid="link-twitter"
          >
            @jessicasuarez
          </a>
          <a href="#about" className="hover:underline" data-testid="link-about">
            about
          </a>
          <a href="#sources" className="hover:underline" data-testid="link-sources">
            sources
          </a>
        </nav>
      </div>
    </header>
  );
}
