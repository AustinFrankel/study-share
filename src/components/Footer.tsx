'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-lg">Study Share</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Share and discover study resources. Earn points, unlock badges, and help your class.
          </p>
        </div>

        <div>
          <div className="font-semibold mb-3">Product</div>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/browse">Browse</Link></li>
            <li><Link href="/upload">Upload</Link></li>
            <li><Link href="/profile">Profile</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Support</div>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/help-center">Help Center & FAQ</Link></li>
            <li><a href="mailto:austinhfrankel@gmail.com" className="hover:text-indigo-600">Contact Support</a></li>
            <li><Link href="/guidelines">Guidelines</Link></li>
            <li><Link href="/honor-code">Honor Code</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Legal</div>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/termsofuse" className="hover:text-indigo-600 transition-colors">Terms of Use</Link></li>
            <li><Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/cookies" className="hover:text-indigo-600 transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-gray-500 bg-indigo-50">
        © {new Date().getFullYear()} Study Share. All rights reserved.
      </div>
    </footer>
  )
}


