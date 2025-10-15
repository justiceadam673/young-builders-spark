import { useEffect, useState } from "react";
import { Music, Lock, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import dayOneTakeover from "@/assets/audio/day-1-takeover.mp3";
import dayTwoFaith from "@/assets/audio/day-2-faith-seminar.mp3";
import dayThreeGospel from "@/assets/audio/day-3-gospel-seminar.mp3";

const Messages = () => {
  const [messages, setMessages] = useState<
    Array<{ title: string; audio_url: string; date: string }>
  >([]);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newMessage, setNewMessage] = useState({
    title: "",
    date: "",
    file: null as File | null,
  });

  const audioMap: Record<string, string> = {
    "day-1-takeover.mp3": dayOneTakeover,
    "day-2-faith-seminar.mp3": dayTwoFaith,
    "day-3-gospel-seminar.mp3": dayThreeGospel,
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("title, audio_url, date")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const messagesWithLocalAudio = data.map((msg) => ({
        ...msg,
        audio_url: audioMap[msg.audio_url] || msg.audio_url,
      }));
      setMessages(messagesWithLocalAudio);
    }
  };

  const verifyPassword = async () => {
    const { data } = await supabase.functions.invoke("verify-admin-password", {
      body: { password: adminPassword, action: "messages_gallery" },
    });

    if (data?.valid) {
      setIsAuthenticated(true);
      toast({ title: "Access granted" });
    } else {
      toast({ title: "Invalid password", variant: "destructive" });
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.title || !newMessage.date || !newMessage.file) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    // Upload audio file
    const fileName = `${Date.now()}-${newMessage.file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("messages")
      .upload(fileName, newMessage.file);

    if (uploadError) {
      toast({ title: "Error uploading file", variant: "destructive" });
      return;
    }

    // Get public URL for the uploaded audio
    const {
      data: { publicUrl },
    } = supabase.storage.from("messages").getPublicUrl(fileName);

    // Insert message record
    const { error } = await supabase.from("messages").insert([
      {
        title: newMessage.title,
        date: newMessage.date,
        audio_url: publicUrl,
      },
    ]);

    if (error) {
      toast({ title: "Error adding message", variant: "destructive" });
    } else {
      toast({ title: "Message added successfully" });
      setNewMessage({ title: "", date: "", file: null });
      setIsAdminDialogOpen(false);
      setIsAuthenticated(false);
      setAdminPassword("");
      fetchMessages();
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />

      <main className='flex-1 py-12'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12 animate-fade-in'>
            <h1 className='text-4xl md:text-5xl font-bold mb-4'>
              Life Changing <br />
              <span className='font-normal text-2xl '>
                Messages, Seminars and Trainings
              </span>
            </h1>
            <div className='w-24 h-1 bg-accent mx-auto mb-6'></div>
            <p className='text-lg text-muted-foreground'>
              Words of encouragement and wisdom for young builders
            </p>
          </div>

          <div className='mb-6 flex justify-end'>
            <Dialog
              open={isAdminDialogOpen}
              onOpenChange={setIsAdminDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant='outline'>
                  <Plus className='w-4 h-4 mr-2' />
                  Add Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Message</DialogTitle>
                </DialogHeader>
                {!isAuthenticated ? (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <Lock className='w-4 h-4' />
                      <span className='text-sm text-muted-foreground'>
                        Enter password to continue
                      </span>
                    </div>
                    <Input
                      type='password'
                      placeholder='Admin Password'
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                    <Button onClick={verifyPassword} className='w-full'>
                      Verify
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <Input
                      placeholder='Message Title'
                      value={newMessage.title}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, title: e.target.value })
                      }
                    />
                    <Input
                      type='date'
                      value={newMessage.date}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, date: e.target.value })
                      }
                    />
                    <Input
                      type='file'
                      accept='audio/*'
                      onChange={(e) =>
                        setNewMessage({
                          ...newMessage,
                          file: e.target.files?.[0] || null,
                        })
                      }
                    />
                    <Button onClick={handleAddMessage} className='w-full'>
                      Add Message
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className='space-y-6'>
            {messages.map((message, index) => (
              <Card
                key={index}
                className='shadow-soft hover:shadow-gold transition-smooth animate-fade-in'
              >
                <CardContent className='pt-6'>
                  <div className='flex items-start gap-4'>
                    <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0'>
                      <Music className='w-6 h-6 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex justify-between items-start mb-4'>
                        <h3 className='text-xl font-bold'>{message.title}</h3>
                        <span className='text-sm text-muted-foreground'>
                          {message.date}
                        </span>
                      </div>
                      <audio controls className='w-full' preload='metadata'>
                        <source src={message.audio_url} type='audio/mpeg' />
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
