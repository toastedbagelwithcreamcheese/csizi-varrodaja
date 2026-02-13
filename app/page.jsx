"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Phone, MapPin, Mail, Instagram, Facebook, Clock, Star, Menu, X, ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { FiPhone } from "react-icons/fi";

const categories = [
  { id: "all", label: "Összes munka" },
  { id: "eskuvo", label: "Esküvő & Koszorúslány" },
  { id: "szalagavato", label: "Szalagavató" },
  { id: "egyeb", label: "Egyéb" },
];

const services = [
  { title: "Egyedi Tervezés", desc: "Álmaid ruhája méretre szabva, az elképzeléseid alapján.", icon: <Scissors className="w-6 h-6" /> },
  { title: "Ruhaigazítás", desc: "Szűkítés, felhajtás, cipzárcsere – hogy tökéletesen álljon.", icon: <Star className="w-6 h-6" /> },
  { title: "Lakástextil", desc: "Függönyök, díszpárnák és egyéb kiegészítők varrása.", icon: <Clock className="w-6 h-6" /> },
];

// --- KOMPONENSEK ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [callModalOpen, setCallModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (window.scrollY > 50) setMobileMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Kezdőlap", href: "#hero" },
    { name: "Rólam", href: "#rolunk" }, // ÁTÍRVA: Rólunk -> Rólam
    { name: "Munkáim", href: "#galeria" }, // ÁTÍRVA: Munkáink -> Munkáim
    { name: "Kapcsolat", href: "#kapcsolat" },
  ];

  return (
    <>
      <motion.header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
        <motion.nav
          layout
          initial={{ y: -100, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            width: scrolled ? "90%" : "100%",
            maxWidth: scrolled ? "1000px" : "1280px",
            borderRadius: scrolled ? "9999px" : "0px",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`
            flex items-center justify-between px-6 py-3 transition-colors duration-300
            ${scrolled 
              ? "bg-white/90 backdrop-blur-md shadow-xl border border-white/20" 
              : "bg-transparent"
            }
          `}
        >
          <a href="#" className="flex items-center gap-3">
             <div className="relative w-10 h-10 md:w-12 md:h-12">
               <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
             </div>
             <span className={`font-serif font-bold text-stone-800 text-lg md:text-xl ${scrolled ? "opacity-100" : "opacity-100 md:text-stone-900"} transition-opacity`}>
               Csizi Varrodája
             </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onMouseEnter={() => setHoveredLink(link.href)}
                onMouseLeave={() => setHoveredLink(null)}
                className="relative px-4 py-2 text-sm font-medium transition-colors"
              >
                {hoveredLink === link.href && (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 bg-rose-100 rounded-full -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${hoveredLink === link.href ? "text-rose-700" : "text-stone-700"}`}>
                  {link.name}
                </span>
              </a>
            ))}
            
            <button 
              onClick={() => setCallModalOpen(true)}
              className={`ml-4 px-6 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-sm hover:shadow-md cursor-pointer
                ${scrolled 
                  ? "bg-rose-600 text-white hover:bg-rose-700" 
                  : "bg-stone-900 text-white hover:bg-stone-800"
                }`}
            >
              Hívjon most!
            </button>
          </div>

          <button className="md:hidden p-2 text-stone-800 bg-white/50 rounded-full backdrop-blur-sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </motion.nav>
      </motion.header>

      {/* MOBIL MENÜ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-24 z-40 md:hidden bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-stone-700 hover:text-rose-600 transition-colors border-b border-stone-100 pb-2 last:border-0">
                  {link.name}
                </a>
              ))}
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCallModalOpen(true);
                }}
                className="bg-rose-600 text-white text-center py-3 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-transform w-full"
              >
                Hívjon most!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HÍVÁS MEGERŐSÍTŐ MODÁL */}
      <AnimatePresence>
        {callModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCallModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white p-8 rounded-3xl shadow-2xl w-[90%] max-w-sm text-center border border-stone-100"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone size={32} />
              </div>
              
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Hívás indítása</h3>
              <p className="text-stone-500 mb-8">Biztosan felhívja a Csizi Varrodáját?</p>
              
              <div className="flex flex-col gap-3">
                <a 
                  href="tel:+36306227855"
                  className="w-full bg-rose-600 text-white font-bold py-3.5 rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                  onClick={() => setCallModalOpen(false)} 
                >
                  <Phone size={18} />
                  Igen, hívás indítása
                </a>
                
                <button 
                  onClick={() => setCallModalOpen(false)}
                  className="w-full bg-stone-100 text-stone-600 font-bold py-3.5 rounded-xl hover:bg-stone-200 transition-colors"
                >
                  Mégsem
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const SectionHeading = ({ title, subtitle }) => (
  <div className="text-center mb-16">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-5xl font-serif font-bold text-stone-800 mb-4"
    >
      {title}
    </motion.h2>
    <div className="w-20 h-1.5 bg-rose-600 mx-auto rounded-full mb-6"></div>
    <p className="text-stone-500 max-w-2xl mx-auto text-lg">{subtitle}</p>
  </div>
);

// --- ÚJ GALÉRIA KOMPONENS (SUPABASE BEKÖTÉSSEL) ---
const Gallery = () => {
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState([]); // Itt tároljuk a letöltött képeket
  const [loading, setLoading] = useState(true);

  // Képek letöltése a Supabase-ből
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .order('created_at', { ascending: false }); // Legújabb elől

        if (error) throw error;

        if (data) {
          setItems(data);
        }
      } catch (error) {
        console.error("Hiba a képek betöltésekor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Szűrés logika
  const filteredItems = filter === "all" 
    ? items 
    : items.filter(item => item.category === filter);

  return (
    <section id="galeria" className="py-24 bg-stone-50">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title="Munkáim" 
          subtitle="Válogatás az általam készített ruhákból és átalakításokból."
        />
        
        {/* SZŰRŐ GOMBOK */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                filter === cat.id
                  ? "bg-rose-600 text-white border-rose-600 shadow-lg scale-105"
                  : "bg-white text-stone-600 border-stone-200 hover:border-rose-300 hover:bg-rose-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {loading ? (
           <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
           </div>
        ) : (
          /* KÉPEK GRID */
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div 
                  layout
                  key={item.id} // Supabase ID a kulcs
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow bg-white"
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                      <Image 
                          src={item.src} 
                          alt={item.category} 
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                          <span className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                            {categories.find(c => c.id === item.category)?.label}
                          </span>
                      </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        
        {/* Ha nincs kép */}
        {!loading && items.length === 0 && (
            <p className="text-center text-stone-400 mt-10">Jelenleg nincsenek feltöltött képek.</p>
        )}
      </div>
    </section>
  );
};

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" }); 
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] text-stone-900 shadow-2xl h-fit">
      <h3 className="text-2xl font-bold font-serif mb-6">Írjon nekem üzenetet</h3> {/* ÁTÍRVA */}
      
      {status === "success" ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h4 className="text-xl font-bold mb-2">Sikeres küldés!</h4>
          <p>Köszönöm üzenetét, hamarosan válaszolok.</p> {/* ÁTÍRVA: válaszolok */}
          <button onClick={() => setStatus("idle")} className="mt-4 text-sm font-bold text-green-700 underline">Új üzenet küldése</button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Név</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all" 
              placeholder="Az Ön neve" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Email cím</label>
            <input 
              required
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all" 
              placeholder="pelda@email.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Miben segíthetek?</label> {/* ÁTÍRVA */}
            <textarea 
              required
              rows="4" 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all" 
              placeholder="Írja le kérését..."
            ></textarea>
          </div>
          
          {status === "error" && (
            <p className="text-red-600 text-sm text-center font-medium">Hiba történt a küldéskor. Kérjük próbálja újra később, vagy hívjon telefonon.</p>
          )}

          <button 
            type="submit" 
            disabled={status === "loading"}
            className="w-full bg-rose-600 text-white font-bold py-4 rounded-xl hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {status === "loading" ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Küldés folyamatban...
              </>
            ) : "Üzenet elküldése"}
          </button>
        </form>
      )}
    </div>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 selection:bg-rose-200 selection:text-rose-900">
      <Navbar />

      {/* HERO SZEKCIÓ */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-stone-100 z-0">
            <div className="absolute inset-0 bg-[url('/images/hero.png')] bg-cover bg-center opacity-40 blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-stone-50"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/30 backdrop-blur-sm p-8 md:p-12 rounded-[3rem] border border-white/40 shadow-xl"
          >
            {/* ÁTÍRVA: 1996 óta bekerült */}
            <span className="text-rose-700 font-bold tracking-widest uppercase text-sm mb-6 block">
              Minőség • Precizitás • 1996 óta
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 mb-6 leading-tight drop-shadow-sm">
              Ruhák, amelyek <br/> <span className="text-rose-600">rólad</span> mesélnek
            </h1>
            {/* ÁTÍRVA: 30 éves tapasztalat kiemelve */}
            <p className="text-lg text-stone-800 font-medium mb-8 max-w-2xl mx-auto leading-relaxed">
              Több mint <span className="font-bold text-rose-700">30 éves szakmai tapasztalattal</span> vállalok egyedi tervezést, javítást és átalakítást, hogy ruháid tökéletesek legyenek.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#galeria" className="bg-stone-900 text-white px-8 py-4 rounded-full font-bold hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-500/30 flex items-center justify-center gap-2">
                Munkáim <ArrowRight size={18} />
              </a>
              <a href="#kapcsolat" className="bg-white text-stone-900 px-8 py-4 rounded-full font-bold hover:bg-stone-50 transition-all shadow-md flex items-center justify-center">
                Kapcsolat
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RÓLAM SZEKCIÓ (Régen Rólunk) */}
      <section id="rolunk" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="relative h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-stone-50"
            >
               <Image 
                src="/images/csizi.png" 
                alt="Munka közben" 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
            
            <div>
              <span className="text-rose-600 font-bold mb-2 block uppercase tracking-wider">RÓLAM</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">
                Minden öltésben ott a <span className="text-rose-600 italic">gondoskodás</span>
              </h2>
              {/* ÁTÍRVA: A megrendelő szövege */}
              <div className="text-stone-600 mb-8 leading-relaxed text-lg space-y-4">
                <p>
                  Varrónőként <span className="font-bold text-stone-800">1996 óta dolgozom</span> és azóta is szenvedélyem a varrás. 
                  Szakmámban mindent megalkotok, legyen szó menyasszonyi ruháról, szalagavató ruháról, vagy akár egyedi tervezésű ruhadarabokról.
                </p>
                <p>
                  Emellett vállalom ruhák javítását, átalakítását is, hogy kedvenc darabjai újra tökéletesek legyenek. 
                  Minden egyes darabot szívvel-lélekkel készítek, hogy Ön elégedett legyen a végeredménnyel. 
                  Ha egyedi, minőségi ruhát keres, forduljon hozzám bizalommal!
                </p>
              </div>
              
              <div className="space-y-6">
                {services.map((service, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 241, 242, 0.5)" }}
                    className="flex gap-5 items-start p-4 rounded-2xl transition-all hover:shadow-lg border border-transparent hover:border-rose-100"
                  >
                    <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 shadow-sm">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-stone-900 mb-1">{service.title}</h3>
                      <p className="text-stone-500">{service.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTEREZHETŐ GALÉRIA */}
      <Gallery />

      {/* KAPCSOLAT */}
      <section id="kapcsolat" className="py-24 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Keressen bizalommal!</h2> {/* ÁTÍRVA */}
              <p className="text-stone-400 mb-10 text-lg leading-relaxed">
                Legyen szó egy egyszerű felhajtásról vagy álmai ruhájának megvalósításáról.
                Hívjon engem, vagy látogasson el műhelyembe nyitvatartási időben. {/* ÁTÍRVA: engem/műhelyembe */}
              </p>
              
              <div className="space-y-8">
                <a href="tel:+36306227855" className="flex items-center gap-6 group cursor-pointer">
                  <div className="w-14 h-14 bg-stone-800 rounded-2xl flex items-center justify-center text-rose-500 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-lg">
                    <Phone />
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-1">Telefonszám (Kattintson a híváshoz)</p>
                    <p className="text-xl font-medium group-hover:text-rose-400 transition-colors">+36 30 622 7855</p>
                  </div>
                </a>
                
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-stone-800 rounded-2xl flex items-center justify-center text-rose-500 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-lg">
                    <MapPin />
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-1">Cím</p>
                    <p className="text-xl font-medium">8921 Zalaszentiván, Zrínyi utca 60.</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-stone-800 rounded-2xl flex items-center justify-center text-rose-500 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-lg shrink-0">
                    <Clock />
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-1">Nyitvatartás</p>
                    <ul className="text-lg font-medium space-y-1">
                        <li className="flex justify-between gap-8"><span className="text-stone-400">Hétfő - Péntek:</span> <span>08:00 - 17:00</span></li>
                        <li className="flex justify-between gap-8"><span className="text-stone-400">Szombat - Vasárnap:</span> <span className="text-rose-400">Zárva</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-12">
                <a href="#" className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center hover:bg-rose-600 text-white transition-all hover:-translate-y-1 shadow-lg">
                    <Facebook size={22} />
                </a>
                <a href="#" className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center hover:bg-rose-600 text-white transition-all hover:-translate-y-1 shadow-lg">
                    <Instagram size={22} />
                </a>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* LÁBLÉC */}
      <footer className="bg-stone-950 text-stone-600 py-10 text-center text-sm border-t border-stone-900">
        <p>&copy; {new Date().getFullYear()} Csizi Varrodája. Minden jog fenntartva.</p>
        <div className="mt-2 flex items-center justify-center gap-2">
            <span>Az oldalt készítette:</span>
            <a 
              href="mailto:kapcsolat@kovacsbalintfoto.hu" 
              className="text-gray-500 hover:text-[#B76E79] font-medium transition-colors"
            >
              Kovács Bálint
            </a>
            <a 
              href="tel:+36308723777" 
              className="text-gray-500 hover:text-[#B76E79] transition-colors flex items-center" 
              aria-label="Telefonhívás"
            >
              <Phone size={16} />
            </a>
          </div>
        <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-rose-500 transition-colors">Adatkezelés</a>
            <a href="#" className="hover:text-rose-500 transition-colors">Impresszum</a>
        </div>
      </footer>
    </main>
  );
}