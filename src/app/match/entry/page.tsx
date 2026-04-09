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

  // 初期状態を定義
  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
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
  };

  const [formData, setFormData] = useState(initialFormState);

  // 編集モード：既存データの取得とマッピング
  useEffect(() => {
    if (matchId) {
      const loadMatch = async () => {
        try {
          const res = await fetch(`/api/get-match?id=${matchId}`);
          if (res.ok) {
            const data = await res.json();
            // 既存の値を活かしつつ、足りないフィールドを初期値で埋める（マージ処理）
            setFormData(prev => ({
              ...initialFormState,
              ...data,
              // 数値や配列が確実にセットされるように個別に指定
              images: data.images || [],
              myGoals: data.myGoals?.toString() || "0",
              myAssists: data.myAssists?.toString() || "0",
            }));
          }
        } catch (err) {
          console.error("データの読み込みに失敗しました", err);
        }
      };
      loadMatch();
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
        
        await fetch(data.signedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        const publicUrl = `https://${bucketName}.s3.ap-northeast-1.amazonaws.com/${data.fileKey}`;
        
        // 既存の画像リストに追加（上書きではなく追記）
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { key: data.fileKey, url: publicUrl }]
        }));
      } catch (err: any) {
        alert("アップロード失敗: " + err.message);
      }
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/save-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IDを含めて送信することで「新規」ではなく「更新」として扱う
        body: JSON.stringify(matchId ? { ...formData, id: matchId } : formData),
      });

      if (res.ok) {
        alert(matchId ? "記録を更新しました！" : "新しく記録しました！⚽️");
        router.push("/match/history");
      } else {
        const errorData = await res.json();
        alert(`保存失敗: ${errorData.detail}`);
      }
    } catch (err) {
      alert("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 以前と同じJSX構造（中略） */}
      {/* 確実に formData.value を参照しているため、取得した値が表示されます */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[10px] font-bold text-slate-400 mb-1">DATE</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-3 bg-slate-100 rounded-xl font-bold text-xs outline-none" required />
        </div>
        <div className="w-24">
          <label className="block text-[10px] font-bold text-slate-400 mb-1">CATEGORY</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 bg-slate-100 rounded-xl font-bold text-xs outline-none">
            <option value="U12">U12</option>
            <option value="U11">U11</option>
            <option value="U10">U10</option>
          </select>
        </div>
        <div className="flex-[1.5] min-w-[140px]">
          <label className="block text-[10px] font-bold text-slate-400 mb-1">TYPE</label>
          <select name="matchType" value={formData.matchType} onChange={handleChange} className="w-full p-3 bg-slate-100 rounded-xl font-bold text-sm outline-none">
            <option>公式戦</option>
            <option>トレーニングマッチ</option>
            <option>カップ戦</option>
            <option>その他</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <input type="text" name="tournamentName" placeholder="大会名" value={formData.tournamentName} onChange={handleChange} className="w-full p-3 bg-slate-100 rounded-xl text-sm outline-none font-medium" required />
        <input type="text" name="matchStep" placeholder="例：予選リーグ、準決勝など" value={formData.matchStep} onChange={handleChange} className="w-full p-3 bg-slate-100 rounded-xl text-sm outline-none" />
      </div>

      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
        <input type="text" name="opponent" placeholder="相手チーム名" value={formData.opponent} onChange={handleChange} className="w-full p-3 mb-4 rounded-xl text-center font-black outline-none border-2 border-transparent focus:border-blue-400 text-lg shadow-sm" required />
        <div className="flex items-center justify-around gap-2">
          <input type="number" name="scoreUs" value={formData.scoreUs} onChange={handleChange} className="w-16 h-16 text-3xl font-black text-center rounded-2xl border-2 border-blue-200 outline-none focus:border-blue-500 bg-white" placeholder="0" required />
          <div className="text-2xl font-black text-slate-300">-</div>
          <input type="number" name="scoreThem" value={formData.scoreThem} onChange={handleChange} className="w-16 h-16 text-3xl font-black text-center rounded-2xl border-2 border-blue-200 outline-none focus:border-blue-500 bg-white" placeholder="0" required />
        </div>
      </div>

      {/* 画像プレビュー部分 (重要: 既存の画像が表示されることを確認) */}
      <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">📸 Match Photos</label>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:bg-blue-600 file:text-white cursor-pointer" />
        <div className="grid grid-cols-3 gap-2 mt-4">
          {formData.images.map((img, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
              <img src={img.url} alt="preview" className="object-cover w-full h-full" />
              <button type="button" onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-bl-lg shadow-md">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-sm">
          <label className="block text-[10px] font-black text-orange-600 mb-1 tracking-wider uppercase">Goals ⚽️</label>
          <input type="number" name="myGoals" value={formData.myGoals} onChange={handleChange} className="w-full bg-transparent text-3xl font-black text-orange-700 outline-none" />
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <label className="block text-[10px] font-black text-emerald-600 mb-1 tracking-wider uppercase">Assists 👟</label>
          <input type="number" name="myAssists" value={formData.myAssists} onChange={handleChange} className="w-full bg-transparent text-3xl font-black text-emerald-700 outline-none" />
        </div>
      </div>

      <button disabled={loading || uploading} className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all disabled:opacity-50">
        {loading ? "SAVING..." : (matchId ? "更新を保存する" : "試合をきろくする")}
      </button>
    </form>
  );
}

export default function MatchEntry() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-12 font-sans">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 border-blue-600">
        <div className="p-6">
          <h1 className="text-2xl font-black text-center text-slate-800 mb-6 italic uppercase">🏆 Match Entry</h1>
          <Suspense fallback={<div className="text-center p-10 font-bold text-slate-400">LOADING DATA...</div>}>
            <MatchEntryForm />
          </Suspense>
          <div className="mt-8 text-center">
            <Link href="/match/history" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">← 戻る</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
