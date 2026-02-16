import React, { useState } from 'react';
import { DiscussionPost, DiscussionComment } from '../types';
import { 
  ArrowLeft, MessageSquare, ThumbsUp, MessageCircle, Share2, Pin, Shield, Check, Send, Users
} from 'lucide-react';

interface DiscussionDetailProps {
  post: DiscussionPost;
  onBack: () => void;
  onTogglePin: (id: string) => void;
  onAddComment: (postId: string, content: string) => void;
}

export const DiscussionDetail: React.FC<DiscussionDetailProps> = ({ 
  post, 
  onBack, 
  onTogglePin,
  onAddComment
}) => {
  const [shareCopied, setShareCopied] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleShare = () => {
    const text = `TradeLens Strategy Hub:\n"${post.title}"\nBy ${post.authorName} (${post.authorReputation} Rep)\n\nJoin the discussion: tradelens.app/d/${post.id}`;
    navigator.clipboard.writeText(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(post.id, newComment);
    setNewComment('');
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Hub
      </button>

      {/* Main Post Card - Expanded */}
      <div className="bg-background-secondary border border-surface rounded-xl p-8 mb-6 relative overflow-hidden">
         {/* Pin Banner */}
         {post.isPinned && (
             <div className="absolute top-0 right-0">
                <div className="bg-status-warning/10 text-status-warning text-xs font-bold px-4 py-1.5 rounded-bl-xl border-l border-b border-status-warning/20 flex items-center gap-1">
                    <Pin size={12} className="fill-current" /> Pinned Strategy
                </div>
             </div>
         )}

         <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center font-bold text-lg text-text-secondary border border-surface">
              {post.authorName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                 <span className="font-bold text-text-primary text-lg">{post.authorName}</span>
                 <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${post.authorReputation > 80 ? 'bg-status-high/10 text-status-high border-status-high/20' : 'bg-surface text-text-muted border-surface'}`}>
                    <Shield size={12} /> {post.authorReputation} Rep
                 </span>
              </div>
              <span className="text-sm text-text-muted">{new Date(post.timestamp).toLocaleDateString()} at {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
         </div>

         <span className="inline-block px-3 py-1 rounded text-xs font-medium bg-surface text-text-secondary border border-surface/50 mb-4">
            {post.tag}
         </span>

         <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 leading-tight">
             {post.title}
         </h1>

         {post.imageUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-surface">
                <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
            </div>
         )}

         <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-line mb-8">
             {post.content}
         </div>

         <div className="flex items-center gap-4 pt-6 border-t border-surface text-text-muted">
             <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface hover:text-status-high transition-colors">
                 <ThumbsUp size={20} /> <span className="font-medium">{post.upvotes}</span>
             </button>
             
             <button 
               onClick={() => onTogglePin(post.id)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface transition-colors ${post.isPinned ? 'text-status-warning' : 'hover:text-status-warning'}`}
             >
                 <Pin size={20} className={post.isPinned ? 'fill-current' : ''} /> <span className="font-medium">{post.isPinned ? 'Unpin' : 'Pin'}</span>
             </button>

             <button 
                onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface transition-colors ml-auto ${shareCopied ? 'text-status-high' : 'hover:text-text-primary'}`}
              >
                 {shareCopied ? <Check size={20} /> : <Share2 size={20} />}
                 <span className="font-medium">{shareCopied ? 'Copied Link' : 'Share'}</span>
              </button>
         </div>
      </div>

      {/* Full Width Crowd Validation Section */}
      <div className="bg-background-secondary border border-surface rounded-xl p-6 md:p-8 mb-6 animate-fade-in">
         <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <Users size={20} className="text-status-neutral" /> Crowd Validation
         </h3>
         
         <div className="flex flex-col xl:flex-row gap-8 items-center">
            {/* Progress Section */}
            <div className="flex-1 w-full space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-sm text-text-secondary">Consensus</span>
                    <div className="text-right">
                       <span className="text-status-high font-bold text-lg">Strong Agree</span>
                       <p className="text-[10px] text-text-muted">Based on verified traders</p>
                    </div>
                </div>
                
                <div className="w-full bg-surface rounded-full h-4 overflow-hidden flex relative">
                    <div className="bg-status-high h-full" style={{ width: '75%' }}></div>
                    <div className="bg-status-risk h-full" style={{ width: '15%' }}></div>
                    <div className="bg-status-neutral h-full" style={{ width: '10%' }}></div>
                </div>

                <div className="flex justify-between text-xs font-medium text-text-muted">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-status-high"></span> Agree (75%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-status-risk"></span> Disagree (15%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-status-neutral"></span> Neutral (10%)</span>
                </div>
            </div>

            {/* Stats Divider */}
            <div className="hidden xl:block w-px h-16 bg-surface"></div>
            <div className="xl:hidden w-full h-px bg-surface"></div>

            {/* Stats Metrics */}
            <div className="flex justify-between gap-8 md:gap-12 w-full xl:w-auto">
                <div className="text-center">
                    <div className="text-3xl font-bold text-text-primary">{(post.upvotes || 0) + 24}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">Total Votes</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-text-primary">18</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">Verified</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-status-warning">Low</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">Controversy</div>
                </div>
            </div>
         </div>
      </div>

      {/* Comments Section */}
      <div className="bg-background-secondary border border-surface rounded-xl p-6 md:p-8">
         <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <MessageCircle className="text-text-muted" size={24} /> 
            Comments <span className="text-text-muted font-normal">({post.comments?.length || 0})</span>
         </h2>

         {/* Comment Form */}
         <form onSubmit={handleSubmitComment} className="mb-8 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-status-neutral flex-shrink-0 flex items-center justify-center font-bold text-white text-sm">
               Y
            </div>
            <div className="flex-1 relative">
               <textarea 
                  className="w-full bg-surface border border-surface/50 rounded-lg pl-4 pr-12 py-3 text-text-primary focus:border-status-neutral outline-none transition-all resize-none min-h-[100px]"
                  placeholder="Add to the discussion..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
               />
               <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-status-neutral text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-status-neutral transition-colors"
               >
                  <Send size={16} />
               </button>
            </div>
         </form>

         {/* Comments List */}
         <div className="space-y-6">
            {post.comments && post.comments.length > 0 ? (
                post.comments.map(comment => (
                   <div key={comment.id} className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-surface flex-shrink-0 flex items-center justify-center font-bold text-text-secondary border border-surface">
                         {comment.authorName.charAt(0)}
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-text-primary text-sm">{comment.authorName}</span>
                            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border bg-surface text-text-muted border-surface">
                               <Shield size={10} /> {comment.authorReputation}
                            </span>
                            <span className="text-xs text-text-muted ml-auto">{new Date(comment.timestamp).toLocaleDateString()}</span>
                         </div>
                         <p className="text-text-secondary text-sm leading-relaxed">
                            {comment.content}
                         </p>
                         <div className="mt-2 flex gap-4 text-xs font-medium text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="hover:text-text-primary">Reply</button>
                            <button className="hover:text-status-high">Like</button>
                         </div>
                      </div>
                   </div>
                ))
            ) : (
                <div className="text-center py-8 text-text-muted">
                   No comments yet. Be the first to share your thoughts.
                </div>
            )}
         </div>
      </div>
    </div>
  );
};