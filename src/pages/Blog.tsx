import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_name: string;
  created_at: string;
}

interface Comment {
  id: string;
  name: string;
  comment: string;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    authorName: "",
    image: null as File | null,
  });
  const [newComment, setNewComment] = useState({ name: "", comment: "" });
  const [createPassword, setCreatePassword] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost.id);
      const subscription = supabase
        .channel("blog_comments_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "blog_comments",
            filter: `post_id=eq.${selectedPost.id}`,
          },
          () => {
            fetchComments(selectedPost.id);
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [selectedPost]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error fetching posts", variant: "destructive" });
    } else {
      setPosts(data || []);
    }
  };

  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Error fetching comments", variant: "destructive" });
    } else {
      setComments(data || []);
    }
  };

  const verifyCreatePassword = async (password: string) => {
    const { data, error } = await supabase.functions.invoke(
      "verify-admin-password",
      {
        body: { password, action: "blog_create" },
      }
    );
    return data?.valid || false;
  };

  const convertToJpg = async (file: File): Promise<Blob> => {
    try {
      if ("createImageBitmap" in window) {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");
        ctx.drawImage(bitmap, 0, 0);
        const blob: Blob | null = await new Promise((res) =>
          canvas.toBlob((b) => res(b), "image/jpeg", 0.95)
        );
        if (!blob) throw new Error("Failed to convert image");
        return blob;
      }
    } catch (e) {
      // Fallback
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert image"));
            }
          },
          "image/jpeg",
          0.95
        );
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to decode image"));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.authorName) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    const isValid = await verifyCreatePassword(createPassword);
    if (!isValid) {
      toast({ title: "Invalid password", variant: "destructive" });
      return;
    }

    let imageUrl = null;
    if (newPost.image) {
      const ext = newPost.image.name.split(".").pop()?.toLowerCase() || "";
      const isJpeg =
        newPost.image.type === "image/jpeg" || ext === "jpg" || ext === "jpeg";
      if (
        newPost.image.type === "image/heic" ||
        newPost.image.type === "image/heif"
      ) {
        toast({
          title: "Unsupported image format",
          description: "Please upload a JPG, PNG, or WebP image.",
          variant: "destructive",
        });
        return;
      }
      const baseFileName = newPost.image.name.replace(/\.[^/.]+$/, "");
      const fileName = `blog/${Date.now()}-${baseFileName}.jpg`;
      const blobToUpload = isJpeg
        ? newPost.image
        : await convertToJpg(newPost.image);
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(fileName, blobToUpload, {
          contentType: "image/jpeg",
          upsert: false,
        });
      if (uploadError) {
        toast({ title: "Error uploading image", variant: "destructive" });
        return;
      }
      const { data: urlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("blog_posts").insert({
      title: newPost.title,
      content: newPost.content,
      author_name: newPost.authorName,
      image_url: imageUrl,
    });

    if (error) {
      toast({ title: "Error creating post", variant: "destructive" });
    } else {
      toast({ title: "Post created successfully" });
      setNewPost({ title: "", content: "", authorName: "", image: null });
      setCreatePassword("");
      setIsCreateDialogOpen(false);
      fetchPosts();
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !newComment.name || !newComment.comment) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("blog_comments").insert({
      post_id: selectedPost.id,
      name: newComment.name,
      comment: newComment.comment,
    });
    if (error) {
      toast({ title: "Error adding comment", variant: "destructive" });
    } else {
      toast({ title: "Comment added" });
      setNewComment({ name: "", comment: "" });
      fetchComments(selectedPost.id);
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <main className='container mx-auto px-4 py-8 mt-20'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-4xl font-bold'>Blog</h1>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Create Post</Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <Input
                  placeholder='Post Title'
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder='Content'
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  rows={8}
                />
                <Input
                  placeholder='Author Name'
                  value={newPost.authorName}
                  onChange={(e) =>
                    setNewPost({ ...newPost, authorName: e.target.value })
                  }
                />
                <Input
                  type='file'
                  accept='image/jpeg,image/png,image/webp'
                  onChange={(e) =>
                    setNewPost({
                      ...newPost,
                      image: e.target.files?.[0] || null,
                    })
                  }
                />
                <Input
                  type='password'
                  placeholder='Enter password'
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                />
                <Button onClick={handleCreatePost} className='w-full'>
                  Create Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {selectedPost ? (
          <div className='space-y-6'>
            <Button variant='outline' onClick={() => setSelectedPost(null)}>
              ← Back to Posts
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>{selectedPost.title}</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  By {selectedPost.author_name} on{" "}
                  {format(new Date(selectedPost.created_at), "PPP")}
                </p>
              </CardHeader>
              <CardContent>
                {selectedPost.image_url && (
                  <img
                    src={selectedPost.image_url}
                    alt={selectedPost.title}
                    className='w-full h-96 object-cover rounded-lg mb-4'
                  />
                )}
                <p className='whitespace-pre-wrap'>{selectedPost.content}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comments ({comments.length})</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {comments.map((comment) => (
                  <div key={comment.id} className='border-b pb-4'>
                    <p className='font-semibold'>{comment.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {format(new Date(comment.created_at), "PPP")}
                    </p>
                    <p className='mt-2'>{comment.comment}</p>
                  </div>
                ))}
                <div className='space-y-2 mt-6'>
                  <h3 className='font-semibold'>Add a Comment</h3>
                  <Input
                    placeholder='Your Name'
                    value={newComment.name}
                    onChange={(e) =>
                      setNewComment({ ...newComment, name: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder='Your Comment'
                    value={newComment.comment}
                    onChange={(e) =>
                      setNewComment({ ...newComment, comment: e.target.value })
                    }
                    rows={4}
                  />
                  <Button onClick={handleAddComment}>Submit Comment</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {posts.map((post) => (
              <Card
                key={post.id}
                className='cursor-pointer hover:shadow-lg transition-shadow'
                onClick={() => setSelectedPost(post)}
              >
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className='w-full h-48 object-cover rounded-t-lg'
                  />
                )}
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    By {post.author_name}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {format(new Date(post.created_at), "PPP")}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className='line-clamp-3'>{post.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
