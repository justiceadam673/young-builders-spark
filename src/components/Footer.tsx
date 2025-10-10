import { useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const [name, setName] = useState("");
  const [testimony, setTestimony] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !testimony.trim()) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Save to database
    const { error } = await supabase
      .from('testimonies')
      .insert([
        {
          name: name.trim(),
          testimony: testimony.trim(),
          approved: true, // Auto-approve for now
        }
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit your testimony. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Testimony Submitted!",
      description: "Thank you for sharing your testimony with us.",
    });
    setName("");
    setTestimony("");
  };

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Share Your Testimony</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Textarea
                placeholder="Share your testimony..."
                value={testimony}
                onChange={(e) => setTestimony(e.target.value)}
                rows={3}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Button
                type="submit"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Testimony
              </Button>
            </form>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/" className="hover:text-accent transition-smooth">
                Home
              </Link>
              <Link to="/messages" className="hover:text-accent transition-smooth">
                Messages
              </Link>
              <Link to="/gallery" className="hover:text-accent transition-smooth">
                Gallery
              </Link>
              <Link to="/testimonies" className="hover:text-accent transition-smooth">
                Testimonies
              </Link>
              <Link to="/qa" className="hover:text-accent transition-smooth">
                Q&A
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Young Builders Foundation International. All rights reserved.</p>
          <p className="mt-2 text-primary-foreground/80">Empowering youth to build their future</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
