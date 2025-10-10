import { MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const messages = [
  {
    title: "Building Your Future",
    content: "Every great building starts with a strong foundation. As young builders, we must invest in our character, faith, and skills today to create the future we envision tomorrow.",
    date: "January 2025",
  },
  {
    title: "Unity in Purpose",
    content: "Together we are stronger. When we unite in purpose and support one another, there is no limit to what we can achieve as a community of young builders.",
    date: "December 2024",
  },
  {
    title: "Faith Over Fear",
    content: "The challenges we face are opportunities for growth. With faith as our guide and determination in our hearts, we can overcome any obstacle and build something beautiful.",
    date: "November 2024",
  },
  {
    title: "Leadership Through Service",
    content: "True leadership is not about position or power, but about serving others with humility and love. As we serve, we grow into the leaders our communities need.",
    date: "October 2024",
  },
];

const Messages = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Inspirational Messages</h1>
            <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground">
              Words of encouragement and wisdom for young builders
            </p>
          </div>

          <div className="space-y-6">
            {messages.map((message, index) => (
              <Card key={index} className="shadow-soft hover:shadow-gold transition-smooth animate-fade-in">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold">{message.title}</h3>
                        <span className="text-sm text-muted-foreground">{message.date}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
