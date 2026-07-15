import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../auth/AuthContext'
import { SimpleLayout } from '../layouts/SimpleLayout'

export function UploadPortalPage() {
  const { accessToken } = useAuth()
  const [files, setFiles] = useState<Record<string, any>>({})
  const [selectedType, setSelectedType] = useState('brokerage')
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return
    axios
      .get('/api/upload/list/', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => setFiles(res.data.folder_files || {}))
      .catch(() => setFiles({}))
  }, [accessToken])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFiles(e.target.files)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFiles || !accessToken) return
    setLoading(true)
    setMessage(null)
    const form = new FormData()
    form.append('data_type', selectedType)
    for (let i = 0; i < selectedFiles.length; i++) {
      form.append('data_file', selectedFiles[i])
    }

    try {
      const res = await axios.post('/api/data-upload/', form, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data' },
      })
      setMessage(res.data.message || 'Upload successful')
      const listRes = await axios.get('/api/upload/list/', { headers: { Authorization: `Bearer ${accessToken}` } })
      setFiles(listRes.data.folder_files || {})
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(data_type: string, file_name: string) {
    if (!accessToken) return
    if (!confirm(`Delete ${file_name}? This will remove related DB records for brokerage/mf.`)) return
    setLoading(true)
    try {
      const res = await axios.post(
        '/api/delete-file/',
        new URLSearchParams({ data_type, file_name }),
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      setMessage(res.data.message || 'Deleted')
      const listRes = await axios.get('/api/upload/list/', { headers: { Authorization: `Bearer ${accessToken}` } })
      setFiles(listRes.data.folder_files || {})
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SimpleLayout>
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">Upload Portal</h1>
      {message && <div className="mb-4 rounded bg-blue-100 text-blue-800 px-3 py-2 text-sm">{message}</div>}

      <form onSubmit={handleUpload} className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
        <div className="flex items-center gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded border px-3 py-2"
          >
            <option value="brokerage">Brokerage</option>
            <option value="mf">MF</option>
            <option value="client">Client</option>
            <option value="employee">Employee</option>
          </select>

          <input type="file" multiple onChange={handleFileChange} />

          <button className="rounded bg-blue-600 text-white px-4 py-2" disabled={loading}>
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(files).map(([dtype, list]: any) => (
          <div key={dtype} className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-sm font-semibold text-slate-600 mb-2">{dtype.toUpperCase()}</div>
            {list.length === 0 ? (
              <div className="text-slate-500 text-sm">No files</div>
            ) : (
              <ul className="text-sm">
                {list.map((f: any) => (
                  <li key={f.name} className="flex items-center justify-between py-1">
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-slate-500 text-xs">{f.size} KB</div>
                    </div>
                    <div>
                      <button onClick={() => handleDelete(f.data_type, f.name)} className="text-red-600 text-sm">
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </SimpleLayout>
  )
}

