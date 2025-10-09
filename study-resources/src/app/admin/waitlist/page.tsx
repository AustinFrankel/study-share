'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Lock, Download, Mail, Users, Loader2, CheckCircle, Search } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const ADMIN_PASSWORD = 'Unlock'

interface WaitlistEntry {
  id: string
  test_id: string
  test_name: string
  email: string
  name: string
  created_at: string
  user_id?: string
}

export default function WaitlistAdminPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [waitlistData, setWaitlistData] = useState<WaitlistEntry[]>([])
  const [filteredData, setFilteredData] = useState<WaitlistEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setError('')
      loadWaitlistData()
    } else {
      setError('Incorrect password')
    }
  }

  const loadWaitlistData = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase not configured')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('test_waitlist')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setWaitlistData(data || [])
      setFilteredData(data || [])
    } catch (err) {
      console.error('Error loading waitlist:', err)
      setError('Failed to load waitlist data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const filtered = waitlistData.filter(entry =>
        entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(waitlistData)
    }
  }, [searchTerm, waitlistData])

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert('No data to export')
      return
    }

    // Create CSV content
    const headers = ['Test Name', 'Test ID', 'Name', 'Email', 'Signup Date']
    const rows = filteredData.map(entry => [
      entry.test_name,
      entry.test_id,
      entry.name || '',
      entry.email,
      new Date(entry.created_at).toLocaleString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const exportEmailList = () => {
    if (filteredData.length === 0) {
      alert('No emails to export')
      return
    }

    // Create plain text email list
    const emails = [...new Set(filteredData.map(entry => entry.email))].join('\n')

    const blob = new Blob([emails], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `emails-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const groupByTest = () => {
    const grouped: Record<string, WaitlistEntry[]> = {}
    filteredData.forEach(entry => {
      if (!grouped[entry.test_name]) {
        grouped[entry.test_name] = []
      }
      grouped[entry.test_name].push(entry)
    })
    return grouped
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Navigation />
        <main className="max-w-md mx-auto px-4 py-20">
          <Card className="shadow-2xl border-2 border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
              <CardTitle className="flex items-center gap-3">
                <Lock className="w-6 h-6" />
                Admin Access Required
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <p className="text-slate-600">Enter admin password to access waitlist data</p>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}
                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800">
                  <Lock className="w-4 h-4 mr-2" />
                  Authenticate
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const testGroups = groupByTest()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Waitlist Admin Panel</h1>
          <p className="text-slate-600">Manage and export waitlist signups</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Signups</p>
                  <p className="text-2xl font-bold text-slate-900">{waitlistData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Unique Emails</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {new Set(waitlistData.map(e => e.email)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Tests</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Object.keys(testGroups).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </Button>
              <Button onClick={exportEmailList} className="bg-green-600 hover:bg-green-700">
                <Mail className="w-4 h-4 mr-2" />
                Export Email List
              </Button>
              <Button onClick={loadWaitlistData} variant="outline">
                <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">How to use exported data:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                <li><strong>CSV Export</strong>: Open in Excel/Google Sheets for analysis</li>
                <li><strong>Email List</strong>: Copy emails to Mailchimp, SendGrid, or your email service</li>
                <li><strong>Import to Email Service</strong>: Most services accept CSV or plain text email lists</li>
                <li><strong>Send Notifications</strong>: When test materials are ready, email the list</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by email, name, or test..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Waitlist Entries ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                <p className="text-slate-600 mt-2">Loading waitlist data...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <p className="text-center py-8 text-slate-600">No waitlist entries found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Signup Date/Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.test_name}</TableCell>
                        <TableCell>{entry.name || 'N/A'}</TableCell>
                        <TableCell>{entry.email}</TableCell>
                        <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
