import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Question {
  id: string;
  name: string;
  email: string;
  question: string;
  answer: string | null;
  created_at: string;
  answered_at: string | null;
}

const AdminQA = () => {
  const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchQuestions();
    const subscription = supabase
      .channel('questions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        fetchQuestions();
      })
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const fetchQuestions = async () => {
    const { data: unanswered } = await supabase
      .from('questions')
      .select('*')
      .is('answer', null)
      .order('created_at', { ascending: false });

    const { data: answered } = await supabase
      .from('questions')
      .select('*')
      .not('answer', 'is', null)
      .order('answered_at', { ascending: false });

    setUnansweredQuestions(unanswered || []);
    setAnsweredQuestions(answered || []);
  };

  const verifyAnswerPassword = async (password: string) => {
    const { data, error } = await supabase.functions.invoke('verify-admin-password', {
      body: { password, action: 'qa_answers' }
    });
    return data?.valid || false;
  };

  const handleAnswerQuestion = async () => {
    if (!selectedQuestion || !answerText) {
      toast({ title: "Please enter an answer", variant: "destructive" });
      return;
    }

    const isValid = await verifyAnswerPassword(password);
    if (!isValid) {
      toast({ title: "Invalid password", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('questions')
      .update({ answer: answerText, answered_at: new Date().toISOString() })
      .eq('id', selectedQuestion.id);

    if (error) {
      toast({ title: "Error submitting answer", variant: "destructive" });
    } else {
      toast({ title: "Answer submitted successfully" });
      setAnswerText("");
      setPassword("");
      setSelectedQuestion(null);
      setIsDialogOpen(false);
      fetchQuestions();
    }
  };

  const openAnswerDialog = (question: Question) => {
    setSelectedQuestion(question);
    setAnswerText(question.answer || "");
    setPassword("");
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <h1 className="text-4xl font-bold mb-8">Q&A Administration</h1>

        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Pending Questions ({unansweredQuestions.length})</h2>
          <div className="space-y-4">
            {unansweredQuestions.map((q) => (
              <Card key={q.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{q.question}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Asked by {q.name} ({q.email}) on {format(new Date(q.created_at), 'PPP')}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => openAnswerDialog(q)}>Answer Question</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Answered Questions ({answeredQuestions.length})</h2>
          <div className="space-y-4">
            {answeredQuestions.map((q) => (
              <Card key={q.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{q.question}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Asked by {q.name} on {format(new Date(q.created_at), 'PPP')}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold mb-2">Answer:</p>
                  <p className="whitespace-pre-wrap">{q.answer}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Answered on {q.answered_at ? format(new Date(q.answered_at), 'PPP') : 'N/A'}
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => openAnswerDialog(q)}>
                    Edit Answer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Answer Question</DialogTitle>
            </DialogHeader>
            {selectedQuestion && (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Question:</p>
                  <p>{selectedQuestion.question}</p>
                </div>
                <Textarea
                  placeholder="Your answer"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={6}
                />
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnswerQuestion()}
                />
                <Button onClick={handleAnswerQuestion} className="w-full">
                  Submit Answer
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default AdminQA;
