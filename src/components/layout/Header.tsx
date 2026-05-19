import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-transparent backdrop-blur-sm">
      <div className="text-2xl font-bold tracking-tighter text-white">
        TOXIC<span className="text-zinc-500">PREMIUM</span>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <Link href="#viral-trends" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          Viral Trends
        </Link>
        <Link href="#ai-tools" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          AI Tools
        </Link>
        <Link href="#ai-video" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          Video Creator
        </Link>
        <Link href="#about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          About
        </Link>
      </nav>
      <div>
        <button className="px-5 py-2 text-sm font-semibold text-black bg-white rounded-full hover:bg-zinc-200 transition-colors">
          Get Started
        </button>
      </div>
    </header>
  )
}
