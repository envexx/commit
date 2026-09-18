# GLOBAL DESIGN SYSTEM & FRONTEND SPECIFICATION (DESIGN.md)

## 1. Tech Stack &amp; Recommended Libraries

AI Agent wajib menggunakan kombinasi *library* modern berikut untuk memastikan performa, aksesibilitas, dan estetika visual yang konsisten:

- **CSS Framework:** Tailwind CSS (v3/v4)
- **Component UI Base:** Shadcn UI / Radix UI Primitives
- **Icon System:** Lucide React (Ikon antarmuka) &amp; Simple Icons (Ikon merek/sosial)
- **Animation &amp; Motion:** Framer Motion (untuk animasi alur/scroll) atau CSS Transitions
- **Class Utilities:** `clsx` dan `tailwind-merge` (untuk penggabungan *class* dinamis)
- **Font Engine:** `next/font` atau Google Fonts (Font Utama: *Inter* / *Plus Jakarta Sans*)

---

## 2. Design Tokens &amp; Visual FX Engine

### 2.1 Color Palette System

- **Background Base Dark (Hero, Timeline, Footer):** `#08080A` s/d `#0D0D10`
- **Background Base Light (Bento Grid, Feature Matrix):** `#FFFFFF` / Light Gray `#F4F4F6`
- **Primary Accent Color (Brand Glow):** Dynamic Hex (Default: Vibrant Orange `#FF5500` / `#FF7700` atau disesuaikan dengan warna utama proyek)
- **Card Dark Surface:** `#121215` (Border: `1px solid rgba(255, 255, 255, 0.08)`)
- **Card Light Surface:** `#FFFFFF` (Border: `1px solid #E4E4E7`)
- **Typography Scale:**
  - Dark Surface: Main `#FFFFFF`, Muted `#A1A1AA`
  - Light Surface: Main `#09090B`, Muted `#71717A`

### 2.2 Visual FX &amp; Lighting Rules (Mandatory)

- **Glowing Ribbon / Wave Accent:**
  - Gunakan elemen SVG path dengan stroke gradien warna *Primary Accent*.
  - Efek pencahayaan: `filter: drop-shadow(0px 0px 35px VAR_PRIMARY_ACCENT_60)` dipadu latar *blur* `blur-3xl opacity-40`.
- **Glassmorphic Surface:**
  - Efek navigasi &amp; kartu melayang: `backdrop-blur-xl bg-black/70 border-b border-white/10`.
- **Primary CTA Glow Button:**
  - Tombol kapsul `rounded-full`) dengan `box-shadow: 0px 0px 24px VAR_PRIMARY_ACCENT_50`.
  - Animasi *hover*: perbesar *shadow radius* dan geser ikon panah `->`) sejauh `translateX(4px)`.
- **Giant Watermark Typography:**
  - Teks nama merek raksasa `text-[8rem]` s/d `text-[12rem]`) di area *Hero*, opasitas 8–12%, `font-weight: 900`, `tracking-tighter`, non-interactive `pointer-events-none`).

---

## 3. Layout Geometry &amp; Architecture Rules

### 3.1 Global Grid &amp; Spacing Constraints

- **Max Container Width:** `max-w-7xl` (1280px) terpusat `mx-auto`).
- **Horizontal Padding:** `px-4 sm:px-6 lg:px-8`.
- **Vertical Section Spacing:** Spasi antar-seksi wajib menggunakan `py-16 md:py-24`.
- **Card Corner Radius Standard:**
  - Kartu Bento / Modul Utama: `rounded-3xl` (24px)
  - Kartu Kecil / Ticker: `rounded-2xl` (16px)
  - Tombol / Badges: `rounded-full` (9999px)

---

## 4. Page Architecture Blueprint (Top to Bottom)

### SECTION 1: Sticky Navigation Header

- **Layout:** Flex row `justify-between`), `h-16`, `sticky top-0`, `z-50`, *glassmorphism*.
- **Left:** Logo `[BRAND_ICON] [PROJECT_NAME]` (Teks tebal + Ikon).
- **Center:** Menu navigasi ringkas dengan penanda *dropdown* `[LINK_1] ⬇`, `[LINK_2] ⬇`).
- **Right:** Primary CTA Button `rounded-full`, *accent glow*, teks: `[PRIMARY_ACTION] →`).

### SECTION 2: Hero Section (Dark Canvas)

- **Background Layer:** *Glowing ribbon wave* diagonal + *ambient glow* di sudut kanan atas.
- **Main Headline (H1):** Teks tebal, bersih, tanpa serif `text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight`).

  &gt; `[Pernyataan Nilai Utama Proyek dalam 1-2 Baris]`
- **Sub-headline / Tagline:** Teks penjelas singkat `text-lg text-zinc-400`).

  &gt; `[Penjelasan Tambahan Mengenai Solusi yang Diberikan Proyek]`
- **Primary Action (Bottom-Left):** Tombol CTA bercahaya `[PRIMARY_ACTION] →`).
- **Watermark Layer (Bottom-Right):** Teks merek raksasa `[PROJECT_NAME]` semi-transparan yang memotong batas bawah *hero section*.

### SECTION 3: Update &amp; Announcement Ticker (4-Column Grid)

- **Container:** Grid horizontal `grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4`, latar terang `#F4F4F6`).
- **Header:** Judul seksi terpusat (misal: "Latest Updates" / "Key Metrics").
- **Card Item:**
  - Latar `#FFFFFF`, `rounded-2xl`, `p-4`, *hover: -translate-y-1 transition*.
  - Ikon fitur/kategori + Judul ringkas 1 baris + Timestamp/Nilai statistik `text-xs text-zinc-500`).

### SECTION 4: Core Feature Bento Grid (Light Canvas)

Susun fitur utama dalam tata letak *asymmetric bento box*:

- **Row 1:**
  - **Left Card (1/3 Width - Solid Accent Highlight):** Latar *Primary Accent*, teks putih tebal `[Highlight Feature Title]`.
  - **Right Card (2/3 Width - Main Feature Intro):** Latar putih dengan ikon utama, H3 `[Secondary Feature Title]`, dan teks deskripsi.
- **Row 2:**
  - **Left Card (1/2 Width):** Latar putih dengan ikon *Shield/Check*, H3 `[Value Prop A]`, dan deskripsi.
  - **Right Card (1/2 Width - Dark Accent):** Latar gelap `#0A0A0B`), ikon *Primary Accent*, H3 `[Value Prop B]`, dan deskripsi.

### SECTION 5: Process / Value Timeline Module (Dark Card Module)

- **Container:** Modul gelap melengkung `bg-[#0D0D0F] rounded-3xl p-8 md:p-12 relative overflow-hidden`).
- **Header Split:** Kiri (H2 "Why [PROJECT_NAME]?"), Kanan (Deskripsi konsep utama).
- **Vertical Timeline System:**
  - Garis vertikal bercahaya `w-0.5 bg-gradient-to-b from-[PRIMARY_ACCENT] to-transparent`).
  - **Node Steps (1 s/d 3):** Titik *node glowing* + Judul Tahap + Deskripsi + *Badge Tag* `[TAG_NAME] →`).
- **Bottom Action:** CTA tombol bercahaya `[ACTION_TEXT] →`.

### SECTION 6: Capability Matrix &amp; Ecosystem Grid

- **Layout:** 2 Kolom utama (Kiri: *Value Propositions*, Kanan: *App/Integration Cards Matrix*).
- **Left Column:** Judul seksi utama + Daftar 4 poin manfaat dengan ikon minimalis.
- **Right Column:** Grid 2x2 kartu-kartu kecil interaktif berisi logo integrasi/fitur pendukung, nama, dan deskripsi singkat.

### SECTION 7: Spotlight Feature Showcase

- **Container:** Kartu abu-abu terang `bg-[#F4F4F6] rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 align-center gap-8`).
- **Left Component:** Graphic/UI Preview berupa kartu aset berlapis (*Stacked Card Effect*) dengan *drop-shadow* tebal.
- **Right Content:** H3 `[Spotlight Title]`, deskripsi mendalam, serta *Dual Action Buttons* (Tombol Accent + Tombol Outline Docs).

### SECTION 8: Community &amp; Social Engagement Hub

- **Container:** Modul gelap `bg-[#121215] rounded-2xl p-8 text-center`).
- **Title:** "Join the Community" / "Get in Touch".
- **Grid 3 Kolom Social Links:** Kartu interaktif untuk saluran komunikasi (misal: Discord, X/Twitter, Telegram, atau Email) dengan ikon masing-masing dan efek *hover border glow*.

### SECTION 9: Global Footer

- **Background:** Dark base dengan *ambient glow bar* di garis paling bawah.
- **Top Bar:** Logo merek di kiri, kolom navigasi terstruktur di kanan (*Explore*, *Resources*, *Legal*).
- **Bottom Legal Bar:** Copyright di kiri, Tautan Kebijakan Privasi &amp; Syarat Ketentuan di kanan.

---

## 5. Micro-Interactions &amp; UI State Checklist (Mandatory for AI)

AI Agent wajib memastikan fitur berikut berfungsi secara teknis:

- [ ] **Interactive Hover:**
  - Semua tombol CTA memiliki perpindahan panah `translateX(4px)`).
  - Semua kartu Bento dan Ticker terangkat halus saat kursor di atasnya `-translate-y-1 transition-transform duration-200`).

- [ ] **Loading States:** Sediakan *Skeleton Screen* `animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg`) saat data dari API/backend belum siap.

- [ ] **Empty States:** Tampilan komponen khusus saat data kosong (misal: "No Updates Available").

- [ ] **Error States:** Penanganan eror visual menggunakan komponen *Toast* atau *Inline Badge* warna kontras.

- [ ] **Breakpoints Responsif:**
  - *Mobile (&lt; 768px):* Grid otomatis berubah menjadi 1 kolom `grid-cols-1`), navigasi atas berubah menjadi *mobile menu drawer*.
  - *Desktop (&gt;= 1024px):* Mengaktifkan tata letak multi-kolom bento grid secara presisi.

