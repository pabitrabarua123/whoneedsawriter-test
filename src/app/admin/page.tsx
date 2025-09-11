'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { Trash2, Edit, Plus, Save, Upload, X, Image as ImageIcon, Shield } from 'lucide-react';
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { Block, PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface BlogPost {
  title: string;
  description: string;
  date: string;
  slug: string;
  ogImage?: {
    url: string;
  };
  content: string;
  blocks?: PartialBlock[];
}

interface BlogPostFile {
  title: string;
  description: string;
  date: string;
  slug: string;
  ogImage?: {
    url: string;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication and admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }

      if (session?.user?.email) {
        try {
          const response = await fetch('/api/admin/check-role');
          const data = await response.json();
          
          if (data.isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            toast.error('Access denied. Admin privileges required.');
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
          toast.error('Error verifying permissions.');
          router.push('/dashboard');
        }
      }
      
      setIsCheckingAuth(false);
    };

    checkAdminRole();
  }, [session, status]);

  // Show loading state while checking authentication
  if (isCheckingAuth || status === 'loading') {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">Verifying admin access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if not admin
  if (isAdmin === false) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Shield className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You do not have admin privileges to access this page.</p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Return the AdminPageContent component if user is admin
  return <AdminPageContent />;
}

// Separate component for the actual admin page content
function AdminPageContent() {
  const [blogPost, setBlogPost] = useState<BlogPost>({
    title: '',
    description: '',
    date: new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }),
    slug: '',
    content: '',
    blocks: [
      {
        type: "paragraph",
        content: "",
      }
    ],
    ogImage: {
      url: 'https://d3kno6bpmj270m.cloudfront.net/shipped/Shipped_Nextjs_Deployment_OG.jpg'
    }
  });

  const [existingPosts, setExistingPosts] = useState<BlogPostFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('editor');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create BlockNote editor - only create it client-side
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "paragraph",
        content: "",
      }
    ],
  });

  useEffect(() => {
    setMounted(true);
    loadExistingPosts();
    // Set initial image preview if there's already an image URL
    if (blogPost.ogImage?.url) {
      setImagePreview(blogPost.ogImage.url);
    }
  }, []);

  // Update editor when blogPost blocks change
  useEffect(() => {
    if (mounted && editor && blogPost.blocks && blogPost.blocks.length > 0) {
      // Only update if the blocks are different from current editor content
      const currentBlocks = editor.document;
      if (JSON.stringify(currentBlocks) !== JSON.stringify(blogPost.blocks)) {
        editor.replaceBlocks(editor.document, blogPost.blocks);
      }
    }
  }, [blogPost.blocks, mounted, editor]);

  // Update image preview when ogImage URL changes
  useEffect(() => {
    if (blogPost.ogImage?.url) {
      setImagePreview(blogPost.ogImage.url);
    }
  }, [blogPost.ogImage?.url]);

  // Convert BlockNote blocks to HTML
  const blocksToHTML = async (blocks: PartialBlock[]): Promise<string> => {
    try {
      if (!mounted) return '';
      const html = await editor.blocksToHTMLLossy(blocks);
      console.log('HTML:', html);
      return html;
    } catch (error) {
      console.error('Error converting blocks to HTML:', error);
      return '';
    }
  };

  // Convert HTML to BlockNote blocks
  const htmlToBlocks = async (html: string): Promise<PartialBlock[]> => {
    try {
      if (!mounted) return [{ type: "paragraph", content: "" }];
      const blocks = await editor.tryParseHTMLToBlocks(html);
      return blocks;
    } catch (error) {
      console.error('Error converting HTML to blocks:', error);
      return [
        {
          type: "paragraph",
          content: "",
        }
      ];
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setBlogPost(prev => ({
          ...prev,
          ogImage: { url: result.url }
        }));
        setImagePreview(result.url);
        toast.success('Image uploaded successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setBlogPost(prev => ({
      ...prev,
      ogImage: { url: '' }
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (title: string) => {
    setBlogPost(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  // Handle editor content change
  const handleEditorChange = async () => {
    if (!mounted || !editor) return;
    
    try {
      const blocks = editor.document;
    //  console.log('Blocks:', blocks);
      const html = await blocksToHTML(blocks);
      setBlogPost(prev => ({
        ...prev,
        content: html,
        blocks: blocks
      }));
    } catch (error) {
      console.error('Error handling editor change:', error);
    }
  };

  // Load existing blog posts
  const loadExistingPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog-posts');
      if (response.ok) {
        const data = await response.json();
       // console.log('Response data:', data);
        const { posts } = data;
        setExistingPosts(posts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  // Load a specific blog post for editing
  const loadBlogPost = async (slug: string) => {
    if (!mounted) {
      toast.error('Editor not ready. Please try again in a moment.');
      return;
    }

    try {
      console.log('Loading blog post:', slug);
      const response = await fetch(`/api/admin/blog-posts/${slug}`);
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const post = await response.json();
        //console.log('Loaded post data:', post);
        
        // Set the basic post data first
        setBlogPost({
          title: post.title,
          description: post.description,
          date: post.date,
          slug: post.slug,
          content: post.content,
          ogImage: post.ogImage || { url: '' },
          blocks: [{ type: "paragraph", content: "" }] // Will be updated below
        });
        
        setEditingPost(slug);
        
        // Set image preview with the loaded image URL
        const imageUrl = post.ogImage?.url || '';
        setImagePreview(imageUrl || null);
        
        // Convert HTML to blocks for the editor
        try {
          const blocks = await htmlToBlocks(post.content || '');
          setBlogPost(prev => ({
            ...prev,
            blocks: blocks
          }));
          
          // Use setTimeout to ensure the editor is ready
          setTimeout(() => {
            editor.replaceBlocks(editor.document, blocks);
          }, 100);
        } catch (error) {
          console.error('Error converting HTML to blocks:', error);
        }
        
        // Switch to editor tab
        setActiveTab('editor');
        
        toast.success('Blog post loaded successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        toast.error(`Failed to load blog post: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast.error('Failed to load blog post');
    }
  };

  // Save blog post
  const saveBlogPost = async () => {
    //console.log('Save button clicked');
    //console.log('Blog post data:', blogPost);
    
    if (!blogPost.title || !blogPost.content) {
      console.log('Validation failed - missing title or content');
      toast.error('Title and content are required');
      return;
    }

    console.log('Starting save process...');
    setIsLoading(true);
    
    try {
      console.log('Making API request...');
      const response = await fetch('/api/admin/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: blogPost.title,
          description: blogPost.description,
          date: blogPost.date,
          slug: blogPost.slug,
          content: blogPost.content,
          ogImage: blogPost.ogImage,
          originalSlug: editingPost
        }),
      });

      //console.log('Response received:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        //console.log('Success response:', result);
        toast.success(editingPost ? 'Blog post updated successfully!' : 'Blog post created successfully!');
        
        // Reset form
        const newBlocks: PartialBlock[] = [
          {
            type: "paragraph",
            content: "",
          }
        ];
        setBlogPost({
          title: '',
          description: '',
          date: new Date().toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }),
          slug: '',
          content: '',
          blocks: newBlocks,
          ogImage: {
            url: 'https://d3kno6bpmj270m.cloudfront.net/shipped/Shipped_Nextjs_Deployment_OG.jpg'
          }
        });
        editor.replaceBlocks(editor.document, newBlocks);
        setEditingPost(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        loadExistingPosts();
      } else {
        const error = await response.json();
        //console.log('Error response:', error);
        toast.error(error.message || 'Failed to save blog post');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to save blog post');
    } finally {
      //console.log('Save process completed');
      setIsLoading(false);
    }
  };

  // Delete blog post
  const deleteBlogPost = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog-posts/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Blog post deleted successfully!');
        loadExistingPosts();
        if (editingPost === slug) {
          setEditingPost(null);
          const newBlocks: PartialBlock[] = [
            {
              type: "paragraph",
              content: "",
            }
          ];
          setBlogPost({
            title: '',
            description: '',
            date: new Date().toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }),
            slug: '',
            content: '',
            blocks: newBlocks,
            ogImage: {
              url: 'https://d3kno6bpmj270m.cloudfront.net/shipped/Shipped_Nextjs_Deployment_OG.jpg'
            }
          });
          editor.replaceBlocks(editor.document, newBlocks);
          setImagePreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } else {
        toast.error('Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  // Create new post
  const createNewPost = () => {
    const newBlocks: PartialBlock[] = [
      {
        type: "paragraph",
        content: "",
      }
    ];
    setBlogPost({
      title: '',
      description: '',
      date: new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      slug: '',
      content: '',
      blocks: newBlocks,
      ogImage: {
        url: 'https://d3kno6bpmj270m.cloudfront.net/shipped/Shipped_Nextjs_Deployment_OG.jpg'
      }
    });
    editor.replaceBlocks(editor.document, newBlocks);
    setEditingPost(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Blog Editor</TabsTrigger>
          <TabsTrigger value="posts">Manage Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingPost ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={blogPost.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter blog post title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    value={blogPost.date}
                    onChange={(e) => setBlogPost(prev => ({ ...prev, date: e.target.value }))}
                    placeholder="e.g., 15 Jan, 2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={blogPost.description}
                  onChange={(e) => setBlogPost(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter blog post description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={blogPost.slug}
                  onChange={(e) => setBlogPost(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="blog-post-slug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featuredImage">Featured Image</Label>
                <div className="space-y-4">
                  {/* Image Preview */}
                  {(imagePreview || blogPost.ogImage?.url) && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || blogPost.ogImage?.url}
                        alt="Featured image preview"
                        className="max-w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="flex items-center gap-2"
                    >
                      {isUploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <span className="text-sm text-gray-500">
                      or enter URL below
                    </span>
                  </div>
                  
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  {/* Manual URL Input */}
                  <div className="space-y-2">
                    <Label htmlFor="ogImageUrl" className="text-sm">Or enter image URL manually</Label>
                    <Input
                      id="ogImageUrl"
                      value={blogPost.ogImage?.url || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const url = e.target.value;
                        setBlogPost(prev => ({ 
                          ...prev, 
                          ogImage: { url } 
                        }));
                        setImagePreview(url || null);
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Upload Guidelines */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Supported formats: JPEG, PNG, WebP, GIF</p>
                    <p>• Maximum file size: 5MB</p>
                    <p>• Recommended dimensions: 1200x630px for optimal social sharing</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <div className="border rounded-md min-h-[400px]">
                  {mounted && (
                    <BlockNoteView
                      editor={editor}
                      onChange={handleEditorChange}
                      theme="light"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={saveBlogPost} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : (editingPost ? 'Update Post' : 'Save Post')}
                </Button>
                {editingPost && (
                  <Button 
                    variant="outline" 
                    onClick={createNewPost}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Post
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Existing Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {existingPosts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No blog posts found</p>
              ) : (
                <div className="space-y-4">
                  {existingPosts && existingPosts.map((post) => (
                    <div
                      key={post.slug}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-gray-600">{post.description}</p>
                        <p className="text-xs text-gray-500">
                          {post.date} • {post.slug}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadBlogPost(post.slug)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteBlogPost(post.slug)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 