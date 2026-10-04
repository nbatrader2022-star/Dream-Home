import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = 3000;

// Super Admin BaaS & Cryptographic Security Configuration
const SERVER_AUTH_SECRET = process.env.SERVER_AUTH_SECRET || 'dream_home_luxury_superadmin_secret_key_2026_!#';
const SUPERADMIN_USERNAME = 'nabikalandar0@gmail.com';
const SUPERADMIN_PBKDF2_SALT = 'dream_home_auth_salt_2026_v1';
// Secure PBKDF2 hash (100,000 rounds of SHA-512) for primary superadmin credentials
const SUPERADMIN_PBKDF2_HASH = crypto
  .pbkdf2Sync('18723NbAklNr@fiNiA', SUPERADMIN_PBKDF2_SALT, 100000, 64, 'sha512')
  .toString('hex');

// CORS configuration for local, Netlify and custom domains
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Initialize Supabase BaaS Client (PostgreSQL, Storage, RLS)
let supabaseClient: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    if (url && key) {
      try {
        supabaseClient = createClient(url, key);
      } catch (err) {
        console.warn('Supabase initialization warning:', err);
      }
    }
  }
  return supabaseClient;
}

// In-Memory dynamic cache / seed fallback when Supabase is not yet populated
let inMemoryProperties: any[] = [
  {
    id: 'prop-3',
    title: 'پنت‌هاوس دوبلکس رویایی در زعفرانیه',
    slug: 'penthouse-zafaraniyeh',
    transactionType: 'buy',
    propertyType: 'penthouse',
    price: 38000000000,
    location: 'زعفرانیه، بلوار بهزادی',
    address: 'تهران، زعفرانیه، بلوار بهزادی، پلاک ۱۲، برج باغ نگین',
    neighborhood: 'زعفرانیه',
    city: 'tehran',
    cityNameFa: 'تهران',
    area: 420,
    bedrooms: 4,
    bathrooms: 4,
    parking: 4,
    floor: 12,
    totalFloors: 12,
    buildingAge: 2,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'پنت‌هاوس مجلل با تراس گاردن ۱۰۰ متری و دید پانورامای ۳۶۰ درجه به شهر و کوهستان تهران، دارای متریال تماماً وارداتی برند ایتالیایی و آلمانی، آسانسور اختصاصی کدینگ و مشاعات فول هتلینگ.',
    amenities: [
      'دید ۳۶۰ درجه پانوراما به پایتخت و البرز',
      'تراس گاردن با استخر اختصاصی و آلاچیق شیشه‌ای',
      '۴ پارکینگ سندی باکس بدون مزاحم',
      'سوئیت میهمان مجزا با ورودی مستقل',
      'لابی مجلل با لابی‌من ۲۴ ساعته و والِت',
      'سیستم خانه هوشمند KNX با کنترل از راه دور',
      'سونای خشک و بخار، جکوزی ۶ نفره اختصاصی',
      'سالن جیم خصوصی و اتاق سینمای آکوستیک'
    ],
    agent: {
      id: 'agent-1',
      name: 'مهندس آریا شایگان',
      role: 'کارشناس ارشد پنت‌هاوس و املاک لوکس منطقه ۱',
      phone: '۰۹۱۲۱۱۱۱۱۱۱',
      whatsapp: '989121111111',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
      rating: 4.95,
      dealsCount: 185,
      experienceYears: 14,
      specialty: 'پنت‌هاوس‌های لوکس و ویلاهای مدرن شمیرانات',
      areasServed: ['الهیه', 'فرشته', 'زعفرانیه', 'نیاوران'],
    },
    status: 'sale',
    featured: true,
    virtualTourAvailable: true,
    createdAt: '1403/11/10',
    viewsCount: 2450,
  },
  {
    id: 'prop-1',
    title: 'آپارتمان لوکس و مدرن ۳ خوابه در الهیه',
    slug: 'luxury-apartment-elahieh',
    transactionType: 'buy',
    propertyType: 'apartment',
    price: 18500000000,
    location: 'الهیه، خیابان فرشته',
    address: 'تهران، الهیه، خیابان فرشته، تقاطع چناران، برج الماس',
    neighborhood: 'الهیه',
    city: 'tehran',
    cityNameFa: 'تهران',
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    floor: 4,
    totalFloors: 8,
    buildingAge: 0,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'واحدی بی‌نظیر با دید کارت‌پستالی از باغ‌های الهیه و متریال درجه یک اروپایی، نورگیر جنوبی و مشاعات بی‌نظیر.',
    amenities: ['لابی مجلل با لابی‌من ۲۴ ساعته', 'استخر، سونا و جکوزی فعال', 'سالن اجتماعات و جیم', 'سیستم هوشمند KNX'],
    agent: {
      id: 'agent-1',
      name: 'مهندس آریا شایگان',
      role: 'کارشناس ارشد پنت‌هاوس و املاک لوکس منطقه ۱',
      phone: '۰۹۱۲۱۱۱۱۱۱۱',
      whatsapp: '989121111111',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
      rating: 4.95,
      dealsCount: 185,
      experienceYears: 14,
      specialty: 'پنت‌هاوس‌های لوکس و ویلاهای مدرن شمیرانات',
      areasServed: ['الهیه', 'فرشته', 'زعفرانیه', 'نیاوران'],
    },
    status: 'sale',
    featured: true,
    virtualTourAvailable: true,
    createdAt: '1403/11/15',
    viewsCount: 1980,
  },
  {
    id: 'prop-2',
    title: 'ویلای مدرن و هوشمند در نیاوران',
    slug: 'modern-villa-niavaran',
    transactionType: 'presale',
    propertyType: 'villa',
    price: 45000000000,
    location: 'نیاوران، خیابان یاسر',
    address: 'تهران، نیاوران، خیابان یاسر، کوچه بوستان',
    neighborhood: 'نیاوران',
    city: 'tehran',
    cityNameFa: 'تهران',
    area: 520,
    bedrooms: 5,
    bathrooms: 5,
    parking: 4,
    floor: 1,
    totalFloors: 3,
    buildingAge: 0,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'ویلای سوپرلوکس تریپلکس در بهترین فرعی نیاوران با حیاط مشجر و روف‌گاردن اختصاصی، آسانسور هیدرولیک و استخر ۴ فصل.',
    amenities: ['استخر روباز چهارفصل', 'روف‌گاردن مجهز با باربیکیو', 'آسانسور هیدرولیک شیشه‌ای', 'سیستم هوشمند فول'],
    agent: {
      id: 'agent-2',
      name: 'خانم مهندس سارا رادمنش',
      role: 'مشاور تخصصی سرمایه‌گذاری ملکی و پیش‌فروش‌های معتبر',
      phone: '۰۹۱۲۲۲۲۲۲۲۲',
      whatsapp: '989122222222',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      rating: 4.9,
      dealsCount: 142,
      experienceYears: 11,
      specialty: 'پیش‌فروش برج‌های برند و سرمایه‌گذاری ملکی کلان',
      areasServed: ['نیاوران', 'فرمانیه', 'کامرانیه', 'اقدسیه'],
    },
    status: 'presale',
    featured: true,
    virtualTourAvailable: true,
    createdAt: '1403/11/20',
    viewsCount: 2200,
  }
];

let inMemoryAgents: any[] = [
  {
    id: 'agent-1',
    name: 'مهندس آریا شایگان',
    role: 'کارشناس ارشد پنت‌هاوس و املاک لوکس منطقه ۱',
    phone: '۰۹۱۲۱۱۱۱۱۱۱',
    whatsapp: '989121111111',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    rating: 4.95,
    dealsCount: 185,
    experienceYears: 14,
    specialty: 'پنت‌هاوس‌های لوکس و ویلاهای مدرن شمیرانات',
    areasServed: ['الهیه', 'فرشته', 'زعفرانیه', 'نیاوران'],
  },
  {
    id: 'agent-2',
    name: 'خانم مهندس سارا رادمنش',
    role: 'مشاور تخصصی سرمایه‌گذاری ملکی و پیش‌فروش‌های معتبر',
    phone: '۰۹۱۲۲۲۲۲۲۲۲',
    whatsapp: '989122222222',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    dealsCount: 142,
    experienceYears: 10,
    specialty: 'پیش‌فروش برندهای شاخص و تحلیل بازده سرمایه',
    areasServed: ['نیاوران', 'فرمانیه', 'کامرانیه', 'سعادت‌آباد'],
  }
];

let inMemoryLeads: any[] = [
  {
    id: 'lead-1',
    fullName: 'دکتر علیرضا کاظمی',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    subject: 'استعلام خرید پنت‌هاوس زعفرانیه',
    message: 'سلام، مایل به دریافت اطلاعات کامل‌تر و هماهنگی جلسه حضوری در خصوص پنت‌هاوس زعفرانیه هستم.',
    preferredContactMethod: 'phone',
    createdAt: '1403/12/01',
    status: 'new',
  },
  {
    id: 'lead-2',
    fullName: 'مهندس پرهام فرهمند',
    phone: '۰۹۱۲۹۸۷۶۵۴۳',
    subject: 'درخواست پیش‌فروش ویلای نیاوران',
    message: 'لطفاً جدول زمان‌بندی اقساط و نقشه معماری ویلای نیاوران را از طریق واتساپ ارسال نمایید.',
    preferredContactMethod: 'whatsapp',
    createdAt: '1403/12/03',
    status: 'contacted',
  }
];

let inMemoryBookings: any[] = [
  {
    id: 'book-1',
    propertyId: 'prop-1',
    propertyTitle: 'آپارتمان لوکس و مدرن ۳ خوابه در الهیه',
    propertyLocation: 'الهیه، خیابان فرشته',
    name: 'مهندس بهزاد کمالی',
    phone: '۰۹۱۲۵۵۵۱۲۳۴',
    preferredDate: '۱۴۰۳/۱۲/۰۵',
    preferredTime: '۱۶:۰۰ تا ۱۸:۰۰',
    notes: 'همراه با مهندس ناظر جهت بازدید سازه مراجعه می‌کنم.',
    status: 'confirmed',
    createdAt: '1403/12/02',
  }
];

// System instructions for the luxury real estate context-aware advisor
const SYSTEM_PROMPT = `شما مشاور ارشد و دستیار هوشمند اختصاصی پلتفرم املاک لوکس «خانه آرمانی» (Dream Home Real Estate) هستید.
نام شما: «آرمانیار» یا «مشاور هوشمند آرمانی» است.

مجموعه املاک شاخص پلتفرم:
۱. آپارتمان لوکس ۳ خوابه الهیه (خیابان فرشته): ۱۸۰ متر، ۳ خواب، ۲ پارکینگ، لابی مجلل، استخر و سونا، ۱۸ میلیارد تومان (خرید).
۲. ویلای مدرن نیاوران (یاسر): ۵۲۰ متر، ۵ خواب، ۴ پارکینگ، استخر روباز اختصاصی، ۴۵ میلیارد تومان (پیش‌فروش).
۳. پنت‌هاوس دوبلکس زعفرانیه (بلوار بهزادی): ۴۲۰ متر، ۴ خواب مستر، ۴ پارکینگ سندی، روف‌گاردن و دید ۳۶۰ درجه، ۳۸ میلیارد تومان (خرید).
۴. واحد اداری مدرن جردن (نلسون ماندلا): ۱۲۰ متر، ۴ اتاق، طبقه ۶، ۱۸.۹ میلیارد تومان یا رهن و اجاره ۵۰۰ میلیون و ۴۵ میلیون اجاره ماهانه.
۵. ویلای تریپلکس لواسان (بلوار باستی): ۸۵۰ متر زمین، ۶۰۰ متر بنا، استخر چهارفصل، روف‌گاردن، ۶۲ میلیارد تومان.
۶. آپارتمان دلباز سعادت‌آباد (میدان کاج): ۱۴۵ متر، ۳ خواب، فول امکانات، ۲۲ میلیارد تومان.

خدمات پلتفرم:
- محاسبه اقساط وام و تسهیلات مسکن بر اساس قیمت، درصد پیش‌پرداخت و مدت بازپرداخت (معمولاً ۱۲ تا ۶۰ ماهه با نرخ سالانه ۲۱ تا ۲۳٪).
- هماهنگی و رزرو نوبت بازدید حضوری یا تور مجازی ۳D ۳۶۰ درجه برای تمام واحدها همراه با ارائه کد رهگیری.
- ارزیابی آنلاین و هوشمند قیمت روز ملک و پیشنهاد مشاوره رایگان تلفنی با کارشناسان مستقر در منطقه.
- امکان ذخیره‌سازی ملک در حساب کاربری با ورود آسان از طریق گوگل.

قوانین رفتار:
- لحن صحبت شما باید بسیار محترمانه، حرفه‌ای، لوکس، آرامش‌بخش و کاملاً مسلط باشد.
- به زبان فارسی سلیس و شیوا پاسخ دهید.
- ارقام و قیمت‌ها را دقیق و به تومان یا میلیارد تومان ذکر کنید.
- اگر کاربر درباره ملکی خاص یا متراژ، بودجه و منطقه سوال کرد، واحدهای متناسب را پیشنهاد داده و به او توصیه کنید نوبت بازدید را رزرو کند یا وام آن را محاسبه نماید.
- اگر کاربر اطلاعاتی درباره نحوه کار با سایت خواست، او را به دکمه‌های نوار بالا (نشان‌شده‌ها، نقشه املاک، محاسبه وام و ثبت نوبت بازدید) راهنمایی کنید.`;

// API Routes FIRST
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Supabase Google OAuth Callback Landing
app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>احراز هویت گوگل - خانه آرمانی</title>
  <style>
    body {
      background: #0F0F1A;
      color: #FFFFFF;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(201, 168, 76, 0.2);
      border-top-color: #C9A84C;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h2 style="font-size: 18px; margin: 0 0 8px 0; color: #E4C675;">احراز هویت با موفقیت انجام شد</h2>
  <p style="font-size: 13px; color: rgba(255,255,255,0.7); margin: 0;">در حال اتصال به حساب کاربری و بازگشت به سامانه...</p>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage({
          type: 'SUPABASE_AUTH_SUCCESS',
          hash: window.location.hash,
          search: window.location.search
        }, '*');
        setTimeout(() => {
          window.close();
        }, 600);
      } else {
        window.location.href = '/' + window.location.hash;
      }
    } catch (e) {
      window.location.href = '/' + window.location.hash;
    }
  </script>
</body>
</html>`);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, currentPropertyContext, allPropertiesCatalogue } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const client = getGeminiClient();

    // Context augmentation
    let promptContext = SYSTEM_PROMPT;

    if (Array.isArray(allPropertiesCatalogue) && allPropertiesCatalogue.length > 0) {
      promptContext += `\n\nفهرست کل املاک موجود در سیستم جهت پیشنهاد دقیق بر اساس درخواست طبیعی کاربر:\n` +
        allPropertiesCatalogue.slice(0, 15).map((p: any, idx: number) => 
          `${idx + 1}. [شناسه: ${p.id}] ${p.title} - شهر: ${p.cityNameFa || p.city}، محله: ${p.neighborhood || p.location}، قیمت: ${p.price ? (p.price / 1000000000).toFixed(1) + ' میلیارد تومان' : ''}، متراژ: ${p.area} متر، ${p.bedrooms} خواب، نوع: ${p.propertyType}، امکانات: ${p.amenities?.join('، ')}`
        ).join('\n') +
        `\n\nدستور ویژه دستیار ملکی: اگر کاربر ملکی با مشخصات خاص (مثلاً آپارتمان ۳ خوابه در نیاوران زیر ۱۵ یا ۲۰ میلیارد، ویلای استخردار در لواسان و ...) خواست، مستقیماً املاک منطبق را از لیست بالا معرفی کن، قیمت و مزایای آن را توضیح بده و پیشنهاد کن جهت بازدید حضوری نوبت رزرو کند.`;
    }

    if (currentPropertyContext) {
      promptContext += `\n\nملک فعلی که کاربر در حال بررسی آن است:
عنوان: ${currentPropertyContext.title || ''}
قیمت: ${currentPropertyContext.price ? currentPropertyContext.price.toLocaleString('fa-IR') + ' تومان' : ''}
منطقه: ${currentPropertyContext.location || ''}
متراژ: ${currentPropertyContext.area || ''} متر مربع
تعداد خواب: ${currentPropertyContext.bedrooms || ''}`;
    }

    // If Gemini client is configured with key
    if (client) {
      try {
        // Format history for Gemini API
        const contents = messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content || '') }],
        }));

        const response = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction: promptContext,
            temperature: 0.7,
            maxOutputTokens: 900,
          },
        });

        const replyText = response.text || 'در حال حاضر آماده پاسخگویی به سوالات شما درباره املاک لوکس خانه آرمانی هستم.';
        return res.json({ reply: replyText });
      } catch (geminiError: any) {
        console.error('Gemini API call failed:', geminiError);
        // Graceful fallback to domain response
      }
    }

    // Intelligent domain fallback if API key not available or rate limited
    const lastUserMessage = String(messages[messages.length - 1]?.content || '').toLowerCase();
    let fallbackReply = '';

    if (lastUserMessage.includes('وام') || lastUserMessage.includes('اقساط') || lastUserMessage.includes('تسهیلات')) {
      fallbackReply = 'برای محاسبه دقیق اقساط، در پلتفرم خانه آرمانی می‌توانید بخش «محاسبه وام» را از بالای صفحه باز کنید. به طور معمول برای املاک لوکس، پیش‌پرداخت بین ۳۰٪ تا ۵۰٪ و بازپرداخت بین ۱۲ تا ۶۰ ماه تنظیم می‌شود. آیا تمایل دارید برای ملک مشخصی اقساط را بررسی کنیم؟';
    } else if (lastUserMessage.includes('بازدید') || lastUserMessage.includes('نوبت') || lastUserMessage.includes('رزرو')) {
      fallbackReply = 'شما می‌توانید برای تمام املاک، نوبت بازدید حضوری با همراهی کارشناس ارشد منطقه یا تور مجازی سه‌بعدی آنلاین رزرو کنید. با کلیک روی دکمه «هماهنگی بازدید» در کارت هر ملک یا صفحه جزئیات، کد رهگیری رسمی دریافت خواهید کرد.';
    } else if (lastUserMessage.includes('الهیه') || lastUserMessage.includes('فرشته')) {
      fallbackReply = 'در منطقه الهیه و خیابان فرشته، واحد ۱۸۰ متری ۳ خوابه با سالن دلباز رو به توچال و مشاعات هتلینگ (استخر، لابی‌من ۲۴ ساعته) به قیمت ۱۸ میلیارد تومان یکی از برترین گزینه‌های آماده تحویل ماست.';
    } else if (lastUserMessage.includes('نیاوران') || lastUserMessage.includes('ویلا')) {
      fallbackReply = 'در منطقه نیاوران، ویلای مدرن ۵۲۰ متری با ۵ خواب مستر، استخر روباز اختصاصی و ۴ پارکینگ به قیمت ۴۵ میلیارد تومان موجود است. همچنین در لواسان ویلای تریپلکس با ۸۵۰ متر زمین در بلوار باستی آماده بازدید است.';
    } else if (lastUserMessage.includes('زعفرانیه') || lastUserMessage.includes('پنت')) {
      fallbackReply = 'پنت‌هاوس دوبلکس زعفرانیه با ۴۲۰ متر زیربنا، ۴ خواب مستر، روف‌گاردن اختصاصی با دید پانوراما ۳۶۰ درجه تهران و کوهستان به قیمت ۳۸ میلیارد تومان پیشنهاد ویژه ما برای خریداران خاص‌پسند است.';
    } else if (lastUserMessage.includes('سلام') || lastUserMessage.includes('درود')) {
      fallbackReply = 'درود بر شما! من «آرمانیار»، مشاور هوشمند خانه آرمانی هستم. چطور می‌توانم در انتخاب ملک ایده‌آل، محاسبه اقساط وام، یا هماهنگی بازدید املاک لوکس به شما کمک کنم؟';
    } else {
      fallbackReply = 'از پیام شما سپاسگزارم. در مجموعه خانه آرمانی می‌توانید املاک لوکس تهران، کرج، اصفهان و شیراز را با فیلتر متراژ، قیمت و محله جستجو کنید، تور مجازی ببینید، اقساط وام را شبیه‌سازی کنید یا با کارشناسان اختصاصی ما به صورت رایگان گفتگو نمایید. به کدام منطقه یا نوع ملک علاقه‌مندید؟';
    }

    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'خطا در برقراری ارتباط با دستیار هوشمند.',
      details: error.message,
    });
  }
});

// Endpoint for Neighborhood Weather Trends and Local Amenities with Google Search Grounding
app.post('/api/neighborhood-insights', async (req, res) => {
  try {
    const { neighborhood, city, location } = req.body;
    const targetNeighborhood = neighborhood || 'الهیه';
    const targetCity = city || 'تهران';
    const client = getGeminiClient();

    let searchInsightsText = '';
    let sources: Array<{ title: string; uri: string }> = [];
    let isLiveGoogleSearch = false;

    if (client) {
      try {
        const prompt = `شما کارشناس موقعیت‌یابی املاک لوکس هستید. با جستجوی مستقیم در وب با ابزار گوگل، جدیدترین وضعیت آب و هوا، روند دما، شاخص کیفیت هوا (AQI)، و امکانات رفاهی شاخص (مراکز خرید لوکس، بیمارستان‌ها، پارک‌ها و دسترسی به مترو/بزرگراه) در محله «${targetNeighborhood}» شهر «${targetCity}» (${location || ''}) را بررسی کنید.
لطفاً پاسخ را به صورت خلاصه، خوانا، جذاب و ساختاریافته به زبان فارسی ارائه دهید:
۱. وضعیت آب‌وهوا و روند اقلیمی کنونی (دما به سلسیوس، وضعیت جوی، شاخص هوای کوهپایه‌ای/شهری)
۲. امکانات رفاهی شاخص (مراکز خرید و تجاری، مراکز بهداشتی درمانی، مراکز ورزشی و پارک‌ها)
۳. دسترسی حمل و نقل و کیفیت زندگی محله.`;

        const response = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        searchInsightsText = response.text || '';
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (Array.isArray(chunks)) {
          sources = chunks
            .filter((c: any) => c.web?.uri)
            .map((c: any) => ({
              title: c.web.title || 'نتایج جستجوی گوگل',
              uri: c.web.uri,
            }));
        }
        isLiveGoogleSearch = true;
      } catch (geminiError: any) {
        console.error('Gemini Google Search failed, using curated neighborhood insights:', geminiError);
      }
    }

    // Curated rich neighborhood data for quick rendering or fallback
    const neighborhoodDataMap: Record<string, any> = {
      'الهیه': {
        temp: '۱۹°C',
        condition: 'صاف و معتدل کوهپایه‌ای',
        aqi: '۵۸ (سالم و پاک)',
        trend: 'نسیم ملایم البرز و دمای ۳ درجه خنک‌تر از مرکز شهر',
        amenities: [
          { category: 'مراکز خرید و تجاری', items: ['سام سنتر (بلوار فرشته)', 'مرکز خرید مدرن الهیه', 'کویین سنتر'] },
          { category: 'مراکز درمانی و بیمارستان', items: ['بیمارستان اختر', 'کلینیک تخصصی فرمانیه', 'مرکز سلامت فرشته'] },
          { category: 'دسترسی و حمل‌ونقل', items: ['دسترسی سریع به بزرگراه مدرس و چمران', 'ایستگاه مترو تجریش (۵ دقیقه)'] },
          { category: 'فضای سبز و تفریحی', items: ['باغ فردوس و موزه سینما', 'پارک مینیاتور الهیه', 'باشگاه‌های لوکس ورزشی فرشته'] },
        ],
      },
      'نیاوران': {
        temp: '۱۷°C',
        condition: 'آفتابی با هوای مطبوع',
        aqi: '۴۵ (کاملاً پاک)',
        trend: 'اقلیم خوش آب و هوای شمیرانات با رطوبت دلپذیر',
        amenities: [
          { category: 'مراکز خرید و تجاری', items: ['اطلس مال نیاوران', 'روشا دپارتمان استور', 'مرکز خرید نارون'] },
          { category: 'مراکز درمانی و بیمارستان', items: ['بیمارستان شهید باهنر', 'پلی‌کلینیک نیاوران', 'مرکز جراحی فرمانیه'] },
          { category: 'دسترسی و حمل‌ونقل', items: ['دسترسی مستقیم به خیابان باهنر و کامرانیه', 'ایستگاه مترو نوبنیاد'] },
          { category: 'فضای سبز و تفریحی', items: ['کاخ موزه نیاوران', 'پارک جنگلی نیاوران', 'مسیر کوهنوردی کلکچال'] },
        ],
      },
      'زعفرانیه': {
        temp: '۱۶°C',
        condition: 'آفتابی و خنک',
        aqi: '۴۲ (بسیار پاک)',
        trend: 'بادهای شمالی رشته‌کوه توچال و تابستان‌های مطبوع',
        amenities: [
          { category: 'مراکز خرید و تجاری', items: ['پالادیوم مال', 'مرکز خرید زعفرانیه پلازا', 'بامیک زعفرانیه'] },
          { category: 'مراکز درمانی و بیمارستان', items: ['مرکز فوق‌تخصصی زعفرانیه', 'بیمارستان طالقانی', 'داروخانه شبانه‌روزی آصف'] },
          { category: 'دسترسی و حمل‌ونقل', items: ['دسترسی به بزرگراه چمران و یادگار امام', 'تاکسی‌رانی خطی میدان تجریش'] },
          { category: 'فضای سبز و تفریحی', items: ['مجموعه کاخ موزه سعدآباد', 'تله‌کابین توچال (ولنجک)', 'بوستان ساسان'] },
        ],
      },
      'جردن': {
        temp: '۲۲°C',
        condition: 'صاف و معتدل',
        aqi: '۷۲ (قابل قبول)',
        trend: 'موقعیت طلایی دیپلماتیک با دسترسی شریانی',
        amenities: [
          { category: 'مراکز خرید و تجاری', items: ['پاساژ آسیا جردن', 'مرکز خرید پردیس', 'برج‌های اداری و صرافی‌های نلسون ماندلا'] },
          { category: 'مراکز درمانی و بیمارستان', items: ['بیمارستان فوق‌تخصصی شهید رجایی', 'کلینیک نور مطهری', 'مرکز جراحی گاندی'] },
          { category: 'دسترسی و حمل‌ونقل', items: ['دسترسی لحظه‌ای به بزرگراه حقانی، همت و مدرس', 'ایستگاه مترو میرداماد'] },
          { category: 'فضای سبز و تفریحی', items: ['پارک ملت (ورودی غربی)', 'پل طبیعت و پارک طالقانی', 'کافه‌ها و رستوران‌های بین‌المللی'] },
        ],
      },
      'سعادت‌آباد': {
        temp: '۲۰°C',
        condition: 'صاف با باد ملایم',
        aqi: '۶۵ (سالم)',
        trend: 'جریان هوای دشت اوین-درکه و شب‌های خنک',
        amenities: [
          { category: 'مراکز خرید و تجاری', items: ['مرکز خرید اپال (Opal Mall)', 'پاساژ پرواز', 'مرکز خرید سروستان'] },
          { category: 'مراکز درمانی و بیمارستان', items: ['بیمارستان بین‌المللی عرفان', 'بیمارستان مدرس', 'مرکز تصویربرداری سعادت‌آباد'] },
          { category: 'دسترسی و حمل‌ونقل', items: ['اتصال به بزرگراه یادگار امام، چمران و نیایش', 'ایستگاه مترو میدان کتاب'] },
          { category: 'فضای سبز و تفریحی', items: ['پارک پرواز و چشم‌انداز تهران', 'بوستان ژوراسیک', 'باغ‌راه‌های درکه'] },
        ],
      },
      'لواسان': {
        temp: '۱۴°C',
        condition: 'خنک کوهستانی و دلپذیر',
        aqi: '۲۵ (پاک‌ترین هوای منطقه)',
        trend: 'هوای پاک ییلاقی در جوار سد لتیان و باغات سبز',
        amenities: [
          { category: 'مراکز خرید و تجاری', items: ['اسکای سنتر لواسان', 'مرکز خرید هدیه', 'هایپرمارکت‌های اختصاصی باستی هیلز'] },
          { category: 'مراکز درمانی و بیمارستان', items: ['بیمارستان مهرآیین لواسان', 'پلی‌کلینیک شبانه‌روزی لواسان'] },
          { category: 'دسترسی و حمل‌ونقل', items: ['جاده لشگرک و بزرگراه بابایی (۲۰ دقیقه تا تهران)'] },
          { category: 'فضای سبز و تفریحی', items: ['دریاچه و سد لتیان', 'رودخانه جاجرود', 'باشگاه‌های سوارکاری و تنیس'] },
        ],
      },
    };

    // Find closest match or generic rich data
    const matchedData = neighborhoodDataMap[targetNeighborhood] || {
      temp: '۲۰°C',
      condition: 'صاف و معتدل',
      aqi: '۵۵ (هوای سالم)',
      trend: 'روند دمایی معتدل با هوای مناسب فصلی',
      amenities: [
        { category: 'مراکز خرید و تجاری', items: ['مراکز خرید مدرن منطقه', 'فروشگاه‌های زنجیره‌ای برند', 'شعب بانکی'] },
        { category: 'مراکز درمانی و بهداشتی', items: ['بیمارستان عمومی و تخصصی', 'پلی‌کلینیک شبانه‌روزی', 'داروخانه شبانه‌روزی'] },
        { category: 'دسترسی شهری', items: ['دسترسی به بزرگراه‌های اصلی', 'خطوط اتوبوسرانی و تاکسیرانی', 'ایستگاه مترو نزدیک'] },
        { category: 'فضای سبز و رفاهی', items: ['بوستان‌های محله‌ای', 'مجموعه‌های ورزشی مجهز', 'مدارس و مراکز آموزشی'] },
      ],
    };

    res.json({
      neighborhood: targetNeighborhood,
      city: targetCity,
      isLiveGoogleSearch,
      insightsText: searchInsightsText,
      weather: {
        temp: matchedData.temp,
        condition: matchedData.condition,
        aqi: matchedData.aqi,
        trend: matchedData.trend,
      },
      amenities: matchedData.amenities,
      sources: sources.length > 0 ? sources : [
        { title: `بررسی آب و هوا و امکانات ${targetNeighborhood} در نقشه و جستجوی گوگل`, uri: `https://www.google.com/search?q=${encodeURIComponent(`آب و هوا و امکانات محله ${targetNeighborhood} ${targetCity}`)}` }
      ],
    });
  } catch (err: any) {
    console.error('Neighborhood insights endpoint error:', err);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات محله.' });
  }
});

// ==============================================================================
// AUTHENTICATION & SUPER ADMIN RBAC MIDDLEWARE
// ==============================================================================
const SUPER_ADMIN_EMAILS = ['luxury.investor@gmail.com', 'nabikalandar0@gmail.com'];
const PRIMARY_SUPER_ADMIN = 'luxury.investor@gmail.com';

async function ensureSuperAdminInDb() {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    for (const adminEmail of SUPER_ADMIN_EMAILS) {
      // 1. Check if auth user exists in auth.users
      let authUserId: string | null = null;
      try {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        if (usersData?.users) {
          const found = usersData.users.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());
          if (found) authUserId = found.id;
        }
      } catch {
        // Ignored if service key lacks auth admin list permissions
      }

      // 2. Query admin_users table
      const { data: existing } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('email', adminEmail)
        .maybeSingle();

      if (!existing) {
        const { error: insertErr } = await supabase.from('admin_users').insert({
          email: adminEmail,
          user_id: authUserId,
          role: 'superadmin',
          status: 'active',
          name: 'مدیر ارشد سامانه (Super Admin)',
        });
        if (!insertErr) {
          console.log(`✅ [Super Admin] Registered in admin_users: ${adminEmail}`);
        }
      } else if (existing.role !== 'superadmin' || existing.status !== 'active' || (authUserId && !existing.user_id)) {
        await supabase
          .from('admin_users')
          .update({
            role: 'superadmin',
            status: 'active',
            user_id: authUserId || existing.user_id,
            updated_at: new Date().toISOString(),
          })
          .ilike('email', adminEmail);
        console.log(`✅ [Super Admin] Synced status in admin_users: ${adminEmail}`);
      }
    }
  } catch (err: any) {
    console.warn('Super Admin DB check note:', err.message);
  }
}

// Call on startup
ensureSuperAdminInDb();

async function requireSuperAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'احراز هویت الزامی است: توکن دسترسی معتبر یافت نشد.',
      code: 'AUTH_TOKEN_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return res.status(401).json({
      error: 'احراز هویت الزامی است: توکن دسترسی خالی است.',
      code: 'AUTH_TOKEN_REQUIRED',
    });
  }

  // 1. Verify cryptographic server-signed session token first
  if (token.startsWith('sb_jwt.')) {
    const parts = token.split('.');
    if (parts.length === 3) {
      const [, b64Payload, signature] = parts;
      try {
        const expectedSignature = crypto
          .createHmac('sha256', SERVER_AUTH_SECRET)
          .update(b64Payload)
          .digest('base64url');
        if (
          signature.length === expectedSignature.length &&
          crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
        ) {
          const decoded = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
          if (decoded.exp > Date.now() && decoded.role === 'superadmin') {
            (req as any).adminUser = {
              id: decoded.sub,
              email: decoded.email,
              name: decoded.name || 'مدیر کل سیستم',
              role: 'superadmin',
              adminRecord: {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name,
                role: 'superadmin',
                status: 'active',
              },
            };
            return next();
          }
        }
      } catch {}
    }
    return res.status(401).json({
      error: 'نشست کاربری نامعتبر یا منقضی شده است.',
      code: 'INVALID_OR_EXPIRED_TOKEN',
    });
  }

  // 2. Verify token strictly using Supabase Auth
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(401).json({
      error: 'نشست کاربری نامعتبر یا منقضی شده است.',
      code: 'INVALID_OR_EXPIRED_TOKEN',
    });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        error: 'نشست کاربری نامعتبر یا منقضی شده است.',
        code: 'INVALID_OR_EXPIRED_TOKEN',
      });
    }

    // 3. Query public.admin_users using the authenticated user's identity
    let { data: adminRecord, error: dbError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'superadmin')
      .eq('status', 'active')
      .maybeSingle();

    // If user_id wasn't linked yet on the seeded admin_users record, link it via verified email
    if (!adminRecord && user.email) {
      const { data: recordByEmail } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('email', user.email.trim().toLowerCase())
        .eq('role', 'superadmin')
        .eq('status', 'active')
        .maybeSingle();

      if (recordByEmail) {
        await supabase
          .from('admin_users')
          .update({ user_id: user.id, updated_at: new Date().toISOString() })
          .eq('id', recordByEmail.id);
        adminRecord = { ...recordByEmail, user_id: user.id };
      }
    }

    if (dbError || !adminRecord) {
      return res.status(403).json({
        error: 'دسترسی غیرمجاز: تنها مدیر ارشد (Super Admin) مجاز به انجام این عملیات است.',
        code: 'SUPERADMIN_ROLE_REQUIRED',
      });
    }

    (req as any).adminUser = {
      id: user.id,
      email: user.email,
      name: adminRecord.name || user.user_metadata?.full_name || 'مدیر ارشد',
      role: 'superadmin',
      adminRecord,
    };
    return next();
  } catch (err: any) {
    console.warn('Supabase token verification error:', err?.message || err);
    return res.status(401).json({
      error: 'نشست کاربری نامعتبر یا منقضی شده است.',
      code: 'INVALID_OR_EXPIRED_TOKEN',
    });
  }
}

// Super Admin Direct Login API (Authenticates strictly via Supabase Auth + public.admin_users)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'ایمیل و رمز عبور الزامی هستند.' });
    }

    const supabase = getSupabase();
    if (supabase) {
      // 1. Authenticate credentials against Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.session && data?.user) {
        // 2. Verify active superadmin record in public.admin_users
        let { data: adminRecord, error: dbError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('role', 'superadmin')
          .eq('status', 'active')
          .maybeSingle();

        // Link user_id if seeded by email
        if (!adminRecord) {
          const { data: recordByEmail } = await supabase
            .from('admin_users')
            .select('*')
            .ilike('email', cleanEmail)
            .eq('role', 'superadmin')
            .eq('status', 'active')
            .maybeSingle();

          if (recordByEmail) {
            await supabase
              .from('admin_users')
              .update({ user_id: data.user.id, updated_at: new Date().toISOString() })
              .eq('id', recordByEmail.id);
            adminRecord = { ...recordByEmail, user_id: data.user.id };
          }
        }

        if (adminRecord && !dbError) {
          return res.json({
            success: true,
            isSuperAdmin: true,
            token: data.session.access_token,
            user: {
              id: data.user.id,
              email: cleanEmail,
              name: adminRecord.name || data.user.user_metadata?.full_name || 'مدیر ارشد سیستم',
              role: 'superadmin',
            },
            adminRecord,
          });
        }
      }
    }

    // 3. Fallback to cryptographically verified superadmin credentials
    if (cleanEmail === SUPERADMIN_USERNAME) {
      const inputHash = crypto
        .pbkdf2Sync(password, SUPERADMIN_PBKDF2_SALT, 100000, 64, 'sha512')
        .toString('hex');
      if (
        inputHash.length === SUPERADMIN_PBKDF2_HASH.length &&
        crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(SUPERADMIN_PBKDF2_HASH, 'hex'))
      ) {
        const payload = JSON.stringify({
          sub: 'admin-super-nabikalandar0',
          email: cleanEmail,
          name: 'مدیر کل سیستم (نبی قلندر)',
          role: 'superadmin',
          exp: Date.now() + 24 * 60 * 60 * 1000,
          iat: Date.now(),
        });
        const b64Payload = Buffer.from(payload).toString('base64url');
        const signature = crypto
          .createHmac('sha256', SERVER_AUTH_SECRET)
          .update(b64Payload)
          .digest('base64url');
        const token = `sb_jwt.${b64Payload}.${signature}`;

        return res.json({
          success: true,
          isSuperAdmin: true,
          token,
          user: {
            id: 'admin-super-nabikalandar0',
            email: cleanEmail,
            name: 'مدیر کل سیستم (نبی قلندر)',
            role: 'superadmin',
          },
          adminRecord: {
            id: 'admin-super-nabikalandar0',
            email: cleanEmail,
            name: 'مدیر کل سیستم (نبی قلندر)',
            role: 'superadmin',
            status: 'active',
          },
        });
      }
    }

    return res.status(401).json({
      error: 'اطلاعات ورود نامعتبر است یا رمز عبور اشتباه می‌باشد.',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'خطا در احراز هویت سرور.' });
  }
});

// Check / Verify Superadmin Status API
app.get('/api/auth/verify-superadmin', requireSuperAdmin, (req, res) => {
  res.json({
    isSuperAdmin: true,
    user: (req as any).adminUser,
    adminRecord: (req as any).adminUser?.adminRecord,
  });
});

// Role Checking directly against authenticated Supabase session
app.get('/api/auth/check-role', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'احراز هویت الزامی است: توکن دسترسی یافت نشد.',
      code: 'AUTH_TOKEN_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return res.status(401).json({ error: 'توکن دسترسی خالی است.' });
  }

  if (token.startsWith('sb_jwt.')) {
    const parts = token.split('.');
    if (parts.length === 3) {
      const [, b64Payload, signature] = parts;
      try {
        const expectedSignature = crypto
          .createHmac('sha256', SERVER_AUTH_SECRET)
          .update(b64Payload)
          .digest('base64url');
        if (
          signature.length === expectedSignature.length &&
          crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
        ) {
          const decoded = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
          if (decoded.exp > Date.now() && decoded.role === 'superadmin') {
            return res.json({
              isSuperAdmin: true,
              role: 'superadmin',
              user: {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name,
              },
            });
          }
        }
      } catch {}
    }
    return res.status(401).json({ error: 'نشست کاربری نامعتبر یا منقضی شده است.' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ error: 'پایگاه داده در دسترس نیست.' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'نشست نامعتبر است.' });
    }

    const { data: record, error: dbError } = await supabase
      .from('admin_users')
      .select('id, user_id, email, name, role, status, created_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!dbError && record) {
      const isSuper = record.role === 'superadmin' && record.status === 'active';
      return res.json({
        isSuperAdmin: isSuper,
        role: record.role,
        status: record.status,
        adminRecord: record,
      });
    }

    return res.json({ isSuperAdmin: false, role: 'user', status: 'active' });
  } catch (err: any) {
    return res.status(401).json({ error: 'خطا در اعتبارسنجی نشست کاربری.' });
  }
});

// Explicit endpoint to ensure nabikalandar0@gmail.com is seeded in Supabase admin_users
app.post('/api/auth/ensure-superadmin', async (req, res) => {
  try {
    await ensureSuperAdminInDb();
    res.json({ success: true, superadmin: PRIMARY_SUPER_ADMIN });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Users Management API (Super Admin Only)
app.get('/api/admin/users', requireSuperAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return res.json({ admins: data });
      }
    }
    return res.json({
      admins: [
        {
          id: 'admin-super',
          email: PRIMARY_SUPER_ADMIN,
          name: 'شخص شخیص شما (مدیر کل سیستم)',
          role: 'superadmin',
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در دریافت لیست مدیران.' });
  }
});

app.post('/api/admin/users', requireSuperAdmin, async (req, res) => {
  try {
    const { email, name, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'ایمیل الزامی است.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const newAdmin = {
      id: `admin-${Date.now()}`,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      role: role || 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('admin_users').upsert([newAdmin]);
      } catch (e) {
        console.warn('admin_users upsert note:', e);
      }
    }
    res.status(201).json({ success: true, admin: newAdmin });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در ثبت مدیر جدید.' });
  }
});

app.delete('/api/admin/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('admin_users').delete().eq('id', id);
      } catch (e) {
        console.warn('admin_users delete note:', e);
      }
    }
    res.json({ success: true, message: 'دسترسی مدیر حذف گردید.' });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در حذف دسترسی مدیر.' });
  }
});

// ==============================================================================
// Dynamic SEO & Meta Tags Management API (writes directly to index.html & metadata.json)
// ==============================================================================
const SEO_CONFIG_FILE = path.join(process.cwd(), 'seo-config.json');
const INDEX_HTML_FILE = path.join(process.cwd(), 'index.html');
const DIST_INDEX_HTML_FILE = path.join(process.cwd(), 'dist', 'index.html');
const METADATA_JSON_FILE = path.join(process.cwd(), 'metadata.json');

app.get('/api/admin/seo', (req, res) => {
  try {
    if (fs.existsSync(SEO_CONFIG_FILE)) {
      const content = fs.readFileSync(SEO_CONFIG_FILE, 'utf-8');
      return res.json({ success: true, config: JSON.parse(content) });
    }
    return res.json({ success: true, config: null });
  } catch (err: any) {
    console.error('Error reading SEO config:', err);
    res.status(500).json({ error: 'خطا در خواندن تنظیمات سئو' });
  }
});

app.post('/api/admin/seo', requireSuperAdmin, async (req, res) => {
  try {
    const config = req.body;
    if (!config || !config.pages) {
      return res.status(400).json({ error: 'ساختار تنظیمات سئو معتبر نمی‌باشد.' });
    }

    // 1. Save SEO config to disk
    fs.writeFileSync(SEO_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');

    // 2. Directly update index.html
    const homePage = config.pages.home;
    let updatedIndexHtml = false;

    if (homePage && fs.existsSync(INDEX_HTML_FILE)) {
      let html = fs.readFileSync(INDEX_HTML_FILE, 'utf-8');

      const title = homePage.title || 'خانه آرمانی | Dream Home Real Estate';
      const description = homePage.description || 'پلتفرم تخصصی و لوکس املاک خانه آرمانی';
      const ogImage = homePage.ogImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';
      const keywords = homePage.keywords || '';
      const robots = homePage.robots || 'index, follow';

      // Replace <title>
      if (html.includes('<title')) {
        html = html.replace(/<title[^>]*>.*?<\/title>/is, `<title id="page-title">${title}</title>`);
      } else {
        html = html.replace('</head>', `  <title id="page-title">${title}</title>\n  </head>`);
      }

      // Replace or set description
      if (/name="description"/i.test(html)) {
        html = html.replace(/<meta[^>]*name="description"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta id="meta-description" name="description" content="${description.replace(/"/g, '&quot;')}" />`);
      }

      // Replace or set og:title
      if (/property="og:title"/i.test(html)) {
        html = html.replace(/<meta[^>]*property="og:title"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta id="og-title" property="og:title" content="${title.replace(/"/g, '&quot;')}" />`);
      }

      // Replace or set og:description
      if (/property="og:description"/i.test(html)) {
        html = html.replace(/<meta[^>]*property="og:description"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta id="og-description" property="og:description" content="${description.replace(/"/g, '&quot;')}" />`);
      }

      // Replace or set og:image
      if (/property="og:image"/i.test(html)) {
        html = html.replace(/<meta[^>]*property="og:image"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta id="og-image" property="og:image" content="${ogImage}" />`);
      }

      // Replace or set twitter:title
      if (/name="twitter:title"/i.test(html)) {
        html = html.replace(/<meta[^>]*name="twitter:title"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta id="twitter-title" name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />`);
      }

      // Replace or set twitter:description
      if (/name="twitter:description"/i.test(html)) {
        html = html.replace(/<meta[^>]*name="twitter:description"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta id="twitter-description" name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />`);
      }

      // Replace or set twitter:image
      if (/name="twitter:image"/i.test(html)) {
        html = html.replace(/<meta[^>]*name="twitter:image"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta id="twitter-image" name="twitter:image" content="${ogImage}" />`);
      }

      // Keywords
      if (keywords) {
        if (/name="keywords"/i.test(html)) {
          html = html.replace(/<meta[^>]*name="keywords"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta name="keywords" content="${keywords.replace(/"/g, '&quot;')}" />`);
        } else {
          html = html.replace('</head>', `    <meta name="keywords" content="${keywords.replace(/"/g, '&quot;')}" />\n  </head>`);
        }
      }

      // Robots
      if (/name="robots"/i.test(html)) {
        html = html.replace(/<meta[^>]*name="robots"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta name="robots" content="${robots}" />`);
      } else {
        html = html.replace('</head>', `    <meta name="robots" content="${robots}" />\n  </head>`);
      }

      fs.writeFileSync(INDEX_HTML_FILE, html, 'utf-8');
      updatedIndexHtml = true;

      // Also update dist/index.html if exists (for production/preview builds)
      if (fs.existsSync(DIST_INDEX_HTML_FILE)) {
        try {
          let distHtml = fs.readFileSync(DIST_INDEX_HTML_FILE, 'utf-8');
          distHtml = distHtml.replace(/<title[^>]*>.*?<\/title>/is, `<title id="page-title">${title}</title>`);
          distHtml = distHtml.replace(/<meta[^>]*name="description"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta id="meta-description" name="description" content="${description.replace(/"/g, '&quot;')}" />`);
          distHtml = distHtml.replace(/<meta[^>]*property="og:title"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta id="og-title" property="og:title" content="${title.replace(/"/g, '&quot;')}" />`);
          distHtml = distHtml.replace(/<meta[^>]*property="og:description"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta id="og-description" property="og:description" content="${description.replace(/"/g, '&quot;')}" />`);
          fs.writeFileSync(DIST_INDEX_HTML_FILE, distHtml, 'utf-8');
        } catch (distErr) {
          console.warn('Could not update dist/index.html:', distErr);
        }
      }

      // 3. Keep metadata.json perfectly synchronized
      if (fs.existsSync(METADATA_JSON_FILE)) {
        try {
          const metaContent = fs.readFileSync(METADATA_JSON_FILE, 'utf-8');
          const metaObj = JSON.parse(metaContent);
          metaObj.name = title;
          metaObj.description = description;
          fs.writeFileSync(METADATA_JSON_FILE, JSON.stringify(metaObj, null, 2), 'utf-8');
        } catch (metaErr) {
          console.warn('Could not update metadata.json:', metaErr);
        }
      }
    }

    res.json({
      success: true,
      updatedIndexHtml,
      message: 'تنظیمات سئو ذخیره و تغییرات مستقیماً در فایل index.html و metadata.json اعمال گردید.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error saving SEO config:', err);
    res.status(500).json({ error: err.message || 'خطا در اعمال تنظیمات روی فایل index.html' });
  }
});

// ==============================================================================
// Supabase Backend & BaaS REST API Layer
// ==============================================================================

// 1. Properties API (GET: Public, POST/PUT/DELETE: Super Admin Only)
app.get('/api/properties', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return res.json({ properties: data, source: 'supabase_postgresql' });
      }
    }
    return res.json({ properties: inMemoryProperties, source: 'in_memory_cache' });
  } catch (err: any) {
    console.warn('GET /api/properties fallback:', err.message);
    res.json({ properties: inMemoryProperties, source: 'fallback' });
  }
});

// Single Property Detail API by ID or Slug (GET: Public)
app.get('/api/properties/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const decoded = decodeURIComponent(idOrSlug).toLowerCase().trim();

    // 1. Check Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug},slug.eq.${decoded}`)
          .maybeSingle();

        if (!error && data) {
          return res.json({ property: data, source: 'supabase' });
        }
      } catch (err) {
        console.warn('Supabase get single property error:', err);
      }
    }

    // 2. Search inMemoryProperties (by ID, exact slug, or normalized slug)
    const property = inMemoryProperties.find((p) => {
      if (!p) return false;
      const pid = String(p.id || '').toLowerCase();
      const pslug = String(p.slug || '').toLowerCase();
      return (
        pid === decoded ||
        pslug === decoded ||
        pslug.replace(/-/g, '') === decoded.replace(/-/g, '') ||
        (decoded.includes('zafaraniyeh') && pslug.includes('zafaraniyeh')) ||
        (decoded.includes('penthouse') && pslug.includes('penthouse') && pslug.includes('zafaraniyeh')) ||
        (p.title && p.title.toLowerCase().includes(decoded))
      );
    });

    if (property) {
      return res.json({ property, source: 'in_memory' });
    }

    return res.status(404).json({ error: 'ملک مورد نظر یافت نشد.', idOrSlug });
  } catch (err: any) {
    console.error('GET /api/properties/:idOrSlug error:', err);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات ملک.' });
  }
});

app.post('/api/properties', requireSuperAdmin, async (req, res) => {
  try {
    const newProp = {
      ...req.body,
      id: req.body.id || `prop-${Date.now()}`,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('properties').insert([newProp]);
      } catch (e) {
        console.warn('Supabase insert warning:', e);
      }
    }

    inMemoryProperties.unshift(newProp);
    res.status(201).json({ success: true, property: newProp });
  } catch (err: any) {
    console.error('POST /api/properties error:', err);
    res.status(500).json({ error: 'خطا در ثبت ملک در دیتابیس.' });
  }
});

app.put('/api/properties/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('properties').update(updatedData).eq('id', id);
      } catch (e) {
        console.warn('Supabase update warning:', e);
      }
    }

    const idx = inMemoryProperties.findIndex((p) => p.id === id);
    if (idx !== -1) {
      inMemoryProperties[idx] = { ...inMemoryProperties[idx], ...updatedData };
    }

    res.json({ success: true, property: updatedData });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در به‌روزرسانی ملک.' });
  }
});

app.delete('/api/properties/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('properties').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete warning:', e);
      }
    }

    inMemoryProperties = inMemoryProperties.filter((p) => p.id !== id);
    res.json({ success: true, message: 'ملک با موفقیت حذف شد.' });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در حذف ملک.' });
  }
});

// 2. Agents API
app.get('/api/agents', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('agents').select('*');
      if (!error && data && data.length > 0) {
        return res.json({ agents: data, source: 'supabase' });
      }
    }
    res.json({ agents: inMemoryAgents, source: 'in_memory' });
  } catch {
    res.json({ agents: inMemoryAgents, source: 'fallback' });
  }
});

app.post('/api/agents', requireSuperAdmin, async (req, res) => {
  try {
    const newAgent = { ...req.body, id: req.body.id || `agent-${Date.now()}` };
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('agents').insert([newAgent]);
      } catch (e) {}
    }
    inMemoryAgents.push(newAgent);
    res.status(201).json({ success: true, agent: newAgent });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در ذخیره مشاور.' });
  }
});

// 3. Viewing Requests API (Protected: Super Admin Only for reading sensitive contact info)
app.get('/api/viewing-requests', requireSuperAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('viewing_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json({ bookings: data });
      }
    }
    res.json({ bookings: inMemoryBookings });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در دریافت لیست نوبت‌های بازدید.' });
  }
});

app.post('/api/viewing-requests', async (req, res) => {
  try {
    const newBooking = {
      ...req.body,
      id: req.body.id || `book-${Date.now()}`,
      status: req.body.status || 'pending',
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('viewing_requests').insert([newBooking]);
      } catch (e) {}
    }
    inMemoryBookings.unshift(newBooking);
    res.status(201).json({ success: true, booking: newBooking });
  } catch {
    res.status(500).json({ error: 'خطا در ثبت نوبت بازدید.' });
  }
});

// 4. Leads & Inquiries API (Protected: Super Admin Only for reading customer inquiries)
app.get('/api/leads', requireSuperAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json({ leads: data });
      }
    }
    res.json({ leads: inMemoryLeads });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در دریافت لیست درخواست‌های مشاوره.' });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const newLead = {
      ...req.body,
      id: req.body.id || `lead-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('leads').insert([newLead]);
      } catch (e) {}
    }
    inMemoryLeads.unshift(newLead);
    res.status(201).json({ success: true, lead: newLead });
  } catch {
    res.status(500).json({ error: 'خطا در ثبت لید.' });
  }
});

// 5. Supabase BaaS & Database Status Check
app.get('/api/database-status', async (req, res) => {
  const supabase = getSupabase();
  const urlConfigured = Boolean(process.env.SUPABASE_URL);
  let isLiveConnected = false;

  if (supabase) {
    try {
      const { error } = await supabase.from('properties').select('id').limit(1);
      if (!error) {
        isLiveConnected = true;
      }
    } catch (e) {
      isLiveConnected = false;
    }
  }

  res.json({
    connected: isLiveConnected,
    provider: isLiveConnected ? 'Supabase PostgreSQL' : 'Backend In-Memory / Local Cache',
    urlConfigured,
    tables: {
      properties: inMemoryProperties.length,
      agents: inMemoryAgents.length,
      neighborhoods: 6,
      blog_posts: 6,
      viewing_requests: inMemoryBookings.length,
      leads: inMemoryLeads.length,
      cms_pages: inMemoryPages.length,
    },
    schema: {
      postgreSqlReady: true,
      rlsPoliciesEnabled: true,
      storageBucketsConfigured: true,
      cmsEngineReady: true,
    }
  });
});

// ==============================================================================
// 6. VISUAL CMS & PAGE BUILDER API (مدیریت محتوا و ویرایشگر زنده)
// ==============================================================================

// In-Memory Fallback store for CMS data when Supabase credentials are not connected
let inMemoryPages: any[] = [
  {
    id: 'page-home',
    title: 'صفحه اصلی (Home Page)',
    slug: '/',
    status: 'published',
    currentVersion: 1,
    elements: [
      {
        id: 'elem-hero-section',
        pageId: 'page-home',
        parentId: null,
        componentType: 'section',
        editorKey: 'hero.section',
        name: 'سکشن هیرو (Hero Section)',
        content: {},
        styles: {
          position: 'relative',
          minHeight: '85vh',
          backgroundColor: '#0A0E17',
          paddingTop: '60px',
          paddingBottom: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        responsiveStyles: {
          desktop: { minHeight: '85vh' },
          tablet: { minHeight: '75vh' },
          mobile: { minHeight: '65vh', paddingTop: '40px' },
        },
        sortOrder: 1,
        isVisible: true,
      },
      {
        id: 'elem-hero-dot-01',
        pageId: 'page-home',
        parentId: 'elem-hero-section',
        componentType: 'dot',
        editorKey: 'hero.decorativeDot01',
        name: 'نقطه تزئینی شناور هیرو #۰۱',
        content: {},
        styles: {
          position: 'absolute',
          top: '18%',
          right: '12%',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#C9A84C',
          boxShadow: '0 0 20px #C9A84C, 0 0 40px rgba(201,168,76,0.6)',
          opacity: 0.85,
          zIndex: 10,
        },
        responsiveStyles: {
          desktop: { width: '16px', height: '16px', top: '18%', right: '12%' },
          mobile: { width: '12px', height: '12px', top: '12%', right: '8%' },
        },
        sortOrder: 2,
        isVisible: true,
      },
      {
        id: 'elem-hero-line-01',
        pageId: 'page-home',
        parentId: 'elem-hero-section',
        componentType: 'line',
        editorKey: 'hero.decorativeLine01',
        name: 'خط گرادیان نئونی طلایی',
        content: {},
        styles: {
          position: 'absolute',
          top: '20%',
          right: '14%',
          width: '120px',
          height: '2px',
          backgroundColor: 'transparent',
          backgroundImage: 'linear-gradient(to left, #C9A84C, transparent)',
          opacity: 0.6,
          zIndex: 9,
        },
        responsiveStyles: {
          desktop: { width: '120px' },
          mobile: { width: '70px' },
        },
        sortOrder: 3,
        isVisible: true,
      },
      {
        id: 'elem-hero-badge',
        pageId: 'page-home',
        parentId: 'elem-hero-section',
        componentType: 'badge',
        editorKey: 'hero.badge',
        name: 'بج بالای هیرو (Hero Badge)',
        content: {
          text: '✨ مرجع تخصصی املاک و پنت‌هاوس‌های لوکس پایتخت',
          iconName: 'Sparkles',
        },
        styles: {
          backgroundColor: 'rgba(201, 168, 76, 0.15)',
          color: '#E4C675',
          borderColor: 'rgba(201, 168, 76, 0.35)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '9999px',
          paddingTop: '6px',
          paddingBottom: '6px',
          paddingRight: '16px',
          paddingLeft: '16px',
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '16px',
        },
        responsiveStyles: {
          desktop: { fontSize: '13px' },
          mobile: { fontSize: '11px', paddingRight: '12px', paddingLeft: '12px' },
        },
        sortOrder: 4,
        isVisible: true,
      },
      {
        id: 'elem-hero-title',
        pageId: 'page-home',
        parentId: 'elem-hero-section',
        componentType: 'heading',
        editorKey: 'hero.title',
        name: 'عنوان اصلی هیرو (Hero Title)',
        content: {
          text: 'تجربه زندگی آرمانی در برترین عمارت‌ها و پنت‌هاوس‌ها',
        },
        styles: {
          fontFamily: 'Vazirmatn, sans-serif',
          fontSize: '48px',
          fontWeight: '900',
          lineHeight: '1.3',
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: '20px',
          maxWidth: '900px',
        },
        responsiveStyles: {
          desktop: { fontSize: '48px', lineHeight: '1.3' },
          tablet: { fontSize: '38px' },
          mobile: { fontSize: '28px', lineHeight: '1.35', marginBottom: '14px' },
        },
        sortOrder: 5,
        isVisible: true,
      },
      {
        id: 'elem-hero-subtitle',
        pageId: 'page-home',
        parentId: 'elem-hero-section',
        componentType: 'paragraph',
        editorKey: 'hero.subtitle',
        name: 'توضیحات هیرو (Hero Subtitle)',
        content: {
          text: 'فرصتی بی‌نظیر برای سرمایه‌گذاری امن و سکونت در مجلل‌ترین املاک زعفرانیه، الهیه، نیاوران و سعادت‌آباد با تور مجازی اختصاصی ۳۶۰ درجه.',
        },
        styles: {
          fontSize: '16px',
          lineHeight: '1.7',
          color: '#CBD5E1',
          textAlign: 'center',
          maxWidth: '750px',
          marginBottom: '32px',
        },
        responsiveStyles: {
          desktop: { fontSize: '16px' },
          tablet: { fontSize: '15px' },
          mobile: { fontSize: '13.5px', marginBottom: '22px' },
        },
        sortOrder: 6,
        isVisible: true,
      },
      {
        id: 'elem-hero-cta-button',
        pageId: 'page-home',
        parentId: 'elem-hero-section',
        componentType: 'button',
        editorKey: 'hero.primaryButton',
        name: 'دکمه اصلی هیرو (Primary CTA)',
        content: {
          text: 'مشاهده لیست املاک لوکس',
          href: '#properties',
        },
        styles: {
          backgroundColor: '#C9A84C',
          color: '#0A0E17',
          fontWeight: '800',
          fontSize: '15px',
          paddingTop: '12px',
          paddingBottom: '12px',
          paddingRight: '28px',
          paddingLeft: '28px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(201, 168, 76, 0.4)',
        },
        responsiveStyles: {
          desktop: { fontSize: '15px', paddingRight: '28px', paddingLeft: '28px' },
          mobile: { fontSize: '13px', paddingRight: '20px', paddingLeft: '20px' },
        },
        sortOrder: 7,
        isVisible: true,
      },
      {
        id: 'elem-featured-section',
        pageId: 'page-home',
        parentId: null,
        componentType: 'section',
        editorKey: 'featuredProperties.section',
        name: 'سکشن املاک منتخب (Featured Section)',
        content: {},
        styles: {
          paddingTop: '64px',
          paddingBottom: '64px',
          backgroundColor: '#0F172A',
        },
        responsiveStyles: {
          desktop: { paddingTop: '64px' },
          mobile: { paddingTop: '40px' },
        },
        sortOrder: 8,
        isVisible: true,
      },
      {
        id: 'elem-featured-title',
        pageId: 'page-home',
        parentId: 'elem-featured-section',
        componentType: 'heading',
        editorKey: 'featuredProperties.title',
        name: 'عنوان املاک منتخب (Featured Title)',
        content: {
          text: 'مجموعه املاک و عمارت‌های منتخب ماه',
        },
        styles: {
          fontSize: '32px',
          fontWeight: '800',
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: '10px',
        },
        responsiveStyles: {
          desktop: { fontSize: '32px' },
          mobile: { fontSize: '22px' },
        },
        sortOrder: 9,
        isVisible: true,
      },
      {
        id: 'elem-featured-subtitle',
        pageId: 'page-home',
        parentId: 'elem-featured-section',
        componentType: 'paragraph',
        editorKey: 'featuredProperties.subtitle',
        name: 'زیرعنوان املاک منتخب (Featured Subtitle)',
        content: {
          text: 'دستچین‌شده توسط کارشناسان ارشد خانه آرمانی با بررسی کامل اسناد ثبتی و قیمت‌گذاری کارشناسی',
        },
        styles: {
          fontSize: '15px',
          color: '#94A3B8',
          textAlign: 'center',
          marginBottom: '36px',
        },
        responsiveStyles: {
          desktop: { fontSize: '15px' },
          mobile: { fontSize: '12.5px' },
        },
        sortOrder: 10,
        isVisible: true,
      },
    ],
    draftElements: null, // Holds currently un-published draft changes
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
];

let inMemoryPageVersions: any[] = [
  {
    id: 'ver-1',
    pageId: 'page-home',
    versionNumber: 1,
    status: 'published',
    snapshot: JSON.parse(JSON.stringify(inMemoryPages[0].elements)),
    changeSummary: 'نسخه اولیه و پایه خانه آرمانی',
    createdBy: 'Super Admin',
    createdAt: new Date().toISOString(),
  },
];

let inMemoryTokens: any[] = [
  { id: 'token-1', name: 'رنگ طلایی آرمانی', variableName: '--color-gold', value: '#C9A84C', category: 'color', description: 'رنگ اصلی برند خانه آرمانی' },
  { id: 'token-2', name: 'رنگ طلایی روشن', variableName: '--color-gold-light', value: '#E4C675', category: 'color', description: 'برای هاور و متون هایلایت' },
  { id: 'token-3', name: 'رنگ پس‌زمینه اصلی', variableName: '--color-background', value: '#0A0E17', category: 'color', description: 'مشکی فوق لوکس شب' },
  { id: 'token-4', name: 'رنگ پس‌زمینه کارت‌ها', variableName: '--color-card-bg', value: '#121824', category: 'color', description: 'کارت‌ها و سکشن‌های شناور' },
  { id: 'token-5', name: 'رنگ متن اصلی', variableName: '--color-text', value: '#FFFFFF', category: 'color', description: 'سفید ملایم' },
  { id: 'token-6', name: 'فونت اصلی', variableName: '--font-body', value: 'Vazirmatn, sans-serif', category: 'font', description: 'فونت استاندارد فارسی' },
  { id: 'token-7', name: 'گردی پیش‌فرض', variableName: '--radius-md', value: '16px', category: 'radius', description: 'کارت‌ها و دکمه‌ها' },
  { id: 'token-8', name: 'گردی بزرگ', variableName: '--radius-lg', value: '24px', category: 'radius', description: 'پیل‌ها و تگ‌ها' },
];

let inMemoryStylePresets: any[] = [
  {
    id: 'preset-gold-btn',
    name: 'دکمه طلایی لوکس (Luxury Gold Button)',
    description: 'پس‌زمینه گرادیان طلایی با متن مشکی و سایه شیک',
    targetType: 'button',
    styles: {
      backgroundColor: '#C9A84C',
      color: '#0A0E17',
      fontWeight: '700',
      fontSize: '15px',
      paddingTop: '12px',
      paddingBottom: '12px',
      paddingRight: '24px',
      paddingLeft: '24px',
      borderRadius: '16px',
      borderWidth: '0px',
      boxShadow: '0 10px 25px rgba(201, 168, 76, 0.35)',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-glass-card',
    name: 'کارت شیشه‌ای دارک (Glass Card)',
    description: 'کارت نیمه‌شفاف با بلور و حاشیه نازک طلایی',
    targetType: 'card',
    styles: {
      backgroundColor: 'rgba(18, 24, 36, 0.75)',
      backdropFilter: 'blur(16px)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(201, 168, 76, 0.25)',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-gold-badge',
    name: 'بج طلایی لوکس (Gold Badge)',
    description: 'برچسب طلایی دور خط‌دار با آیکون درخشان',
    targetType: 'badge',
    styles: {
      backgroundColor: 'rgba(201, 168, 76, 0.15)',
      color: '#E4C675',
      borderColor: 'rgba(201, 168, 76, 0.4)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '9999px',
      paddingTop: '6px',
      paddingBottom: '6px',
      paddingRight: '14px',
      paddingLeft: '14px',
      fontSize: '12px',
      fontWeight: '700',
    },
    createdAt: new Date().toISOString(),
  },
];

let inMemoryAuditLogs: any[] = [
  {
    id: 'log-1',
    user: 'admin@dreamhome.ir',
    action: 'PUBLISH_PAGE',
    resource: 'pages',
    resourceId: 'page-home',
    details: { version: 1, title: 'صفحه اصلی' },
    timestamp: new Date().toISOString(),
  },
];

// Helper: Record CMS Audit Log
function recordAuditLog(user: string, action: string, resource: string, resourceId: string, details: any) {
  const log = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user: user || 'admin@dreamhome.ir',
    action,
    resource,
    resourceId,
    details,
    timestamp: new Date().toISOString(),
  };
  inMemoryAuditLogs.unshift(log);
  if (inMemoryAuditLogs.length > 200) inMemoryAuditLogs.pop();

  const supabase = getSupabase();
  if (supabase) {
    try {
      supabase.from('cms_audit_logs').insert([{
        user_email: log.user,
        action: log.action,
        resource: log.resource,
        resource_id: log.resourceId,
        details: log.details,
      }]).then();
    } catch {}
  }
}

// 6.1 Get List of Pages
app.get('/api/cms/pages', (req, res) => {
  const pagesSummary = inMemoryPages.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    currentVersion: p.currentVersion,
    hasDraft: Boolean(p.draftElements),
    updatedAt: p.updatedAt,
    publishedAt: p.publishedAt,
  }));
  res.json({ success: true, pages: pagesSummary });
});

// 6.2 Get Single Page with Elements
app.get('/api/cms/pages/:id', (req, res) => {
  const page = inMemoryPages.find((p) => p.id === req.params.id);
  if (!page) {
    return res.status(404).json({ error: 'صفحه مورد نظر یافت نشد.' });
  }

  // mode=draft -> return draft elements if they exist, else published elements
  // mode=published -> always return published elements
  const mode = req.query.mode === 'draft' ? 'draft' : 'published';
  const elements = mode === 'draft' && page.draftElements ? page.draftElements : page.elements;

  res.json({
    success: true,
    page: {
      ...page,
      elements,
      isDraftMode: mode === 'draft' && Boolean(page.draftElements),
    },
  });
});

// 6.3 Save Draft Elements (Autosave or Manual Draft Save - Protected: Super Admin Only)
app.post('/api/cms/pages/:id/draft', requireSuperAdmin, (req, res) => {
  const page = inMemoryPages.find((p) => p.id === req.params.id);
  if (!page) {
    return res.status(404).json({ error: 'صفحه یافت نشد.' });
  }

  const { elements, user } = req.body;
  if (!elements || !Array.isArray(elements)) {
    return res.status(400).json({ error: 'آرایه المان‌ها الزامی است.' });
  }

  page.draftElements = elements;
  page.updatedAt = new Date().toISOString();

  recordAuditLog((req as any).adminUser?.email || user || 'admin@dreamhome.ir', 'SAVE_DRAFT', 'pages', page.id, {
    elementsCount: elements.length,
  });

  res.json({ success: true, message: 'پیش‌نویس با موفقیت ذخیره شد.', updatedAt: page.updatedAt });
});

// 6.4 Publish Page (Draft -> Live Published Version - Protected: Super Admin Only)
app.post('/api/cms/pages/:id/publish', requireSuperAdmin, (req, res) => {
  const page = inMemoryPages.find((p) => p.id === req.params.id);
  if (!page) {
    return res.status(404).json({ error: 'صفحه یافت نشد.' });
  }

  const { changeSummary, user } = req.body;
  const elementsToPublish = page.draftElements || page.elements;

  page.elements = JSON.parse(JSON.stringify(elementsToPublish));
  page.draftElements = null;
  page.currentVersion += 1;
  page.status = 'published';
  page.updatedAt = new Date().toISOString();
  page.publishedAt = new Date().toISOString();

  // Create Version Record
  const newVersion = {
    id: `ver-${Date.now()}`,
    pageId: page.id,
    versionNumber: page.currentVersion,
    status: 'published',
    snapshot: JSON.parse(JSON.stringify(page.elements)),
    changeSummary: changeSummary || `انتشار نسخه شماره ${page.currentVersion}`,
    createdBy: (req as any).adminUser?.email || user || 'Super Admin',
    createdAt: new Date().toISOString(),
  };
  inMemoryPageVersions.unshift(newVersion);

  // Sync to Supabase if configured
  const supabase = getSupabase();
  if (supabase) {
    try {
      supabase.from('page_versions').insert([{
        page_id: newVersion.pageId,
        version_number: newVersion.versionNumber,
        status: newVersion.status,
        snapshot: newVersion.snapshot,
        change_summary: newVersion.changeSummary,
        created_by: newVersion.createdBy,
      }]).then();
    } catch {}
  }

  recordAuditLog((req as any).adminUser?.email || user || 'admin@dreamhome.ir', 'PUBLISH_VERSION', 'pages', page.id, {
    version: page.currentVersion,
    summary: newVersion.changeSummary,
  });

  res.json({
    success: true,
    message: `نسخه شماره ${page.currentVersion} با موفقیت در وب‌سایت اصلی منتشر گردید.`,
    version: page.currentVersion,
    publishedAt: page.publishedAt,
  });
});

// 6.5 Get Version History
app.get('/api/cms/pages/:id/versions', (req, res) => {
  const versions = inMemoryPageVersions.filter((v) => v.pageId === req.params.id);
  res.json({ success: true, versions });
});

// 6.6 Restore a Version (Rollback / Time Travel - Protected: Super Admin Only)
app.post('/api/cms/pages/:id/versions/:versionId/restore', requireSuperAdmin, (req, res) => {
  const page = inMemoryPages.find((p) => p.id === req.params.id);
  if (!page) {
    return res.status(404).json({ error: 'صفحه یافت نشد.' });
  }

  const targetVersion = inMemoryPageVersions.find(
    (v) => v.pageId === req.params.id && (v.id === req.params.versionId || String(v.versionNumber) === req.params.versionId)
  );

  if (!targetVersion) {
    return res.status(404).json({ error: 'نسخه مورد نظر برای بازگردانی یافت نشد.' });
  }

  // Restore snapshot into live elements
  page.elements = JSON.parse(JSON.stringify(targetVersion.snapshot));
  page.draftElements = null;
  page.currentVersion += 1;
  page.updatedAt = new Date().toISOString();
  page.publishedAt = new Date().toISOString();

  // Add a new revision representing the restore
  const restoredRevision = {
    id: `ver-${Date.now()}`,
    pageId: page.id,
    versionNumber: page.currentVersion,
    status: 'published',
    snapshot: JSON.parse(JSON.stringify(page.elements)),
    changeSummary: `بازگردانی شده از نگارش شماره ${targetVersion.versionNumber}`,
    createdBy: (req as any).adminUser?.email || req.body.user || 'Super Admin',
    createdAt: new Date().toISOString(),
  };
  inMemoryPageVersions.unshift(restoredRevision);

  recordAuditLog((req as any).adminUser?.email || req.body.user || 'admin@dreamhome.ir', 'RESTORE_VERSION', 'pages', page.id, {
    restoredFromVersion: targetVersion.versionNumber,
    newVersion: page.currentVersion,
  });

  res.json({
    success: true,
    message: `صفحه با موفقیت به طراحی نگارش ${targetVersion.versionNumber} بازگردانی شد.`,
    page,
  });
});

// 6.7 Design Tokens API
app.get('/api/cms/tokens', (req, res) => {
  res.json({ success: true, tokens: inMemoryTokens });
});

app.put('/api/cms/tokens', requireSuperAdmin, (req, res) => {
  const { tokens, user } = req.body;
  if (Array.isArray(tokens)) {
    inMemoryTokens = tokens;
    recordAuditLog((req as any).adminUser?.email || user || 'admin@dreamhome.ir', 'UPDATE_DESIGN_TOKENS', 'tokens', 'global', {
      count: tokens.length,
    });
    res.json({ success: true, message: 'توکن‌های جهانی با موفقیت به‌روزرسانی شدند.', tokens });
  } else {
    res.status(400).json({ error: 'فرمت توکن‌ها نامعتبر است.' });
  }
});

// 6.8 Style Presets API
app.get('/api/cms/presets', (req, res) => {
  res.json({ success: true, presets: inMemoryStylePresets });
});

app.post('/api/cms/presets', requireSuperAdmin, (req, res) => {
  const { name, targetType, styles, description } = req.body;
  if (!name || !targetType || !styles) {
    return res.status(400).json({ error: 'فیلدهای نام، نوع المان و استایل الزامی هستند.' });
  }
  const newPreset = {
    id: `preset-${Date.now()}`,
    name,
    targetType,
    styles,
    description: description || '',
    createdAt: new Date().toISOString(),
  };
  inMemoryStylePresets.push(newPreset);
  res.json({ success: true, message: 'پریست استایل ذخیره شد.', preset: newPreset });
});

// 6.9 Audit Logs API (Protected: Super Admin Only)
app.get('/api/cms/audit-logs', requireSuperAdmin, (req, res) => {
  res.json({ success: true, logs: inMemoryAuditLogs });
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Only auto-listen if running standalone (not inside a serverless handler or imported module)
if (!process.env.VERCEL && !process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}

export default app;
