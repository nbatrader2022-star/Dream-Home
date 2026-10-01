import React, { useState } from 'react';
import { Calendar, Clock, ArrowLeft, X, BookOpen, ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react';
import { BLOG_POSTS_DATA } from '../data/blog';
import { BlogPost } from '../types';

interface BlogSectionProps {
  posts?: BlogPost[];
}

export function BlogSection({ posts = BLOG_POSTS_DATA }: BlogSectionProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'همه مقالات' },
    { id: 'legal', label: 'موارد حقوقی و سند' },
    { id: 'guide', label: 'آموزش و تحویل ملک' },
    { id: 'tax', label: 'مالیات و عوارض' },
    { id: 'invest', label: 'سرمایه‌گذاری و ارزش‌گذاری' },
  ];

  const filteredPosts = posts.filter(
    (post) => activeCategory === 'all' || post.category === activeCategory
  );

  return (
    <section className="bg-[#EDE8E0] py-16 sm:py-20 px-4 sm:px-6 text-right scroll-mt-24" id="blog">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-block w-12 h-1 bg-gradient-to-r from-[#A07830] to-[#E4C675] rounded-full mb-3" />
          <div className="block">
            <span className="inline-block bg-[#C9A84C]/10 text-[#A07830] text-[11px] font-bold tracking-widest px-3.5 py-1 rounded-full border border-[#C9A84C]/25 mb-3">
              پایگاه دانش، آموزش و حقوق املاک
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1A1A2E] mb-3 sm:mb-4">
            مقالات آموزشی و راهنمای حقوقی املاک
          </h2>
          <p className="text-[#5A5A7A] text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            آگاهی از قوانین ثبتی، استعلام ریشه سند، بررسی پایان‌کار و پیشگیری از چالش‌های معامله مسکن لوکس
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1A1A2E] text-[#E4C675] shadow-md'
                    : 'bg-white/80 hover:bg-white text-[#5A5A7A] hover:text-[#1A1A2E] border border-stone-300/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200/80 cursor-pointer flex flex-col group"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1A2E]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-3.5 right-3.5 bg-[#1A1A2E]/85 backdrop-blur-md text-[#E4C675] text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full border border-[#C9A84C]/30 flex items-center gap-1.5">
                  {post.category === 'legal' ? (
                    <Scale className="w-3 h-3 text-[#E4C675]" />
                  ) : post.category === 'tax' ? (
                    <FileText className="w-3 h-3 text-[#E4C675]" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 text-[#E4C675]" />
                  )}
                  <span>{post.categoryFa}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-[#9A9AB0] mb-2.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#C9A84C]" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-black text-base sm:text-lg text-[#1A1A2E] mb-2 leading-snug group-hover:text-[#A07830] transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-[#5A5A7A] leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#C9A84C] group-hover:text-[#A07830]">
                  <span>مطالعه متن کامل مقاله و نکات حقوقی</span>
                  <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Blog Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-[#F8F4EF] text-[#1A1A2E] w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/20 relative">
            <div className="bg-[#1A1A2E] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#E4C675]">
                <BookOpen className="w-4 h-4" />
                <span>پایگاه دانش حقوقی و ملکی خانه آرمانی</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="بستن"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-5 sm:p-8 overflow-y-auto">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-52 sm:h-72 object-cover rounded-2xl mb-5 shadow-md"
              />

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#5A5A7A] mb-3">
                <span className="bg-[#C9A84C]/15 text-[#A07830] font-bold px-2.5 py-0.5 rounded-full">
                  {selectedPost.categoryFa}
                </span>
                <span>نویسنده: {selectedPost.author}</span>
                <span>•</span>
                <span>{selectedPost.date}</span>
                <span>•</span>
                <span>زمان مطالعه: {selectedPost.readTime}</span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1A1A2E] mb-5 leading-relaxed">
                {selectedPost.title}
              </h1>

              <div className="text-xs sm:text-sm text-[#3A3A4E] leading-loose space-y-4 whitespace-pre-line border-t border-stone-200 pt-5">
                {selectedPost.content}
              </div>

              {/* Legal Notice Note */}
              <div className="mt-6 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#1A1A2E]">
                <CheckCircle2 className="w-4 h-4 text-[#A07830] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  تمامی مفاد و نکات حقوقی فوق بر اساس آخرین قوانین سازمان ثبت اسناد و املاک کشور، قانون مدنی و بخشنامه‌های شهرداری تدوین شده و تحت نظارت وکلای پایه یک دادگستری در مجموعه خانه آرمانی بررسی و به‌روزرسانی می‌شوند.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="bg-[#1A1A2E] text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-[#0F3460] transition-colors cursor-pointer"
                >
                  بستن مقاله
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
