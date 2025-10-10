import { useState, useEffect } from "react";
import { HelpCircle, Send, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const faqs = [
  {
    question: "What is Young Builders Foundation International?",
    answer: "Young Builders Foundation International is a youth-focused organization dedicated to empowering young people through faith-based mentorship, leadership development, and community engagement. We provide a supportive environment where youth can grow spiritually, develop their talents, and build lasting relationships.",
  },
  {
    question: "Who can join the foundation?",
    answer: "Our foundation welcomes all young people who are eager to grow in their faith, develop leadership skills, and be part of a positive community. We believe in inclusivity and creating a space where everyone can thrive.",
  },
  {
    question: "What kind of activities does the foundation organize?",
    answer: "We organize a variety of activities including fellowship gatherings, mentorship sessions, leadership workshops, community service projects, spiritual retreats, and educational programs. Each activity is designed to help young people grow holistically.",
  },
  {
    question: "How can I get involved?",
    answer: "Getting involved is easy! You can reach out through our contact form, attend one of our events, or connect with us through our community outreach programs. We're always excited to welcome new members into the Young Builders family.",
  },
  {
    question: "Is there a membership fee?",
    answer: "We believe in making our programs accessible to all young people. While some specific events or programs may have associated costs, general membership and participation in most activities are free. Our goal is to remove barriers and create opportunities for all youth.",
  },
];

const QA = () => {
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answeredQuestions, setAnsweredQuestions] = useState<Array<{ question: string; answer: string; name: string }>>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('question, answer, name')
        .not('answer', 'is', null)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAnsweredQuestions(data);
      }
    };

    fetchQuestions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('questions-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions'
        },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !question.trim()) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Save to database
    const { error } = await supabase
      .from('questions')
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          question: question.trim(),
        }
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit your question. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Question Submitted!",
      description: "Thank you for your question. We'll respond soon.",
    });
    setName("");
    setEmail("");
    setQuestion("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Questions & Answers</h1>
            <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about Young Builders Foundation
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 shadow-soft">
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-smooth">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Submit Your Question</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your Question"
                    rows={4}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Question
                </Button>
              </form>
            </CardContent>
          </Card>

          {answeredQuestions.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                Community Questions & Answers
              </h2>
              <div className="space-y-4">
                {answeredQuestions.map((qa, index) => (
                  <Card key={index} className="shadow-soft">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-primary mb-2">Q: {qa.question}</p>
                          <p className="text-muted-foreground mb-2 leading-relaxed">A: {qa.answer}</p>
                          <p className="text-sm text-muted-foreground italic">— Asked by {qa.name}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QA;
