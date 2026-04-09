// src/app/match/entry/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function MatchEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "09:00", // 時間の初期値を追加
    category: "U12",
    matchType: "公式戦",
    tournamentName: "",
    matchStep: "",
    opponent: "",
    scoreUs: "",
    scoreThem: "",
    hasPK: false,
    pkScoreUs: "",
    pkScoreThem: "",
    myGoals: "0",
    myAssists: "0",
    images: [] as { key: string; url: string }[],
  });

  useEffect(() => {
    if (matchId) {
      const loadMatchFromList = async () => {
        try {
          const res = await fetch("/api/get-matches");
          if (!res.ok) throw new Error("一覧の取得に失敗しました");
          
          const allMatches = await res.json();
          const targetMatch = allMatches.find((m: any) => m.id === matchId);

          if (targetMatch) {
            setFormData({
              date: targetMatch.date || "",
              time: targetMatch.time || "09:00", // 既存データにない場合はデフォルト値
              category: targetMatch.category || "U12",
              matchType: targetMatch.matchType || "公式戦",
              tournamentName: targetMatch.tournamentName || "",
              matchStep: targetMatch.matchStep || "",
              opponent: targetMatch.opponent || "",
              scoreUs: String(targetMatch.scoreUs ?? ""),
              scoreThem: String(targetMatch.scoreThem ?? ""),
              hasPK: !!targetMatch.hasPK,
              pkScoreUs: String(targetMatch.pkScoreUs ?? ""),
              pkScoreThem: String(targetMatch.pkScoreThem ?? ""),
              myGoals: String(targetMatch.myGoals ?? "0"),
              myAssists: String(targetMatch.myAssists ?? "0"),
              images: Array.isArray(targetMatch.images) ? targetMatch.images : [],
            });
          }
        } catch (err) {
          console.error("Fetch error:", err);
        }
      };
      loadMatchFromList();
    }
  }, [matchId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;

    for (const file of files) {
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        const data = await res.json();
        await fetch(data.signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        const publicUrl = `https://${bucketName}.s3.ap-northeast-1.amazonaws.com/${data.fileKey}`;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { key: data.fileKey, url: publicUrl }]
        }));
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/save-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchId ? { ...formData, id: matchId } : formData),
      });
      if (res.ok) {
        alert(matchId ? "更新しました！" : "試合を記録しました！");
        router.push("/match/history");
        router.refresh();
      }
    } catch (err) {
      alert("保存中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-[10px] font-bold text-slate-400 mb-1 tracking-wider uppercase">Date & Time</label>
          <div className="flex gap-1">
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="flex-[2] p-2.5 bg-slate-100 rounded-xl font-bold text-[11px] outline-none" required />
            <input type="time" name="time" value={formData.time} onChange={handleChange} className="flex-1 p-2.5 bg-slate-100 rounded-xl font-bold text-[11px] outline-none" required />
          </div>
        </div>
        <div className="w-16">
          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Cat</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 bg-slate-100 rounded-xl font-bold text-xs outline-none">
            <option value="U12">U12</option>
            <option value="U11">U11</option>
            <option value="U10">U10</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Match Info</label>
        <div className="flex gap-2">
          <select name="matchType" value={formData.matchType} onChange={handleChange} className="w-32 p-3 bg-slate-100 rounded-xl font-bold text-xs outline-none">
            <option>公式戦</option>
            <option>トレーニングマッチ</option>
            <option>カップ戦</option>
            <option>その他</option>
          </select>
          <input type="text" name="tournamentName" placeholder="大会名" value={formData.tournamentName} onChange={handleChange} className="flex-1 p-3 bg-slate-100 rounded-xl text-sm outline-none font-medium" required />
        </div>
        <input type="text" name="matchStep" placeholder="例：予選リーグ、準決勝など" value={formData.matchStep} onChange={handleChange} className="w-full p-3 bg-slate-100 rounded-xl text-sm outline-none" />
      </div>

      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
        <label className="block text-center text-[10px] font-black text-blue-400 mb-2 uppercase tracking-widest">Score Board</label>
        <input type="text" name="opponent" placeholder="相手チーム名" value={formData.opponent} onChange={handleChange} className="w-full p-3 mb-4 rounded-xl text-center font-black outline-none text-lg shadow-sm" required />
        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="text-[9px] font-black text-blue-600 mb-1">OURS</p>
            <input type="number" name="scoreUs" value={formData.scoreUs} onChange={handleChange} className="w-16 h-16 text-3xl font-black text-center rounded-2xl border-2 border-blue-200 bg-white outline-none" placeholder="0" required />
          </div>
          <span className="text-2xl font-black text-slate-300 mt-4">-</span>
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-400 mb-1">THEM</p>
            <input type="number" name="scoreThem" value={formData.scoreThem} onChange={handleChange} className="w-16 h-16 text-3xl font-black text-center rounded-2xl border-2 border-blue-200 bg-white outline-none" placeholder="0" required />
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-200 flex flex-col items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="hasPK" checked={formData.hasPK} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
            <span className="text-xs font-bold text-blue-800 tracking-tighter">PK戦あり</span>
          </label>
          {formData.hasPK && (
            <div className="mt-2 flex gap-2 items-center">
              <input type="number" name="pkScoreUs" value={formData.pkScoreUs} onChange={handleChange} className="w-12 p-2 text-center rounded-lg border border-blue-300 text-xs font-bold" placeholder="Us" />
              <span className="text-xs font-bold text-blue-300">PK</span>
              <input type="number" name="pkScoreThem" value={formData.pkScoreThem} onChange={handleChange} className="w-12 p-2 text-center rounded-lg border border-blue-300 text-xs font-bold" placeholder="Them" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">📸 Match Gallery</label>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full text-[10px] text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:bg-blue-600 file:text-white file:border-none file:font-black" />
        <div className="grid grid-cols-3 gap-2 mt-4">
          {formData.images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <img src={img.url} className="object-cover w-full h-full" alt="" />
              <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-bl-lg shadow-md">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-sm">
          <label className="block text-[10px] font-black text-orange-600 mb-1 uppercase tracking-widest">Your Goals ⚽️</label>
          <input type="number" name="myGoals" value={formData.myGoals} onChange={handleChange} className="w-full bg-transparent text-3xl font-black text-orange-700 outline-none" />
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <label className="block text-[10px] font-black text-emerald-600 mb-1 uppercase tracking-widest">Assists 👟</label>
          <input type="number" name="myAssists" value={formData.myAssists} onChange={handleChange} className="w-full bg-transparent text-3xl font-black text-emerald-700 outline-none" />
        </div>
      </div>

      <button disabled={loading || uploading} className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all disabled:opacity-50">
        {loading ? "SAVING..." : (matchId ? "更新を保存する" : "試合を記録する")}
      </button>
    </form>
  );
}

export default function MatchEntry() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-12 font-sans">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 border-blue-600">
        <div className="p-6">
          <h1 className="text-2xl font-black text-center text-slate-800 mb-6 italic uppercase tracking-tighter">🏆 Match Entry</h1>
          <Suspense fallback={<div className="text-center p-10 font-bold text-slate-400 animate-pulse">LOADING DATA...</div>}>
            <MatchEntryForm />
          </Suspense>
          <div className="mt-8 text-center">
            <Link href="/match/history" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">← Back to History</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
