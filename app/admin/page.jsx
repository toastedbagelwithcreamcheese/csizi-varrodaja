"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Upload, X, Check, Loader2, Trash2, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // Feltöltés state-ek
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState("eskuvo"); 
  const [statusMessage, setStatusMessage] = useState("");

  // Törlés / Lista state-ek
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Éppen törölt kép ID-ja

  // --- BELÉPÉS ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Hibás jelszó!");
    }
  };

  // --- KÉPEK BETÖLTÉSE ---
  const fetchImages = async () => {
    setLoadingImages(true);
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false }); // Legfrissebb elől

      if (error) throw error;
      setGalleryImages(data || []);
    } catch (error) {
      console.error("Hiba a betöltéskor:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Ha belépett, töltsük be a képeket
  useEffect(() => {
    if (isAuthenticated) {
      fetchImages();
    }
  }, [isAuthenticated]);

  // --- FELTÖLTÉS ---
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setStatusMessage("Feltöltés indítása...");

    try {
      for (const file of files) {
        // Fájlnév generálás
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const filePath = `${category}/${fileName}`;

        // 1. Storage feltöltés
        const { error: uploadError } = await supabase.storage
          .from("portfolio")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. URL lekérés
        const { data: { publicUrl } } = supabase.storage
          .from("portfolio")
          .getPublicUrl(filePath);

        // 3. Adatbázis bejegyzés
        const { error: dbError } = await supabase
          .from("images")
          .insert([{ src: publicUrl, category: category, title: "" }]);

        if (dbError) throw dbError;
      }

      setStatusMessage("Sikeres feltöltés!");
      setFiles([]); 
      fetchImages(); // Frissítjük a listát feltöltés után!
      setTimeout(() => setStatusMessage(""), 3000);

    } catch (error) {
      console.error(error);
      setStatusMessage("Hiba történt: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- TÖRLÉS ---
  const handleDelete = async (id, src) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a képet?")) return;

    setDeletingId(id);

    try {
      // 1. Kinyerjük a fájl útvonalát az URL-ből a Storage törléshez
      // Az URL valami ilyesmi: .../portfolio/eskuvo/kepnev.jpg
      // Nekünk csak ez kell: eskuvo/kepnev.jpg
      const path = src.split('/portfolio/')[1];

      if (path) {
        const { error: storageError } = await supabase.storage
          .from('portfolio')
          .remove([path]);
        
        if (storageError) console.error("Storage hiba:", storageError);
      }

      // 2. Törlés az adatbázisból
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Lista frissítése helyben (nem kell újratölteni az egészet)
      setGalleryImages(prev => prev.filter(img => img.id !== id));

    } catch (error) {
      alert("Hiba a törléskor: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // --- LOGIN KÉPERNYŐ ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <h1 className="text-2xl font-serif font-bold mb-6 text-stone-900">Admin Belépés</h1>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-stone-200 rounded-lg mb-4 focus:ring-2 focus:ring-rose-500 outline-none"
            placeholder="Jelszó"
          />
          <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold hover:bg-rose-600 transition-colors">
            Belépés
          </button>
        </form>
      </div>
    );
  }

  // --- ADMIN FELÜLET ---
  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-serif font-bold text-stone-900">Adminisztráció</h1>
            <button onClick={() => setIsAuthenticated(false)} className="text-rose-600 font-bold underline">Kilépés</button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* BAL OLDAL: FELTÖLTÉS */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-stone-100 h-fit">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload size={20} /> Új képek feltöltése
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-stone-600 mb-2 uppercase tracking-wide">Kategória</label>
              <div className="grid grid-cols-3 gap-2">
                {['eskuvo', 'szalagavato', 'egyeb'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all border ${
                      category === cat 
                        ? "bg-rose-50 text-rose-700 border-rose-500" 
                        : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {cat === 'eskuvo' ? 'Esküvő' : cat === 'szalagavato' ? 'Szalag' : 'Egyéb'}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center bg-stone-50 mb-6 relative">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center pointer-events-none">
                <Upload className="w-8 h-8 text-stone-400 mb-2" />
                <p className="text-stone-600 text-sm">Húzd ide vagy kattints</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-bold text-stone-800 mb-2">{files.length} kép kiválasztva</p>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all bg-rose-600 hover:bg-rose-700 shadow-md flex justify-center items-center gap-2"
                >
                  {uploading ? <Loader2 className="animate-spin" /> : "Feltöltés indítása"}
                </button>
              </div>
            )}
            
            {statusMessage && (
              <p className={`text-center text-sm font-bold ${statusMessage.includes("Hiba") ? "text-red-500" : "text-green-600"}`}>
                {statusMessage}
              </p>
            )}
          </div>

          {/* JOBB OLDAL: GALÉRIA KEZELÉSE */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-stone-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trash2 size={20} /> Meglévő képek ({galleryImages.length})
              </h2>
              <button onClick={fetchImages} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200" title="Frissítés">
                <RefreshCw size={16} className={loadingImages ? "animate-spin" : ""} />
              </button>
            </div>

            {loadingImages ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-rose-600" size={30} /></div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {galleryImages.map((img) => (
                  <div key={img.id} className="relative group aspect-[3/4] rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                    <Image 
                      src={img.src} 
                      alt="Thumbnail" 
                      fill 
                      className="object-cover"
                      sizes="150px"
                    />
                    
                    {/* Törlés Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                      <span className="text-white text-xs font-bold mb-2 uppercase">{img.category}</span>
                      <button 
                        onClick={() => handleDelete(img.id, img.src)}
                        disabled={deletingId === img.id}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110 shadow-lg"
                        title="Törlés"
                      >
                        {deletingId === img.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
                {galleryImages.length === 0 && <p className="col-span-full text-center text-stone-400 py-10">Nincs még feltöltött kép.</p>}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}