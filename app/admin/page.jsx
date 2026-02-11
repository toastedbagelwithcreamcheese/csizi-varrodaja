"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Upload, X, Check, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState("eskuvo"); // Alapértelmezett
  const [statusMessage, setStatusMessage] = useState("");

  // Egyszerű jelszó védelem
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Hibás jelszó!");
    }
  };

  const handleFileChange = (e) => {
    // A fájlokat tömbbe konvertáljuk
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setStatusMessage("Feltöltés indítása...");

    try {
      for (const file of files) {
        // 1. Egyedi fájlnév generálás (időbélyeg + eredeti név)
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const filePath = `${category}/${fileName}`;

        // 2. Feltöltés a Storage-ba
        const { error: uploadError } = await supabase.storage
          .from("portfolio")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 3. Publikus URL lekérése
        const { data: { publicUrl } } = supabase.storage
          .from("portfolio")
          .getPublicUrl(filePath);

        // 4. Bejegyzés az Adatbázisba
        const { error: dbError } = await supabase
          .from("images")
          .insert([
            { src: publicUrl, category: category, title: "" }
          ]);

        if (dbError) throw dbError;
      }

      setStatusMessage("Sikeres feltöltés!");
      setFiles([]); // Lista törlése
      
      // Kis késleltetés után töröljük az üzenetet
      setTimeout(() => setStatusMessage(""), 3000);

    } catch (error) {
      console.error(error);
      setStatusMessage("Hiba történt: " + error.message);
    } finally {
      setUploading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-serif font-bold text-stone-900">Képfeltöltés</h1>
            <button onClick={() => setIsAuthenticated(false)} className="text-rose-600 font-bold underline">Kilépés</button>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-stone-100">
          
          {/* Kategória Választó */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-stone-600 mb-2 uppercase tracking-wide">Válassz Kategóriát</label>
            <div className="grid grid-cols-3 gap-4">
              {['eskuvo', 'szalagavato', 'egyeb'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-3 rounded-xl border-2 font-medium transition-all ${
                    category === cat 
                      ? "border-rose-500 bg-rose-50 text-rose-700" 
                      : "border-stone-100 text-stone-500 hover:border-stone-300"
                  }`}
                >
                  {cat === 'eskuvo' ? 'Esküvő' : cat === 'szalagavato' ? 'Szalagavató' : 'Egyéb'}
                </button>
              ))}
            </div>
          </div>

          {/* Fájl Feltöltő Terület */}
          <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center bg-stone-50 mb-8 relative">
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center pointer-events-none">
              <Upload className="w-12 h-12 text-stone-400 mb-4" />
              <p className="text-stone-600 font-medium text-lg">Húzd ide a képeket, vagy kattints a kiválasztáshoz</p>
              <p className="text-stone-400 text-sm mt-2">Több képet is kiválaszthatsz egyszerre</p>
            </div>
          </div>

          {/* Kiválasztott képek listája */}
          {files.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-stone-800 mb-4">Kiválasztva ({files.length} db):</h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {files.map((file, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-stone-50 p-3 rounded-lg text-sm text-stone-600">
                    <span>{file.name}</span>
                    <span className="text-xs bg-stone-200 px-2 py-1 rounded">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feltöltés Gomb */}
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2 ${
              uploading || files.length === 0
                ? "bg-stone-300 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700 shadow-lg hover:shadow-rose-500/30 active:scale-95"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" /> Feltöltés folyamatban...
              </>
            ) : statusMessage === "Sikeres feltöltés!" ? (
              <>
                <Check /> Kész!
              </>
            ) : (
              "Képek feltöltése az adatbázisba"
            )}
          </button>

          {statusMessage && (
            <p className={`text-center mt-4 font-medium ${statusMessage.includes("Hiba") ? "text-red-500" : "text-green-600"}`}>
              {statusMessage}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}