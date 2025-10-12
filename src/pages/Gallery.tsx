import { useState, useEffect } from "react";
import { Lock, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import image1 from "@/assets/gallery/youth-outdoor-1.jpg";
import image2 from "@/assets/gallery/youth-outdoor-2.jpg";
import image3 from "@/assets/gallery/youth-outdoor-3.jpg";
import image4 from "@/assets/gallery/youth-indoor-1.jpg";
import image5 from "@/assets/gallery/speaker.jpg";
import image6 from "@/assets/gallery/mentoring.jpg";
import image7 from "@/assets/gallery/prayer.jpg";

const galleryImages = [
  { src: image1, alt: "Youth fellowship outdoor activity", title: "Community Gathering" },
  { src: image2, alt: "Young people celebrating together", title: "Unity & Joy" },
  { src: image3, alt: "Youth mentoring session", title: "Growing Together" },
  { src: image4, alt: "Indoor fellowship", title: "Fellowship Time" },
  { src: image5, alt: "Youth speaker sharing message", title: "Inspiring Messages" },
  { src: image6, alt: "One-on-one mentoring", title: "Personal Mentorship" },
  { src: image7, alt: "Youth in prayer", title: "Faith & Prayer" },
];

const Gallery = () => {
  const [dbImages, setDbImages] = useState<Array<{ id: string; image_url: string; title: string | null }>>([]);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newImage, setNewImage] = useState({ title: "", file: null as File | null });

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select('id, image_url, title')
      .order('created_at', { ascending: false });

    if (data) setDbImages(data);
  };

  const verifyPassword = async () => {
    const { data } = await supabase.functions.invoke('verify-admin-password', {
      body: { password: adminPassword, action: 'messages_gallery' }
    });

    if (data?.valid) {
      setIsAuthenticated(true);
      toast({ title: "Access granted" });
    } else {
      toast({ title: "Invalid password", variant: "destructive" });
    }
  };

  const handleUploadImage = async () => {
    if (!newImage.file) {
      toast({ title: "Please select an image", variant: "destructive" });
      return;
    }

    const fileName = `${Date.now()}-${newImage.file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, newImage.file);

    if (uploadError) {
      toast({ title: "Error uploading image", variant: "destructive" });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName);

    const { error } = await supabase
      .from('gallery_images')
      .insert([{ image_url: publicUrl, title: newImage.title || null }]);

    if (error) {
      toast({ title: "Error saving image", variant: "destructive" });
    } else {
      toast({ title: "Image uploaded successfully" });
      setNewImage({ title: "", file: null });
      setIsAdminDialogOpen(false);
      setIsAuthenticated(false);
      setAdminPassword("");
      fetchGalleryImages();
    }
  };

  const allImages = [
    ...galleryImages,
    ...dbImages.map(img => ({ src: img.image_url, alt: img.title || "Gallery image", title: img.title || "Untitled" }))
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Gallery</h1>
            <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground">
              Moments of growth, fellowship, and community
            </p>
          </div>

          <div className="mb-6 flex justify-end">
            <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Gallery Image</DialogTitle>
                </DialogHeader>
                {!isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground">Enter password to continue</span>
                    </div>
                    <Input
                      type="password"
                      placeholder="Admin Password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                    <Button onClick={verifyPassword} className="w-full">Verify</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input
                      placeholder="Image Title (optional)"
                      value={newImage.title}
                      onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewImage({ ...newImage, file: e.target.files?.[0] || null })}
                    />
                    <Button onClick={handleUploadImage} className="w-full">Upload Image</Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allImages.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg shadow-soft hover:shadow-gold transition-smooth animate-fade-in aspect-square"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-smooth flex items-end p-6">
                  <h3 className="text-white font-bold text-lg">{image.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
