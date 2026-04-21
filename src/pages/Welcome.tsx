import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center px-6 max-w-md text-center"
      >
        {/* Logo Emoji */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-7xl mb-8"
        >
          🎓
        </motion.div>

        {/* Headline */}
        <h1 className="font-display text-4xl font-bold text-[#1f2937] mb-4">
          Welcome to LearnStyle AI
        </h1>

        {/* Subtext */}
        <p className="text-lg text-[#6b7280] mb-10 leading-relaxed">
          Discover your unique learning style and unlock personalized study strategies designed just for you.
        </p>

        {/* Dot Page Indicator */}
        <div className="flex gap-2 mb-12">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`h-2.5 rounded-full transition-all ${
                i === 0 ? 'w-8 bg-[#1e3a8a]' : 'w-2.5 bg-[#9ca3af]'
              }`}
              animate={i === 0 ? { width: 32 } : { width: 10 }}
            />
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/auth?mode=signup')}
          size="lg"
          className="w-full bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-lg text-lg"
        >
          GET STARTED
        </Button>

        {/* Login Link */}
        <p className="text-[#6b7280] mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/auth?mode=login')}
            className="text-[#1e3a8a] font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome;
