import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  Trash2, 
  FileText, 
  Brain, 
  BookOpen, 
  Sparkles, 
  Loader2, 
  Plus
} from 'lucide-react';
import api from '../utils/api';
import { toast } from '../components/Toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);

  const fetchNotes = useCallback(async (query = '') => {
    try {
      setLoading(true);
      if (query.trim()) {
        const res = await api.get(`/search-notes?query=${encodeURIComponent(query)}`);
        setNotes(res.data.notes || res.data || []);
      } else {
        const res = await api.get('/get-notes?page=1&limit=50&sort=latest');
        setNotes(res.data.notes || res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchNotes(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, fetchNotes]);

  const handleDownload = async (note) => {
    try {
      toast.info(`Starting download for ${note.title}...`);
      const res = await api.get(`/download-note/${note._id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', note.filename || `${note.title || 'note'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download completed!');
    } catch (err) {
      console.error(err);
      toast.error('Download failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(id);
      await api.delete(`/delete-note/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
      toast.success('Note deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete note');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Study Notes</h1>
          <p className="text-gray-400 mt-1">Manage, study, and generate AI tests from your notes</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="group bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl px-5 py-3 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/30 shrink-0 self-start md:self-auto hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          Upload Notes
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, subject, or description..."
          className="w-full glass rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 hover:border-white/[0.15]"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={searchQuery ? 'No matching notes found' : 'No notes uploaded yet'}
          description={
            searchQuery
              ? 'Try adjusting your search query or clear the filter'
              : 'Upload notes in PDF format and let AI help you study faster'
          }
          actionLabel={searchQuery ? 'Clear Search' : 'Upload First Note'}
          onAction={searchQuery ? () => setSearchQuery('') : () => navigate('/upload')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note, index) => (
            <div
              key={note._id}
              className="group relative bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/20 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-indigo-500/5 hover:scale-[1.01] animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
            >
              {/* Subtle gradient border glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Note Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-semibold uppercase tracking-wider truncate max-w-[150px]">
                    {note.subject || 'General'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatSize(note.file_size || note.size)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
                  {note.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-6">
                  {note.description || 'No description provided.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 border-t border-white/[0.05] pt-4 mt-auto">
                {/* AI Helpers */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={() => navigate(`/notes/${note._id}/summary`)}
                    className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 hover:bg-indigo-500/5 text-gray-300 hover:text-indigo-400 text-xs font-semibold transition-all cursor-pointer group/btn"
                  >
                    <BookOpen className="w-4 h-4 mb-1 text-gray-500 group-hover/btn:text-indigo-400 transition-colors" />
                    Summary
                  </button>
                  <button
                    onClick={() => navigate(`/notes/${note._id}/quiz`)}
                    className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-violet-500/20 hover:bg-violet-500/5 text-gray-300 hover:text-violet-400 text-xs font-semibold transition-all cursor-pointer group/btn"
                  >
                    <Brain className="w-4 h-4 mb-1 text-gray-500 group-hover/btn:text-violet-400 transition-colors" />
                    Quiz
                  </button>
                  <button
                    onClick={() => navigate(`/notes/${note._id}/flashcards`)}
                    className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-fuchsia-500/20 hover:bg-fuchsia-500/5 text-gray-300 hover:text-fuchsia-400 text-xs font-semibold transition-all cursor-pointer group/btn"
                  >
                    <Sparkles className="w-4 h-4 mb-1 text-gray-500 group-hover/btn:text-fuchsia-400 transition-colors" />
                    Cards
                  </button>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(note.upload_date || note.created_at)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(note)}
                      className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
                          handleDelete(note._id);
                        }
                      }}
                      disabled={isDeleting === note._id}
                      className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all cursor-pointer disabled:opacity-50"
                      title="Delete Note"
                    >
                      {isDeleting === note._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
