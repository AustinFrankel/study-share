'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Lock, FileText, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const UPLOAD_PASSWORD = 'Austin11!'

export default function LiveUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const testId = searchParams.get('test')
  const testName = searchParams.get('name')
  
  const [password, setPassword] = useState('')
  const [passwordVerified, setPasswordVerified] = useState(false)
  const [uploadType, setUploadType] = useState<'image' | 'text'>('image')
  const [textContent, setTextContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === UPLOAD_PASSWORD) {
      setPasswordVerified(true)
      setError('')
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError('')

    try {
      const uploadData: any = {
        test_id: testId,
        test_name: testName,
        uploader_id: user?.id || null,
        upload_type: uploadType,
        created_at: new Date().toISOString()
      }

      if (uploadType === 'text') {
        uploadData.content = textContent
      } else if (uploadType === 'image' && selectedFiles.length > 0) {
        // Upload images to storage
        const imageUrls: string[] = []
        
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${testId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `live-tests/${fileName}`

          try {
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('resources')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              })

            if (uploadError) {
              console.error('Storage upload error:', uploadError)
              throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
            }

            const { data: { publicUrl } } = supabase.storage
              .from('resources')
              .getPublicUrl(filePath)

            imageUrls.push(publicUrl)
          } catch (storageError: any) {
            console.error('Storage error:', storageError)
            throw new Error(`Storage error for ${file.name}: ${storageError.message || 'Unknown error'}`)
          }
        }

        uploadData.image_urls = imageUrls
      }

      // Store in database
      try {
        const { data, error: dbError } = await supabase
          .from('live_test_uploads')
          .insert(uploadData)
          .select()

        if (dbError) {
          console.error('Database error:', dbError)
          throw new Error(`Database error: ${dbError.message || 'Failed to save to database'}`)
        }

        console.log('Upload successful:', data)
        setSuccess(true)
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(`/live/view?test=${testId}&name=${encodeURIComponent(testName || '')}`)
        }, 2000)
      } catch (dbErr: any) {
        console.error('DB operation failed:', dbErr)
        throw new Error(`Failed to save: ${dbErr.message || 'Database operation failed'}`)
      }

    } catch (err: any) {
      console.error('Upload error:', err)
      const errorMessage = err?.message || err?.error?.message || err?.error_description || 'Failed to upload. Please try again.'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  if (!testId || !testName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-red-600 text-lg">Invalid test information. Please go back to the Live page.</p>
          <Button onClick={() => router.push('/live')} className="mt-4">
            Back to Live Tests
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!passwordVerified ? (
          <Card className="shadow-2xl border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Lock className="w-7 h-7" />
                Password Required
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <p className="text-gray-700 mb-4">
                    This is a restricted area. Enter the password to upload test materials for <strong>{testName}</strong>.
                  </p>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="mt-2"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg">
                  <Lock className="w-5 h-5 mr-2" />
                  Verify Password
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : success ? (
          <Card className="shadow-2xl border-2 border-green-200">
            <CardContent className="pt-10 pb-10 text-center">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your test materials have been uploaded. Redirecting to view page...
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Upload className="w-7 h-7" />
                Upload Test Materials - {testName}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpload} className="space-y-6">
                {/* Upload Type Selection */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Upload Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUploadType('image')}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        uploadType === 'image'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <ImageIcon className={`w-8 h-8 mx-auto mb-2 ${uploadType === 'image' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <p className="font-semibold">Images</p>
                      <p className="text-xs text-gray-500 mt-1">Upload photos of test</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('text')}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        uploadType === 'text'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText className={`w-8 h-8 mx-auto mb-2 ${uploadType === 'text' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <p className="font-semibold">Text</p>
                      <p className="text-xs text-gray-500 mt-1">Type or paste content</p>
                    </button>
                  </div>
                </div>

                {/* Upload Content */}
                {uploadType === 'image' ? (
                  <div>
                    <Label htmlFor="file-upload" className="text-base font-semibold">Select Images</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">Click to upload images</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB each</p>
                      </label>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {selectedFiles.map((file, idx) => (
                            <li key={idx}>• {file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="text-content" className="text-base font-semibold">Test Content</Label>
                    <Textarea
                      id="text-content"
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Paste or type the test questions here..."
                      className="mt-2 min-h-[400px] font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">Format each question clearly with numbers or bullets</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/live')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading || (uploadType === 'image' && selectedFiles.length === 0) || (uploadType === 'text' && !textContent.trim())}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white py-6 text-lg"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Test
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
