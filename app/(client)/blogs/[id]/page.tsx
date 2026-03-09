"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import Image from "next/image";

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt?: string;
  category?: string;
  featuredImage?: string;
  images?: string[];
  views?: number;
}

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = params.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${blogId}`);
        const data = await response.json();
        if (data.success && data.data) {
          setBlog(data.data);
        } else {
          setBlog(null);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setBlog(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  if (isLoading) {
    return (
      <>
        <PageTitle title="Loading..." subtitle="" />
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading blog...</p>
          </div>
        </div>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <PageTitle title="Blog Not Found" subtitle="" />
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">The blog you're looking for doesn't exist.</p>
            <Button variant="outline" asChild>
              <Link href="/blogs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const date = blog.createdAt 
    ? new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <PageTitle title={blog.title} subtitle={`${blog.category || 'Blog'} • ${date}`} />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/blogs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Link>
      </Button>

      <article>
        <div className="mb-6">
          {blog.category && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {blog.category}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold mb-4 text-center">{blog.title}</h1>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{date}</span>
            </div>
            {blog.views !== undefined && (
              <div className="flex items-center gap-1">
                <span>{blog.views} views</span>
              </div>
            )}
          </div>
        </div>

        {blog.featuredImage && (
          <div className="relative h-64 md:h-96 bg-muted rounded-lg mb-8 overflow-hidden">
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <Card>
          <CardContent className="p-8 md:p-12">
            <div
              className="prose prose-lg max-w-none blog-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </CardContent>
        </Card>

        {blog.images && blog.images.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {blog.images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={img}
                    alt={`${blog.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
    
    {/* Custom Styles for Blog Content */}
    <style jsx global>{`
      .blog-content {
        line-height: 1.8;
        color: hsl(var(--foreground));
      }
      .blog-content p {
        margin-bottom: 1.5rem;
        font-size: 1.125rem;
      }
      .blog-content h1,
      .blog-content h2,
      .blog-content h3,
      .blog-content h4,
      .blog-content h5,
      .blog-content h6 {
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-weight: 700;
        line-height: 1.3;
        color: hsl(var(--foreground));
      }
      .blog-content h2 {
        font-size: 2rem;
      }
      .blog-content h3 {
        font-size: 1.5rem;
      }
      .blog-content h4 {
        font-size: 1.25rem;
      }
      .blog-content ul,
      .blog-content ol {
        margin-bottom: 1.5rem;
        padding-left: 2rem;
      }
      .blog-content li {
        margin-bottom: 0.75rem;
        font-size: 1.125rem;
      }
      .blog-content img {
        border-radius: 0.5rem;
        margin: 2rem 0;
        max-width: 100%;
        height: auto;
      }
      .blog-content a {
        color: hsl(var(--primary));
        text-decoration: underline;
      }
      .blog-content a:hover {
        text-decoration: none;
      }
      .blog-content blockquote {
        border-left: 4px solid hsl(var(--primary));
        padding-left: 1.5rem;
        margin: 2rem 0;
        font-style: italic;
        color: hsl(var(--muted-foreground));
      }
      .blog-content strong {
        font-weight: 700;
      }
      .blog-content em {
        font-style: italic;
      }
      .blog-content code {
        background-color: hsl(var(--muted));
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
        font-size: 0.9em;
      }
      .blog-content pre {
        background-color: hsl(var(--muted));
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 1.5rem 0;
      }
      .blog-content hr {
        border: none;
        border-top: 1px solid hsl(var(--border));
        margin: 2rem 0;
      }
    `}</style>
    </>
  );
}

