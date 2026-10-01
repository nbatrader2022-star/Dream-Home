// @ts-nocheck
"use client";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";

export const itemsArr = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    title: "پنت‌هاوس فرشته تهران",
    description: "چشم‌انداز پانوراما به رشته کوه توچال با روف‌گاردن ۴ فصل، استخر معلق شیشه‌ای و سالن سینمای اختصاصی.",
    tags: ["پنت‌هاوس", "تهران", "دید توچال", "استخر معلق"],
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    title: "کاخ‌ویلای باستی‌هیلز لواسان",
    description: "معماری ارگانیک با استخر اینفینیتی، باغ ژاپنی اختصاصی و هلی‌پد بر فراز دریاچه لواسان.",
    tags: ["باستی‌هیلز", "لواسان", "استخر اینفینیتی", "هلی‌پد"],
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    title: "عمارت نئوکلاسیک ولیعصر تبریز",
    description: "شاهکار سنگ تراورتن با تالار پذیرایی دوبلکس، آشپزخانه فول‌فرنیش آلمانی و سوئیت مهمان مجزا.",
    tags: ["تبریز", "نئوکلاسیک", "سنگ تراورتن", "سوئیت مستر"],
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    title: "باغ‌ویلای اشرافی قصردشت شیراز",
    description: "محوطه سرسبز ۳۰۰۰ متری در میان باغات اصیل، عمارت قاجاری بازسازی‌شده و سیستم هوشمند BMS.",
    tags: ["شیراز", "قصردشت", "باغ کهنسال", "BMS هوشمند"],
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    title: "رزیدنس بارانی گلسار رشت",
    description: "تراس‌گاردن ۲۵۰ متری رو به هوای دل‌انگیز شمال، سالن ورزشی اختصاصی و جکوزی ۸ نفره بیرونی.",
    tags: ["رشت", "گلسار", "تراس‌گاردن", "هوای بارانی"],
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    title: "برج‌باغ دیپلماتیک سجاد مشهد",
    description: "بالاترین طبقه با ارتفاع سقف ۴.۲ متر، سالن کنفرانس خصوصی، آسانسور خودرو و امنیت فوق‌پیشرفته.",
    tags: ["مشهد", "بلوار سجاد", "آسانسور خودرو", "سقف مرتفع"],
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    title: "باغ‌برج مروارید زاینده‌رود اصفهان",
    description: "تلفیق اصیل معماری صفوی با استانداردهای مدرن پایدار، دید مستقیم به زاینده‌رود و فضای سبز جلفا.",
    tags: ["اصفهان", "جلفا", "زاینده‌رود", "معماری پایدار"],
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    title: "کاخ‌ویلای فلت مهرشهر کرج",
    description: "یک هکتار محوطه محصور با درختان چنار، استخر سرپوشیده ۴ فصل و استبل اسب اختصاصی.",
    tags: ["کرج", "مهرشهر", "چهارفصل", "یک هکتار باغ"],
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80",
    title: "عمارت کوهستانی آبیدر سنندج",
    description: "قرار گرفته در بلندای مبارک‌آباد با پنجره‌های قدی سرتاسری و سکوت کوهستان کردستان.",
    tags: ["سنندج", "آبیدر", "دید کوهسار", "پلان تفکیکی"],
  },
  {
    id: 10,
    url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    title: "ویلاپارک اکولوژیک ناهارخوران گرگان",
    description: "طراحی مدرن اروپایی سازگار با اقلیم هیرکانی جنگل‌های شمال و متریال چوب ترمووود فنلاندی.",
    tags: ["گرگان", "ناهارخوران", "جنگل هیرکانی", "ترمووود"],
  },
  {
    id: 11,
    url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
    title: "دهکده سلامت ویلایی سبلان اردبیل",
    description: "دسترسی مستقیم به آبگرم معدنی اختصاصی، آب‌وهوای آلپی سرعین و طراحی اسکاندیناوی لوکس.",
    tags: ["اردبیل", "سبلان", "سرعین", "اسپا و تندرستی"],
  },
];

function Gallery({
  items,
  setIndex,
  setOpen,
  index,
}: {
  items: typeof itemsArr;
  setIndex: (index: number) => void;
  setOpen: (open: boolean) => void;
  index: number;
}) {
  return (
    <div className="rounded-2xl w-full max-w-[1320px] mx-auto md:gap-2.5 gap-1.5 flex justify-center pb-8 pt-4 overflow-x-auto no-scrollbar px-2">
      {items.slice(0, 11).map((item, i) => {
        const isSelected = index === i;
        return (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.96 }}
            className={`rounded-2xl relative cursor-pointer overflow-hidden shrink-0 transition-[width,border-color,box-shadow] ease-out duration-300 ${
              isSelected
                ? "w-[240px] sm:w-[300px] md:w-[360px] border-2 border-[#C9A84C] shadow-[0_12px_40px_rgba(201,168,76,0.35)]"
                : "xl:w-[72px] lg:w-[54px] md:w-[42px] sm:w-[28px] w-[18px] border border-white/10 opacity-75 hover:opacity-100 hover:border-[#C9A84C]/50"
            } h-[250px] sm:h-[290px] md:h-[330px]`}
            onMouseEnter={() => {
              setIndex(i);
            }}
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          >
            <img
              src={item?.url}
              alt={item.title}
              className="h-full w-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 text-right font-['Vazirmatn_FD','Vazirmatn',sans-serif]">
                <div className="text-[#E4C675] text-[10px] sm:text-xs font-bold mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-ping" />
                  <Sparkles className="w-3 h-3 text-[#C9A84C]" />
                  <span>تور مجازی سه‌بعدی (کلیک برای بزرگنمایی)</span>
                </div>
                <h4 className="text-white font-black text-sm sm:text-base md:text-lg truncate drop-shadow-md">
                  {item.title}
                </h4>
                <p className="text-white/85 text-xs line-clamp-2 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function AccordionModal() {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative w-full">
      <Gallery
        items={itemsArr}
        index={index}
        setIndex={setIndex}
        setOpen={setOpen}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="overlay"
            className="bg-black/85 backdrop-blur-xl fixed inset-0 z-[9999] top-0 left-0 bottom-0 right-0 w-full h-full flex items-center justify-center p-4"
            onClick={() => {
              setOpen(false);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute -top-12 left-0 sm:-left-2 p-2 rounded-full bg-white/10 hover:bg-[#C9A84C] text-white hover:text-[#1A1A2E] transition-colors cursor-pointer z-10"
                aria-label="بستن"
              >
                <X className="w-5 h-5" />
              </button>
              <motion.div
                layoutId={itemsArr[index].id}
                className="w-full h-[420px] sm:h-[500px] rounded-3xl relative cursor-default overflow-hidden border border-[#C9A84C]/50 shadow-[0_25px_70px_rgba(0,0,0,0.8)]"
              >
                <img
                  src={itemsArr[index].url}
                  alt={itemsArr[index].title}
                  className="rounded-3xl h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <article className="bg-[#1A1A2E]/92 backdrop-blur-md absolute bottom-0 left-0 right-0 rounded-b-3xl p-5 text-right border-t border-[#C9A84C]/30 font-['Vazirmatn_FD','Vazirmatn',sans-serif]">
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    {itemsArr[index].tags.map((tag: string, tidx: number) => (
                      <span
                        key={tidx}
                        className="bg-[#C9A84C]/20 border border-[#C9A84C]/35 text-[#E4C675] text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <motion.h3
                    initial={{ scaleY: 0.2 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0.2 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="text-xl sm:text-2xl font-black text-white"
                  >
                    {itemsArr[index].title}
                  </motion.h3>
                  <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ scaleY: -10, opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    className="text-sm leading-relaxed text-white/80 py-2.5"
                  >
                    {itemsArr[index].description}
                  </motion.p>
                </article>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
