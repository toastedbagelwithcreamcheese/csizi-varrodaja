'use client' // Fontos, mert használunk onClick eseményt

import Link from 'next/link'
import { LayoutDashboard, Camera, Briefcase, LogOut } from 'lucide-react'
import { logout } from '../app/login/actions' // Importáljuk a logout actiont

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900 mr-8 hidden sm:block">Fotós Raktár</span>
            <div className="flex space-x-2 sm:space-x-4">
              <Link href="/" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                <Briefcase size={18} className="mr-2"/> <span className="hidden sm:inline">Kereskedés</span>
              </Link>
              <Link href="/personal" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                <Camera size={18} className="mr-2"/> <span className="hidden sm:inline">Saját</span>
              </Link>
              <Link href="/finance" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                <LayoutDashboard size={18} className="mr-2"/> <span className="hidden sm:inline">Pénzügy</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={() => logout()} 
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition"
              title="Kijelentkezés"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}