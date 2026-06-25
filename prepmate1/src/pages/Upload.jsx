import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, X, Loader2, Sparkles, BookOpen } from 'lucide-react';
import api from '../utils/api';
import { toast } from '../components/Toast';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        toast.error('Only PDF files are supported');
        return;
      }
      setFile(selected);
      // Auto-populate title if empty
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type !== 'application/pdf') {
        toast.error('Only PDF files are supported');
        return;
      }
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }
    if (!title.trim() || !subject.trim() || !description.trim()) {
      toast.error('Please fill in all metadata fields');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('subject', subject.trim());
    formData.append('description', description.trim());

    try {
      setIsSubmitting(true);
      toast.info('Uploading and indexing note contents...');
      
      await api.post('/upload-notes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Note uploaded and processed successfully!');
      navigate('/notes');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to upload note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-8 h-8 text-indigo-400" />
          Upload New Material
        </h1>
        <p className="text-gray-400 mt-1">Upload study documents in PDF format to generate AI insights</p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 shadow-xl">
        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Note Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4 - Photosynthesis"
              className="w-full bg-[#0c0c14]/60 border border-white/[0.08] focus:border-indigo-500 rounded-xl py-3 px-4 text-white outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Subject / Category</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Biology, Calculus, Physics"
              className="w-full bg-[#0c0c14]/60 border border-white/[0.08] focus:border-indigo-500 rounded-xl py-3 px-4 text-white outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300">Description</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a quick summary of what this PDF covers..."
            className="w-full bg-[#0c0c14]/60 border border-white/[0.08] focus:border-indigo-500 rounded-xl py-3 px-4 text-white outline-none transition-all resize-none"
          />
        </div>

        {/* File Drag-and-Drop Area */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300">Select PDF Document</label>
          
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer relative overflow-hidden group ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.01]'
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-all duration-300">
                  <UploadIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-white font-medium mb-1">Drag and drop your PDF here</p>
                <p className="text-gray-500 text-xs">or click to browse from device (Max 25MB)</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white truncate max-w-md">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !file}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
            isSubmitting || !file
              ? 'bg-indigo-600/50 cursor-not-allowed text-white/50'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10 hover:shadow-indigo-600/25'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Document with Gemini AI...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-indigo-300" />
              Upload & Process Study Material
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Upload;
