import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, BookOpen, Upload } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_image_url: string;
  file_url: string;
  created_at: string;
}

const Books = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: books, isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Book[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!coverImage || !bookFile) {
        throw new Error("Please select both cover image and book file");
      }

      // Upload cover image
      const coverExt = coverImage.name.split(".").pop();
      const coverPath = `${crypto.randomUUID()}.${coverExt}`;
      const { error: coverError } = await supabase.storage
        .from("book-covers")
        .upload(coverPath, coverImage);

      if (coverError) throw coverError;

      const { data: { publicUrl: coverUrl } } = supabase.storage
        .from("book-covers")
        .getPublicUrl(coverPath);

      // Upload book file
      const fileExt = bookFile.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      const { error: fileError } = await supabase.storage
        .from("book-files")
        .upload(filePath, bookFile);

      if (fileError) throw fileError;

      const { data: { publicUrl: fileUrl } } = supabase.storage
        .from("book-files")
        .getPublicUrl(filePath);

      // Insert book record
      const { error: dbError } = await supabase.from("books").insert({
        title,
        author,
        description,
        cover_image_url: coverUrl,
        file_url: fileUrl,
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("Book uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setIsUploadOpen(false);
      setTitle("");
      setAuthor("");
      setDescription("");
      setCoverImage(null);
      setBookFile(null);
      setCoverPreview("");
      setIsAuthenticated(false);
      setPassword("");
    },
    onError: (error) => {
      toast.error("Failed to upload book: " + error.message);
    },
  });

  const handlePasswordCheck = () => {
    if (password === "BOOKS") {
      setIsAuthenticated(true);
      toast.success("Access granted!");
    } else {
      toast.error("Incorrect password");
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async (fileUrl: string, title: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to download book");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Books Library</h1>
            <p className="text-muted-foreground">Download and read our collection</p>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Book</DialogTitle>
              </DialogHeader>
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password">Enter Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password to upload"
                    />
                  </div>
                  <Button onClick={handlePasswordCheck} className="w-full">
                    Submit
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Book Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter book title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Enter author name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter book description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cover">Cover Image</Label>
                    <Input
                      id="cover"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                    />
                    {coverPreview && (
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="mt-2 w-32 h-48 object-cover rounded"
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="file">Book File (PDF)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button
                    onClick={() => uploadMutation.mutate()}
                    disabled={uploadMutation.isPending || !title || !author || !coverImage || !bookFile}
                    className="w-full"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload Book"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading books...</div>
        ) : books && books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="overflow-hidden">
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-64 object-cover"
                />
                <CardHeader>
                  <CardTitle>{book.title}</CardTitle>
                  <CardDescription>by {book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  {book.description && (
                    <p className="text-sm text-muted-foreground mb-4">{book.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(book.file_url, book.title)}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(book.file_url, "_blank")}
                      className="flex-1"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Read
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No books available yet. Upload the first book!
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Books;
