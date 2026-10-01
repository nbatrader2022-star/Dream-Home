import { getSupabaseClient } from '../lib/supabase';
import { BlogPost } from '../types';
import { BLOG_POSTS_DATA } from '../data/blog';

export function dbToBlogPost(row: any): BlogPost {
  return {
    id: String(row.id),
    title: row.title || '',
    slug: row.slug || `post-${row.id}`,
    category: row.category || 'guide',
    categoryFa: row.category_fa || row.categoryFa || 'راهنمای خرید',
    date: row.date || 'امروز',
    readTime: row.read_time || row.readTime || '۵ دقیقه',
    author: row.author || 'تیم تحریریه خانه آرمانی',
    image: row.image || '',
    excerpt: row.excerpt || '',
    content: row.content || '',
  };
}

export function blogPostToDb(post: Partial<BlogPost>): any {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    category_fa: post.categoryFa,
    date: post.date,
    read_time: post.readTime,
    author: post.author,
    image: post.image,
    excerpt: post.excerpt,
    content: post.content,
    published: true,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetch all published blog posts
 */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(dbToBlogPost);
      }
    } catch (err) {
      console.warn('Supabase blog_posts fetch note:', err);
    }
  }

  // Fallback to initial articles
  return BLOG_POSTS_DATA;
}

/**
 * Save / update blog post (Super Admin only)
 */
export async function saveBlogPost(
  post: BlogPost,
  authToken?: string | null
): Promise<BlogPost> {
  const supabase = getSupabaseClient();
  const dbPayload = blogPostToDb(post);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .upsert(dbPayload)
        .select()
        .single();

      if (!error && data) {
        return dbToBlogPost(data);
      }
    } catch (err) {
      console.warn('Direct blog_posts save note:', err);
    }
  }

  return post;
}

/**
 * Delete blog post (Super Admin only)
 */
export async function deleteBlogPost(
  id: string,
  authToken?: string | null
): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase blog_posts delete note:', err);
    }
  }
}
