'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-indigo-50" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 shadow-md flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
            </div>
            <span className="font-semibold text-lg">Study Share</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Share and discover study resources. Earn points, unlock badges, and help your class succeed together.
          </p>
        </div>

        <nav aria-label="Product navigation">
          <div className="font-semibold mb-3 text-gray-900">Product</div>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/browse" className="hover:text-indigo-600 transition-colors duration-200 hover:underline">Browse Resources</Link></li>
            <li><Link href="/upload" className="hover:text-indigo-600 transition-colors duration-200 hover:underline">Upload Materials</Link></li>
            <li><Link href="/profile" className="hover:text-indigo-600 transition-colors duration-200 hover:underline">My Profile</Link></li>
          </ul>
        </nav>

        <nav aria-label="Support navigation">
          <div className="font-semibold mb-3 text-gray-900">Support</div>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/help-center" className="hover:text-indigo-600 transition-colors duration-200 hover:underline">Help Center & FAQ</Link></li>
            <li><a href="mailto:austinhfrankel@gmail.com" className="hover:text-indigo-600 transition-colors duration-200 hover:underline">Contact Support</a></li>
            <li><Link href="/guidelines" className="hover:text-indigo-600 transition-colors duration-200 hover:underline">Community Guidelines</Link></li>
            <li><Link href="/honor-code" className="hover:text-indigo-600 transition-colors duration-200 hover:underline">Honor Code</Link></li>
          </ul>
        </nav>

        <nav aria-label="Legal navigation">
          <div className="font-semibold mb-3 text-gray-900">Legal</div>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/termsofuse" className="hover:text-indigo-600 transition-colors duration-200 hover:underline">Terms of Use</Link></li>
            <li><Link href="/privacy" className="hover:text-indigo-600 transition-colors duration-200 hover:underline">Privacy Policy</Link></li>
            <li><Link href="/cookies" className="hover:text-indigo-600 transition-colors duration-200 hover:underline">Cookie Policy</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t py-4 text-center text-xs text-gray-500 bg-indigo-50">
        <p>© {new Date().getFullYear()} Study Share. All rights reserved.</p>
      </div>
    </footer>
  )
}


