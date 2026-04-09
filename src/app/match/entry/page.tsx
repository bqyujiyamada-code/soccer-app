// src/app/match/entry/page.tsx
"use client";
import { useState, useEffect } from "react"; // useEffectを追加
import { useRouter, useSearchParams } from "next/navigation"; // useSearchParamsを追加
import Link from "next/link";

export default function MatchEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id"); // URLからIDを取得

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    id: "", // 更新用にIDを保持
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
  });

  // 編集モードの場合、既存データを読み込む
  useEffect(() => {
    if (matchId) {
      const loadMatch = async () => {
        try {
          const res = await fetch(`/api/get-match?id=${matchId}`); // 1件取得API
          if (res.ok) {
            const data = await res.json();
            setFormData({ ...data, id: matchId }); // IDもセット
          }
        } catch (err) {
          console.error("Load error:", err);
        }
      };
      loadMatch();
    }
  }, [matchId]);

  // handleChange, handleImageChange, removeImage は以前と同じ

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 保存 or 更新APIを叩く
      const res = await fetch("/api/save-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(matchId ? "更新しました！" : "記録しました！⚽️");
        router.push("/match/history");
      } else {
        alert("保存に失敗しました");
      }
    } catch (err) {
      alert("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-12">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 border-blue-600">
        <div className="p-6">
          <h1 className="text-2xl font-black text-center text-slate-800 mb-6 italic uppercase">
            {matchId ? "🏆 Edit Match" : "🏆 Match Entry"}
          </h1>
          {/* フォーム内容は前回と同じ。ボタンのラベルだけ変更 */}
          <form onSubmit={handleSubmit} className="space-y-6">
             {/* ...中略（前回のフォーム項目）... */}
             <button disabled={loading || uploading} className="...">
               {loading ? "SAVING..." : (matchId ? "更新する" : "試合をきろくする")}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}
