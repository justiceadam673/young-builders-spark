import { Music } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import dayOneTakeover from "@/assets/audio/day-1-takeover.mp3";

const messages = [
  {
    title: "Day 1 - Take Over Conference",
    audioUrl: dayOneTakeover,
    date: "January 2025",
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
                      <Music className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold">{message.title}</h3>
                        <span className="text-sm text-muted-foreground">{message.date}</span>
                      </div>
                      <audio 
                        controls 
                        className="w-full"
                        preload="metadata"
                      >
                        <source src={message.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
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
