import React, { useState, useRef } from 'react';
import { X, MessageSquare, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { DiscussionPost, DiscussionTag } from '../types';
import { z } from 'zod';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<DiscussionPost, 'id' | 'timestamp' | 'upvotes' | 'commentCount'>) => void;
}

// Zod Schema
const DiscussionSchema = z.object({
  title: z.string().min(5, "Title too short").max(100, "Title too long").refine(val => !/<script/i.test(val), "Invalid characters detected"),
  content: z.string().min(20, "Content must be at least 20 characters").max(2000, "Content limit exceeded").refine(val => !/<script/i.test(val), "Invalid characters detected"),
});

export const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<DiscussionTag>(DiscussionTag.GENERAL);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
          setError("Image too large (Max 2MB)");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = DiscussionSchema.safeParse({ title, content });
    
    if (!validation.success) {
        setError(validation.error.errors[0].message);
        return;
    }

    onSubmit({
      authorName: 'You', // Mock
      authorReputation: 75, // Mock
      title,
      content,
      tag,
      imageUrl: imagePreview || undefined,
      isPinned: false,
    });
    
    // Reset and close
    setTitle('');
    setContent('');
    setImagePreview(null);
    setTag(DiscussionTag.GENERAL);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-background-secondary border border-surface rounded-xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-surface sticky top-0 bg-background-secondary z-10">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <MessageSquare size={20} className="text-status-neutral" />
            Start Discussion
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Topic Title</label>
            <input 
              type="text" 
              placeholder="e.g. Rate cuts impact on tech stocks..." 
              className="w-full bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral focus:ring-1 focus:ring-status-neutral outline-none transition-all font-bold"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(DiscussionTag).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    tag === t 
                      ? 'bg-status-neutral text-white border-status-neutral' 
                      : 'bg-surface text-text-secondary border-surface hover:border-text-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Analysis & Thoughts</label>
            <textarea 
              className="w-full h-40 bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral focus:ring-1 focus:ring-status-neutral outline-none transition-all resize-none leading-relaxed"
              placeholder="Share your structured thoughts. Remember: Critique the idea, not the person."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />

            {/* Image Upload */}
            <div className="mt-3">
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleImageUpload} 
                 accept="image/*" 
                 className="hidden" 
               />
               
               {!imagePreview ? (
                 <button 
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface bg-background-primary hover:bg-surface text-xs text-text-secondary transition-colors"
                 >
                   <ImageIcon size={14} /> Add Image / Chart
                 </button>
               ) : (
                 <div className="relative inline-block mt-2">
                   <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg border border-surface object-cover" />
                   <button 
                     type="button"
                     onClick={removeImage}
                     className="absolute -top-2 -right-2 p-1 bg-status-risk text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                   >
                     <X size={12} />
                   </button>
                 </div>
               )}
            </div>
          </div>

          {error && (
               <div className="p-3 bg-status-risk/10 border border-status-risk/20 rounded-lg flex items-center gap-2 text-status-risk text-sm font-bold animate-in slide-in-from-bottom-2">
                   <AlertCircle size={16} />
                   {error}
               </div>
           )}

          <div className="pt-4 border-t border-surface flex justify-end gap-3">
             <button 
               type="button" 
               onClick={onClose}
               className="px-6 py-2.5 rounded-lg text-text-secondary hover:bg-surface font-medium transition-colors"
             >
               Cancel
             </button>
             <button 
               type="submit"
               className="px-6 py-2.5 rounded-lg bg-status-neutral text-white font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20"
             >
               Post Discussion
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};