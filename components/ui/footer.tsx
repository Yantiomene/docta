export default function Footer() {
  return (
    <footer className="bg-footer w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-white text-sm">
        <p className="text-white/80">© {new Date().getFullYear()} Docta</p>
        <div className="flex items-center gap-4">
          <a href="/" className="hover:text-white/80">Home</a>
          <a href="/privacy" className="hover:text-white/80">Privacy</a>
          <a href="/terms" className="hover:text-white/80">Terms</a>
        </div>
      </div>
    </footer>
  );
}
