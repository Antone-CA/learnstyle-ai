import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Brain, Loader2 } from 'lucide-react';

type Category = 'Visual' | 'Auditory' | 'Read/Write' | 'Kinesthetic';

interface Question {
  text: string;
  options: { label: string; category: Category }[];
}

const questions: Question[] = [
  { text: "When learning something new, you prefer:", options: [
    { label: "Diagrams, charts, or visuals", category: "Visual" },
    { label: "Listening to explanations", category: "Auditory" },
    { label: "Reading written materials", category: "Read/Write" },
    { label: "Trying it yourself", category: "Kinesthetic" },
  ]},
  { text: "If someone explains a concept, you understand best when:", options: [
    { label: "They use graphs or illustrations", category: "Visual" },
    { label: "They talk it through step-by-step", category: "Auditory" },
    { label: "They give written notes", category: "Read/Write" },
    { label: "They show real-life examples", category: "Kinesthetic" },
  ]},
  { text: "When studying, you usually:", options: [
    { label: "Use mind maps or diagrams", category: "Visual" },
    { label: "Discuss topics with others", category: "Auditory" },
    { label: "Take detailed notes", category: "Read/Write" },
    { label: "Practice or simulate the task", category: "Kinesthetic" },
  ]},
  { text: "If you are learning how to use a new app, you prefer:", options: [
    { label: "Screenshots or visual guides", category: "Visual" },
    { label: "Someone explaining it verbally", category: "Auditory" },
    { label: "Written instructions/manual", category: "Read/Write" },
    { label: "Exploring and trying it yourself", category: "Kinesthetic" },
  ]},
  { text: "After a test, you prefer feedback:", options: [
    { label: "Graphs or charts of your performance", category: "Visual" },
    { label: "A discussion with your teacher", category: "Auditory" },
    { label: "Written comments", category: "Read/Write" },
    { label: "Practical examples of mistakes", category: "Kinesthetic" },
  ]},
  { text: "When attending a class, you prefer teachers who:", options: [
    { label: "Use diagrams and visuals", category: "Visual" },
    { label: "Encourage discussions", category: "Auditory" },
    { label: "Provide handouts and readings", category: "Read/Write" },
    { label: "Include activities or demonstrations", category: "Kinesthetic" },
  ]},
  { text: "When remembering information, you:", options: [
    { label: "Visualize it", category: "Visual" },
    { label: "Recall what was said", category: "Auditory" },
    { label: "Remember written words", category: "Read/Write" },
    { label: "Recall what you did", category: "Kinesthetic" },
  ]},
  { text: "When learning a skill (e.g., coding), you prefer:", options: [
    { label: "Flowcharts or system diagrams", category: "Visual" },
    { label: "Listening to explanations/tutorials", category: "Auditory" },
    { label: "Reading documentation", category: "Read/Write" },
    { label: "Coding and experimenting", category: "Kinesthetic" },
  ]},
  { text: "When choosing between options, you:", options: [
    { label: "Compare visual charts", category: "Visual" },
    { label: "Ask others for advice", category: "Auditory" },
    { label: "Read detailed descriptions", category: "Read/Write" },
    { label: "Try each option", category: "Kinesthetic" },
  ]},
  { text: "When working on a project, you:", options: [
    { label: "Design layouts/visuals", category: "Visual" },
    { label: "Talk through ideas", category: "Auditory" },
    { label: "Write plans or outlines", category: "Read/Write" },
    { label: "Build prototypes", category: "Kinesthetic" },
  ]},
  { text: "When trying to remember directions to a place, you prefer:", options: [
    { label: "Looking at a map or visual guide", category: "Visual" },
    { label: "Listening to someone explain the route", category: "Auditory" },
    { label: "Reading written directions", category: "Read/Write" },
    { label: "Traveling the route yourself to remember it", category: "Kinesthetic" },
  ]},
  { text: "When learning a complex process, you prefer:", options: [
    { label: "A flowchart or diagram showing the steps", category: "Visual" },
    { label: "Someone explaining the process verbally", category: "Auditory" },
    { label: "Written instructions listing each step", category: "Read/Write" },
    { label: "Performing the steps yourself while learning", category: "Kinesthetic" },
  ]},
  { text: "When working in a group, you learn most when:", options: [
    { label: "Ideas are illustrated with diagrams or visuals", category: "Visual" },
    { label: "Everyone discusses and talks through ideas", category: "Auditory" },
    { label: "Notes or documents are shared and reviewed", category: "Read/Write" },
    { label: "The group builds or demonstrates something", category: "Kinesthetic" },
  ]},
  { text: "If you need to understand a new concept, you prefer:", options: [
    { label: "Seeing graphs, models, or visual representations", category: "Visual" },
    { label: "Listening to a lecture or explanation", category: "Auditory" },
    { label: "Reading textbooks or articles", category: "Read/Write" },
    { label: "Observing or participating in demonstrations", category: "Kinesthetic" },
  ]},
  { text: "When preparing for an exam, you usually:", options: [
    { label: "Review charts, diagrams, and visual summaries", category: "Visual" },
    { label: "Talk through topics with classmates", category: "Auditory" },
    { label: "Rewrite notes or read materials repeatedly", category: "Read/Write" },
    { label: "Practice solving problems or doing exercises", category: "Kinesthetic" },
  ]},
  { text: "When learning about how a machine or system works, you prefer:", options: [
    { label: "Studying diagrams or schematics", category: "Visual" },
    { label: "Listening to an explanation about how it operates", category: "Auditory" },
    { label: "Reading manuals or documentation", category: "Read/Write" },
    { label: "Taking it apart or experimenting with it", category: "Kinesthetic" },
  ]},
  { text: "When attending a workshop or training, you benefit most from:", options: [
    { label: "Visual slides, diagrams, or demonstrations", category: "Visual" },
    { label: "Listening to explanations and discussions", category: "Auditory" },
    { label: "Written materials or guides", category: "Read/Write" },
    { label: "Hands-on activities or practice", category: "Kinesthetic" },
  ]},
  { text: "When learning something difficult, you prefer to:", options: [
    { label: "Visualize the information through diagrams", category: "Visual" },
    { label: "Hear examples and explanations", category: "Auditory" },
    { label: "Write notes or read explanations", category: "Read/Write" },
    { label: "Try different approaches and learn by doing", category: "Kinesthetic" },
  ]},
];

const Assessment = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [processing, setProcessing] = useState(false);
  const { updateProfile, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Shuffle questions once on mount
  const shuffled = useMemo(() => {
    const arr = questions.map((q, i) => ({ ...q, originalIndex: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const selectAnswer = useCallback((optIndex: number) => {
    setAnswers(prev => {
      const copy = [...prev];
      copy[currentQ] = optIndex;
      return copy;
    });
  }, [currentQ]);

  if (!isLoggedIn) {
    navigate('/auth?mode=login');
    return null;
  }

  const q = shuffled[currentQ];
  const progress = ((currentQ + 1) / shuffled.length) * 100;

  const goNext = () => {
    if (currentQ < shuffled.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      finishAssessment();
    }
  };

  const finishAssessment = () => {
    setProcessing(true);

    setTimeout(() => {
      const scores: Record<Category, number> = { Visual: 0, Auditory: 0, 'Read/Write': 0, Kinesthetic: 0 };
      shuffled.forEach((q, i) => {
        const picked = answers[i];
        if (picked !== null) {
          scores[q.options[picked].category] += 1;
        }
      });

      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      const best = (Object.entries(scores) as [Category, number][]).sort((a, b) => b[1] - a[1])[0];
      const confidence = total > 0 ? Math.round((best[1] / total) * 100) : 0;

      updateProfile({
        learningStyle: best[0],
        confidenceScore: confidence,
        assessmentDate: new Date().toISOString().split('T')[0],
        assessmentHistory: [{ date: new Date().toISOString().split('T')[0], style: best[0], score: confidence }],
      });

      navigate('/dashboard');
    }, 3000);
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mb-6 mx-auto h-20 w-20 rounded-full gradient-primary flex items-center justify-center animate-pulse">
            <Brain className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Processing AI Diagnosis...</h2>
          <p className="text-muted-foreground mb-4">Analyzing your cognitive patterns</p>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-16 pb-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">VARK Assessment</h1>
          <p className="text-sm text-muted-foreground">Question {currentQ + 1} of {shuffled.length}</p>
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-elevated border-border">
              <CardContent className="p-8">
                <h2 className="font-display text-lg font-semibold text-foreground mb-6">{q.text}</h2>
                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={`w-full text-left rounded-lg border p-4 transition-all text-sm ${
                        answers[currentQ] === i
                          ? 'border-primary bg-primary/5 text-foreground font-medium shadow-card'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50'
                      }`}
                    >
                      <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQ(c => c - 1)}
                    disabled={currentQ === 0}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                  </Button>
                  <Button
                    onClick={goNext}
                    disabled={answers[currentQ] === null}
                    className="gradient-primary text-primary-foreground"
                  >
                    {currentQ === shuffled.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Assessment;
