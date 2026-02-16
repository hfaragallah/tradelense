import React, { useState } from 'react';
import { DiscussionPost, DiscussionTag } from '../types';
import { MessageSquare, ThumbsUp, MessageCircle, Share2, Pin, Shield, Filter, Plus, Check } from 'lucide-react';

interface SocialHubProps {
   posts: DiscussionPost[];
   selectedTag: DiscussionTag | 'All';
   onNewDiscussion: () => void;
   onTogglePin: (id: string) => void;
   onDiscussionClick: (post: DiscussionPost) => void;
}

export const SocialHub: React.FC<SocialHubProps> = ({ posts, selectedTag, onNewDiscussion, onTogglePin, onDiscussionClick }) => {
   const [shareCopiedId, setShareCopiedId] = useState<string | null>(null);

   const filteredPosts = posts.filter(post =>
      selectedTag === 'All' ? true : post.tag === selectedTag
   );

   const handleShare = (post: DiscussionPost) => {
      const text = `TraderLense Strategy Hub:\n"${post.title}"\nBy ${post.authorName} (${post.authorReputation} Rep)\n\nJoin the discussion: tradelens.app/d/${post.id}`;
      navigator.clipboard.writeText(text);
      setShareCopiedId(post.id);
      setTimeout(() => setShareCopiedId(null), 2000);
   };

   return (
      <div className="animate-fade-in w-full">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  <MessageSquare className="text-status-neutral" size={28} /> Strategy Hub
               </h1>
               <p className="text-text-muted mt-1">Collaborate, discuss macro trends, and refine psychology.</p>
            </div>
            <button
               onClick={onNewDiscussion}
               className="w-full md:w-auto justify-center md:justify-start flex items-center gap-2 px-4 py-2 bg-status-high text-background-primary font-bold rounded-lg hover:bg-green-500 transition-colors shadow-lg shadow-green-900/20"
            >
               <Plus size={18} /> New Discussion
            </button>
         </div>

         <div className="space-y-4">
            {filteredPosts.length === 0 ? (
               <div className="text-center py-12 text-text-muted bg-background-secondary rounded-xl border border-surface">
                  No discussion topics found for <span className="font-bold text-text-primary">"{selectedTag}"</span>.
               </div>
            ) : (
               filteredPosts.map(post => (
                  <div
                     key={post.id}
                     onClick={() => onDiscussionClick(post)}
                     className="bg-background-secondary border border-surface rounded-xl p-6 hover:border-surface/80 transition-all cursor-pointer group"
                  >
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center font-bold text-text-secondary border border-surface">
                              {post.authorName.charAt(0)}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <span className="font-bold text-text-primary text-sm">{post.authorName}</span>
                                 <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${post.authorReputation > 80 ? 'bg-status-high/10 text-status-high border-status-high/20' : 'bg-surface text-text-muted border-surface'}`}>
                                    <Shield size={10} /> {post.authorReputation}
                                 </span>
                              </div>
                              <span className="text-xs text-text-muted">{new Date(post.timestamp).toLocaleDateString()}</span>
                           </div>
                        </div>
                        {post.isPinned && (
                           <div className="flex items-center gap-1 text-xs text-status-warning bg-status-warning/10 px-2 py-1 rounded border border-status-warning/20">
                              <Pin size={12} /> Pinned
                           </div>
                        )}
                     </div>

                     <div className="mb-2">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-surface text-text-secondary border border-surface/50 mb-2">
                           {post.tag}
                        </span>
                        <h2 className="text-lg font-bold text-text-primary mb-2 group-hover:text-status-neutral transition-colors">{post.title}</h2>

                        {/* Image Preview in Feed */}
                        {post.imageUrl && (
                           <div className="mb-3 rounded-lg overflow-hidden h-40 w-full border border-surface">
                              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                           </div>
                        )}

                        <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                           {post.content}
                        </p>
                     </div>

                     <div className="flex items-center gap-6 mt-4 pt-4 border-t border-surface text-text-muted text-sm">
                        <button className="flex items-center gap-2 hover:text-status-high transition-colors">
                           <ThumbsUp size={16} /> {post.upvotes}
                        </button>
                        <button className="flex items-center gap-2 hover:text-text-primary transition-colors">
                           <MessageCircle size={16} /> {post.comments?.length || post.commentCount} Comments
                        </button>
                        <button
                           onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(post.id);
                           }}
                           className={`flex items-center gap-2 transition-colors ${post.isPinned ? 'text-status-warning hover:text-status-warning/80' : 'hover:text-text-primary'}`}
                        >
                           <Pin size={16} className={post.isPinned ? 'fill-current' : ''} />
                           {post.isPinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button
                           onClick={(e) => {
                              e.stopPropagation();
                              handleShare(post);
                           }}
                           className={`flex items-center gap-2 transition-colors ml-auto ${shareCopiedId === post.id ? 'text-status-high' : 'hover:text-text-primary'}`}
                        >
                           {shareCopiedId === post.id ? <Check size={16} /> : <Share2 size={16} />}
                           {shareCopiedId === post.id ? 'Copied!' : 'Share'}
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
};