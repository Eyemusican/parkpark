"use client"

import { Clock, Bell, LogOut, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [time, setTime] = useState<string>("")
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="px-4 sm:px-6 md:px-8 py-5 flex items-center justify-between">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-900 mr-2"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 md:gap-2 sm:gap-4 md:gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-xs md:text-sm font-mono text-gray-900 font-medium">{time}</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-900 relative hidden sm:block">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-400/50" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100">
                <Avatar className="h-10 w-10 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 ring-2 ring-gray-200">
                  <AvatarFallback className="bg-transparent text-white font-semibold">
                    {user?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
              <DropdownMenuLabel className="text-slate-200">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-slate-400">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
