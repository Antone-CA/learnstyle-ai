import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, ChevronDown, Brain, BarChart3, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import heroBrain from '@/assets/hero-brain.jpg';

const ScienceSection = () => (
  <section id="how-it-works" className="py-24 bg-card">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          The Science Behind the AI
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A three-stage diagnostic pipeline grounded in decades of educational research.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: Brain,
            title: "VARK-Based Data Collection",
            text: "Our assessment engine is built upon the globally recognized VARK Model (Visual, Auditory, Read/Write, and Kinesthetic), a pedagogical framework supported by decades of educational research. Rather than using a simple \"quiz,\" LearnStyle AI utilizes a curated set of multidimensional questions designed to isolate specific cognitive preferences. These questions are mapped to real-world academic behaviors—such as how a student retains information during a lecture or how they approach complex problem-solving—ensuring that the raw data we collect is grounded in established behavioral science.",
          },
          {
            icon: BarChart3,
            title: "Ensemble ML Classification",
            text: "Once a student submits their responses, the system moves beyond basic scoring. We employ a Supervised Machine Learning approach, specifically using an Ensemble Classifier (Random Forest), to analyze the data. Instead of looking at answers in isolation, the AI identifies hidden patterns across the entire dataset. It calculates a \"Weighted Probability\" for each learning modality, allowing the system to distinguish between a primary learning style and a \"Multimodal\" profile. This ensures that the classification is not just a guess, but a mathematically backed prediction with a high confidence interval.",
          },
          {
            icon: Cpu,
            title: "Personalized Roadmap Sync",
            text: "The final stage of our architecture is the seamless synchronization between the diagnostic engine and our PostgreSQL recommendation database. Once the AI confirms your profile, our integration layer immediately pulls a customized study roadmap tailored to your specific cognitive DNA. By analyzing thousands of data points from successful learners, the system provides actionable strategies—ranging from specific note-taking techniques to sensory-based study habits—turning abstract AI predictions into a practical tool for academic excellence.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="rounded-xl border border-border bg-background p-8 shadow-card"
          >
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg gradient-primary">
              <item.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-3">{item.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Index = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleTakeAssessment = () => {
    if (isLoggedIn) {
      navigate('/assessment');
    } else {
      navigate('/auth?mode=signup');
    }
  };

  const handleHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent/20 blur-[100px]" />
        </div>

        <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-primary-foreground">Stop Studying Harder.</span>
              <br />
              <span className="text-gradient">Start Studying Smarter.</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-lg">
              LearnStyle AI uses Machine Learning to decode how your brain processes information. Get a personalized study roadmap in under 5 minutes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={handleTakeAssessment}
                className="gradient-primary text-primary-foreground px-8 text-base font-semibold shadow-elevated hover:opacity-90 transition-opacity"
              >
                Take the Assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleHowItWorks}
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 text-base"
              >
                How It Works <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <img
              src={heroBrain}
              alt="3D neural brain visualization"
              width={1024}
              height={768}
              className="w-full max-w-lg rounded-2xl shadow-elevated"
            />
          </motion.div>
        </div>
      </section>

      {/* Science Section */}
      <ScienceSection />

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="container">© 2026 LearnStyle AI. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Index;
