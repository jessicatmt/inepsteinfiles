export default function SiteFooter() {
  return (
    <footer className="w-full border-t bg-background py-6">
      <div className="container px-4 max-w-5xl mx-auto">
        <p className="text-xs text-muted-foreground text-center" data-testid="text-last-updated">
          last updated: november 19, 2024
        </p>
      </div>
    </footer>
  );
}
