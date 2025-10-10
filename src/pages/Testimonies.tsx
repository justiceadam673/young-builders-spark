import { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const testimonies = [
  {
    name: "Grace M.",
    testimony: "Joining Young Builders Foundation has transformed my life. I've found not just friends, but a family that supports and encourages me in my faith journey. The mentorship I've received has helped me discover my purpose and given me the confidence to pursue my dreams.",
  },
  {
    name: "David K.",
    testimony: "Being part of this foundation has taught me what it means to be a leader who serves. Through the various programs and activities, I've learned valuable life skills and deepened my relationship with God. This community has truly shaped who I am today.",
  },
  {
    name: "Sarah T.",
    testimony: "The impact of Young Builders Foundation on my life cannot be overstated. The spiritual guidance, practical teachings, and genuine fellowship have helped me grow in ways I never imagined. I'm grateful for this community that genuinely cares about young people.",
  },
  {
    name: "Michael O.",
    testimony: "Through YBF, I've learned that building my future starts with building my character. The foundation has provided a safe space where I can be myself, ask questions, and grow spiritually. The friendships I've made here are lifelong.",
  },
];

const Testimonies = () => {
  const [dbTestimonies, setDbTestimonies] = useState<Array<{ name: string; testimony: string }>>([]);

  useEffect(() => {
    const fetchTestimonies = async () => {
      const { data, error } = await supabase
        .from('testimonies')
        .select('name, testimony')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDbTestimonies(data);
      }
    };

    fetchTestimonies();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('testimonies-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'testimonies',
          filter: 'approved=eq.true'
        },
        () => {
          fetchTestimonies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const allTestimonies = [...dbTestimonies, ...testimonies];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Testimonies</h1>
            <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground">
              Hear from young builders whose lives have been transformed
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {allTestimonies.map((item, index) => (
              <Card key={index} className="shadow-soft hover:shadow-gold transition-smooth animate-fade-in">
                <CardContent className="pt-6">
                  <Quote className="w-10 h-10 text-accent mb-4" />
                  <p className="text-muted-foreground mb-4 leading-relaxed italic">
                    "{item.testimony}"
                  </p>
                  <p className="font-bold text-primary">— {item.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center p-8 bg-gradient-light rounded-lg shadow-soft">
            <h3 className="text-2xl font-bold mb-4">Share Your Story</h3>
            <p className="text-muted-foreground mb-6">
              Has Young Builders Foundation impacted your life? We'd love to hear your testimony. 
              Use the form in the footer below to share your story with us.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Testimonies;
