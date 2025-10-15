import { useState, useEffect } from "react";
import {
  Send,
  Heart,
  Users,
  Target,
  Megaphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [announcements, setAnnouncements] = useState<
    Array<{ id: string; title: string; content: string }>
  >([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  useEffect(() => {
    fetchAnnouncements();

    const channel = supabase
      .channel("announcements-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements",
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentAnnouncementIndex((prev) =>
          prev === announcements.length - 1 ? 0 : prev + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setAnnouncements(data);
  };

  const nextAnnouncement = () => {
    setCurrentAnnouncementIndex((prev) =>
      prev === announcements.length - 1 ? 0 : prev + 1
    );
  };

  const prevAnnouncement = () => {
    setCurrentAnnouncementIndex((prev) =>
      prev === 0 ? announcements.length - 1 : prev - 1
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Save to database
    const { error } = await supabase.from("contact_submissions").insert([
      {
        name: formData.name,
        email: formData.email,
        message: formData.message,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit your message. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const emailSubject = encodeURIComponent(`Contact from ${formData.name}`);
    const emailBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    const whatsappMessage = encodeURIComponent(
      `*Contact Form Submission*\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );

    // Open email client
    window.open(
      `mailto:justiceadam673@gmail.com?subject=${emailSubject}&body=${emailBody}`,
      "_blank"
    );

    // Open WhatsApp
    window.open(
      `https://wa.me/2349018281266?text=${whatsappMessage}`,
      "_blank"
    );

    toast({
      title: "Message Sent!",
      description: "Your message has been saved and forwarded.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />

      <main className='flex-1'>
        <HeroCarousel />

        {announcements.length > 0 && (
          <section className='py-12 bg-primary/5'>
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
              <div className='relative'>
                <Card className='shadow-soft border-2 border-primary/20'>
                  <CardContent className='pt-6'>
                    <div className='flex items-start gap-4'>
                      <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0'>
                        <Megaphone className='w-6 h-6 text-primary' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-xl font-bold mb-2'>
                          {announcements[currentAnnouncementIndex].title}
                        </h3>
                        <p className='text-muted-foreground'>
                          {announcements[currentAnnouncementIndex].content}
                        </p>
                      </div>
                    </div>

                    {announcements.length > 1 && (
                      <div className='flex items-center justify-between mt-6'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={prevAnnouncement}
                          className='hover:bg-primary/10'
                        >
                          <ChevronLeft className='w-5 h-5' />
                        </Button>
                        <div className='flex gap-2'>
                          {announcements.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentAnnouncementIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === currentAnnouncementIndex
                                  ? "bg-primary w-6"
                                  : "bg-primary/30"
                              }`}
                              aria-label={`Go to announcement ${index + 1}`}
                            />
                          ))}
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={nextAnnouncement}
                          className='hover:bg-primary/10'
                        >
                          <ChevronRight className='w-5 h-5' />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        <section className='py-20 gradient-light'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16 animate-fade-in'>
              <h2 className='text-3xl md:text-4xl font-bold mb-4'>About Us</h2>
              <div className='w-24 h-1 bg-accent mx-auto mb-6'></div>
              <p className='text-lg text-muted-foreground max-w-3xl mx-auto'>
                Building Believers through the Word of Faith (The Gospel) and
                the Release of the Supernatural. Solving the Problems of
                Distress, Discontent and Debt through the Instrument of The
                Gospel, Growth and Gold
              </p>
            </div>

            <div className='grid md:grid-cols-3 gap-8'>
              <Card className='shadow-soft hover:shadow-gold transition-smooth'>
                <CardContent className='pt-6 text-center'>
                  <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Heart className='w-8 h-8 text-primary' />
                  </div>
                  <h3 className='text-xl font-bold mb-2'>GOSPEL</h3>
                  <p className='text-muted-foreground'>
                    Changing a Generation through the Teaching of the Word of
                    Faith and the Release of the Supernatural. ( Romans 1:16-17,
                    Colossians 1:4-6 )
                  </p>
                </CardContent>
              </Card>

              <Card className='shadow-soft hover:shadow-gold transition-smooth'>
                <CardContent className='pt-6 text-center'>
                  <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Users className='w-8 h-8 text-primary' />
                  </div>
                  <h3 className='text-xl font-bold mb-2'>GROWTH</h3>
                  <p className='text-muted-foreground'>
                    We are Committed to Growing a Community of Strong Men and
                    Women in every aspect and works of Life. From Weakness we
                    raise Strength. From Ashes we raise Cities. From Paupers we
                    Raise Billionaires.(1 Samuel 22:2, 2 Samuel 23:8 )
                  </p>
                </CardContent>
              </Card>

              <Card className='shadow-soft hover:shadow-gold transition-smooth'>
                <CardContent className='pt-6 text-center'>
                  <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Target className='w-8 h-8 text-primary' />
                  </div>
                  <h3 className='text-xl font-bold mb-2'>GOLD</h3>
                  <p className='text-muted-foreground'>
                    Prosperity is God's will for Every Believer. We are
                    Committed to Raising a Joyful and Prosperous Family in all
                    works of Life. (3 John 1:2, Psalms 35:27 )
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id='contact' className='py-20'>
          <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-12 animate-fade-in'>
              <h2 className='text-3xl md:text-4xl font-bold mb-4'>
                Contact Us
              </h2>
              <div className='w-24 h-1 bg-accent mx-auto mb-6'></div>
              <p className='text-lg text-muted-foreground'>
                Have questions or want to get involved? We'd love to hear from
                you.
              </p>
            </div>

            <Card className='shadow-soft'>
              <CardContent className='pt-6'>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div>
                    <Input
                      placeholder='Your Name'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Input
                      type='email'
                      placeholder='Your Email'
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder='Your Message'
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>
                  <Button type='submit' className='w-full' size='lg'>
                    <Send className='w-4 h-4 mr-2' />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
