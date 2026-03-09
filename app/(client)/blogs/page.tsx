"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import { PageTitle } from "@/components/page-title";

interface Blog {
  _id: string;
  title: string;
  excerpt?: string;
  author: string;
  createdAt?: string;
  featuredImage?: string;
  category?: string;
  views?: number;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs?status=Published');
        const data = await response.json();
        if (data.success && data.data) {
          setBlogs(Array.isArray(data.data) ? data.data : []);
        } else {
          setBlogs([]);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      <PageTitle 
        title="Blogs & Articles"
        subtitle="Stay Informed"
        description="Stay updated with Powai real-estate intel, guides, and market stories."
      />
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blogs found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => {
              const date = blog.createdAt 
                ? new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
              
              return (
                <Card key={blog._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-muted">
                    {blog.featuredImage ? (
                      <Image
                        src={blog.featuredImage}
                        alt={blog.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <CardContent className="p-6">
                    {blog.category && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {blog.category}
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
                    {blog.excerpt && (
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{blog.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{date}</span>
                      </div>
                    </div>
                    <Link
                      href={`/blogs/${blog._id}`}
                      className="flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      Read More
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

