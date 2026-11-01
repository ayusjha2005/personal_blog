import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { api } from '../../services/api';

export default function LikeButton({ slug, initialLikes = 0 }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleLike = async () => {
    if (liked) return;

    // Optimistic UI update
    setLikes((prev) => prev + 1);
    setLiked(true);
    setAnimating(true);

    try {
      const res = await api.likeArticle(slug);
      if (res.likes !== undefined) {
        setLikes(res.likes);
      }
    } catch (err) {
      console.error('Failed to like article:', err);
      // Revert if error
      setLikes((prev) => Math.max(0, prev - 1));
      setLiked(false);
    } finally {
      setTimeout(() => setAnimating(false), 500);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleLike}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs sm:text-sm font-bold shadow-sm ${
        liked
          ? 'bg-crimson text-white border-crimson shadow-crimson/30'
          : 'bg-surface text-secondary hover:text-primary hover:border-crimson/40 border-subtle'
      }`}
      aria-label="Like this article"
    >
      <motion.div
        animate={animating ? { scale: [1, 1.5, 1], rotate: [0, -15, 15, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <Heart className={`w-4 h-4 ${liked ? 'fill-white text-white' : 'text-crimson'}`} />
      </motion.div>
      <span>{likes}</span>
      <span className="hidden sm:inline font-normal">{likes === 1 ? 'Like' : 'Likes'}</span>
    </motion.button>
  );
}
