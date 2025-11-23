export default function Footer() {
  return (
    <footer className="bg-background border-t border-black/10 dark:border-white/15">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-foreground text-sm">
        <p className="text-foreground/70">© {new Date().getFullYear()} Docta</p>
        <div className="flex items-center gap-4">
          <a href="/" className="hover:underline">Home</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
        </div>
      </div>
    </footer>
  );
}

