import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
  EyeOff,
  Eye,
  CheckCircle2,
  Crown,
  Key,
  Mail,
  User,
  Shield,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  AdminUser,
  SUPER_ADMIN_EMAIL,
  getStoredAdmins,
  saveStoredAdmins,
  getAdminVisibilitySettings,
  saveAdminVisibilitySettings,
} from '../../data/admins';
import { UserProfile } from '../../types';
import { getCurrentAdminSession } from '../../services/supabaseAuth';

interface AdminManagementTabProps {
  currentUser: UserProfile | null;
  onShowToast: (title: string, message: string) => void;
  onAdminsUpdated?: () => void;
}

export function AdminManagementTab({
  currentUser,
  onShowToast,
  onAdminsUpdated,
}: AdminManagementTabProps) {
  const [admins, setAdmins] = useState<AdminUser[]>(() => getStoredAdmins());
  const [visibilitySettings, setVisibilitySettings] = useState(() =>
    getAdminVisibilitySettings()
  );

  // Sync with Supabase API
  useEffect(() => {
    const loadAdminsFromApi = async () => {
      try {
        const session = await getCurrentAdminSession();
        if (session.token) {
          const res = await fetch('/api/admin/users', {
            headers: { Authorization: `Bearer ${session.token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.admins && Array.isArray(data.admins) && data.admins.length > 0) {
              setAdmins(data.admins);
              saveStoredAdmins(data.admins);
            }
          }
        }
      } catch (e) {
        console.warn('Could not sync admins from API:', e);
      }
    };
    loadAdminsFromApi();
  }, []);

  // New admin form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'superadmin' | 'admin' | 'editor'>(
    'admin'
  );
  const [formError, setFormError] = useState('');

  // Handle Add Admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    const cleanName = newName.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('لطفاً یک آدرس ایمیل معتبر وارد کنید.');
      return;
    }

    if (admins.some((a) => a.email.toLowerCase() === cleanEmail)) {
      setFormError('این ایمیل قبلاً به عنوان مدیر ثبت شده است.');
      return;
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      email: cleanEmail,
      name: cleanName || cleanEmail.split('@')[0],
      role: newRole,
      addedAt: new Date().toISOString(),
    };

    const updated = [...admins, newAdmin];
    setAdmins(updated);
    saveStoredAdmins(updated);
    setNewEmail('');
    setNewName('');
    setFormError('');
    onAdminsUpdated?.();

    // Call API with Supabase token
    try {
      const session = await getCurrentAdminSession();
      if (session.token) {
        await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify(newAdmin),
        });
      }
    } catch (e) {
      console.warn('Failed to sync admin to backend:', e);
    }

    onShowToast(
      'مدیر جدید با موفقیت اضافه شد',
      `کاربر با ایمیل «${cleanEmail}» به عنوان ${
        newRole === 'superadmin' ? 'مدیر ارشد' : 'مدیر محتوا'
      } سیستم دسترسی یافت.`
    );
  };

  // Handle Delete Admin
  const handleDeleteAdmin = async (id: string, email: string) => {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      onShowToast(
        'غیرقابل حذف',
        'شخص شخیص شما (Super Admin) تحت هیچ شرایطی قابل حذف نمی‌باشد.'
      );
      return;
    }

    const updated = admins.filter((a) => a.id !== id);
    setAdmins(updated);
    saveStoredAdmins(updated);
    onAdminsUpdated?.();

    // Call API with Supabase token
    try {
      const session = await getCurrentAdminSession();
      if (session.token) {
        await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
      }
    } catch (e) {
      console.warn('Failed to sync admin deletion to backend:', e);
    }

    onShowToast(
      'حذف دسترسی مدیر',
      `دسترسی کاربر با ایمیل «${email}» از پنل ادمین حذف گردید.`
    );
  };

  // Handle Toggle Strict Hide Mode
  const handleToggleHide = () => {
    const nextVal = !visibilitySettings.hideFromNonAdmins;
    const nextSettings = { hideFromNonAdmins: nextVal };
    setVisibilitySettings(nextSettings);
    saveAdminVisibilitySettings(nextSettings);
    onAdminsUpdated?.();

    onShowToast(
      nextVal ? 'حالت مخفی‌سازی کامل فعال شد' : 'دکمه برای همه نمایان شد',
      nextVal
        ? 'دکمه‌های پنل مدیریت برای کاربران عادی و مهمان‌ها کاملاً پنهان شد و فقط شخص شما پس از ورود آن را می‌بینید.'
        : 'دکمه پنل ادمین به صورت عمومی نمایش داده خواهد شد.'
    );
  };

  return (
    <div className="p-4 sm:p-6 text-right space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-white/10">
        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#C9A84C]" />
          <span>مدیریت مدیران و امنیت سیستم (Admin Security Access)</span>
        </h3>
        <p className="text-xs text-white/60 mt-1">
          مدیریت اشخاص دارای دسترسی به پنل مدیریت و تنظیمات پنهان‌سازی دکمه‌ها
          برای کاربران عادی.
        </p>
      </div>

      {/* 1. Super Admin Card (شخص شخیص شما) */}
      <div className="bg-gradient-to-r from-[#1A1A2E] to-[#16213E] border-2 border-[#C9A84C] rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 bg-[#C9A84C] text-[#1A1A2E] text-[10px] font-black px-4 py-1 rounded-br-xl flex items-center gap-1 shadow">
          <Crown className="w-3.5 h-3.5" />
          <span>شخص شخیص شما (مدیر کل مادام‌العمر)</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A84C] text-[#1A1A2E] flex items-center justify-center font-black text-lg shadow-md border-2 border-white/20">
              👑
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span>مالک و سوپر ادمین اصلی</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  محافظت شده
                </span>
              </div>
              <div className="text-xs font-mono text-[#E4C675] mt-0.5" dir="ltr">
                {SUPER_ADMIN_EMAIL}
              </div>
            </div>
          </div>

          <div className="text-left text-xs text-white/70 bg-white/5 p-3 rounded-xl border border-white/10 max-w-sm">
            شما با این ایمیل همیشه به تمام قسمت‌های پنل مدیریت، دیتابیس، املاک و
            ویرایشگر زنده دسترسی ۱۰۰٪ و نامحدود دارید.
          </div>
        </div>
      </div>

      {/* 2. Privacy & Strict Visibility Toggle (پاسخ سوال دوم کاربر) */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
          <div className="space-y-1">
            <div className="text-sm font-black text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[#C9A84C]" />
              <span>پنهان‌سازی دکمه پنل ادمین برای سایر کاربران (فقط شخص شما)</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed max-w-2xl">
              با فعال بودن این گزینه، دکمه‌های «پنل ادمین» و «ویرایشگر زنده» در
              نوار بالای سایت (Navbar)، منوی کشویی و منوی موبایل برای تمام کاربران
              عادی و مهمان‌ها کاملاً <strong className="text-white">پنهان و غیرقابل مشاهده</strong> خواهد شد. تنها شما (با ایمیل{' '}
              <span className="text-[#E4C675] font-mono" dir="ltr">
                {SUPER_ADMIN_EMAIL}
              </span>
              ) یا ادمین‌های تاییدشده در لیست زیر، پس از ورود دکمه را می‌بینید.
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggleHide}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border shrink-0 ${
              visibilitySettings.hideFromNonAdmins
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-white/10 border-white/20 text-white/70 hover:text-white'
            }`}
          >
            {visibilitySettings.hideFromNonAdmins ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>پنهان‌سازی فعال است (کاملاً امن)</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>پنهان‌سازی غیرفعال (دکمه عمومی است)</span>
              </>
            )}
          </button>
        </div>

        {/* Emergency instructions */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
          <Key className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
          <div>
            <strong>کلید میانبر اضطراری برای ورود شما:</strong> در هر صفحه‌ای از
            سایت که باشید، با فشردن کلیدهای ترکیبی{' '}
            <kbd className="px-2 py-0.5 rounded bg-black/40 text-[#E4C675] font-mono border border-white/20">
              Ctrl + Shift + A
            </kbd>{' '}
            یا{' '}
            <kbd className="px-2 py-0.5 rounded bg-black/40 text-[#E4C675] font-mono border border-white/20">
              Alt + A
            </kbd>{' '}
            پنل ادمین فوراً باز می‌شود حتی اگر وارد حساب نشده باشید!
          </div>
        </div>
      </div>

      {/* 3. Add New Admin Form (پاسخ سوال سوم کاربر: چگونه ادمین اضافه کنم؟) */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="pb-2 border-b border-white/10 flex items-center justify-between">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#C9A84C]" />
            <span>افزودن ادمین جدید به سایت (Add New Admin)</span>
          </h4>
          <span className="text-[11px] text-white/50">
            با وارد کردن ایمیل گوگل فرد مورد نظر
          </span>
        </div>

        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C9A84C]" />
                ایمیل گوگل ادمین (Gmail)
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (formError) setFormError('');
                }}
                placeholder="example@gmail.com"
                dir="ltr"
                required
                className="w-full bg-[#1A2234] border border-white/10 focus:border-[#C9A84C] text-white text-xs px-3.5 py-2.5 rounded-xl outline-none font-mono"
              />
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C9A84C]" />
                نام و عنوان ادمین
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثلاً مهندس رضایی"
                className="w-full bg-[#1A2234] border border-white/10 focus:border-[#C9A84C] text-white text-xs px-3.5 py-2.5 rounded-xl outline-none"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#C9A84C]" />
                سطح دسترسی (نقش)
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full bg-[#1A2234] border border-white/10 text-white text-xs px-3 py-2.5 rounded-xl outline-none"
              >
                <option value="admin">مدیر سایت (Full Admin)</option>
                <option value="editor">مدیر محتوا و املاک (Editor)</option>
                <option value="superadmin">مدیر ارشد (Super Admin)</option>
              </select>
            </div>
          </div>

          {formError && (
            <p className="text-xs text-rose-400 font-bold">{formError}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A07830] via-[#C9A84C] to-[#E4C675] text-[#1A1A2E] text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>ثبت و اعطای دسترسی به این ادمین</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Admins List */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C9A84C]" />
            <span>لیست مدیران دارای دسترسی فعال ({admins.length} نفر)</span>
          </h4>
        </div>

        <div className="space-y-2">
          {admins.map((admin) => {
            const isMaster =
              admin.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
            return (
              <div
                key={admin.id}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between flex-wrap gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                      isMaster
                        ? 'bg-[#C9A84C] text-[#1A1A2E]'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {isMaster ? '👑' : admin.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <span>{admin.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isMaster
                            ? 'bg-[#C9A84C]/20 text-[#E4C675] border border-[#C9A84C]/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {admin.role === 'superadmin'
                          ? 'مدیر ارشد'
                          : admin.role === 'editor'
                          ? 'ویرایشگر محتوا'
                          : 'مدیر سایت'}
                      </span>
                    </div>
                    <div
                      className="text-[11px] font-mono text-white/60"
                      dir="ltr"
                    >
                      {admin.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isMaster ? (
                    <span className="text-[11px] text-[#C9A84C] font-bold bg-[#C9A84C]/10 px-3 py-1 rounded-lg border border-[#C9A84C]/20">
                      شخص شخیص شما (غیرقابل حذف)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteAdmin(admin.id, admin.email)
                      }
                      className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold flex items-center gap-1.5 border border-rose-500/30 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف دسترسی</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
