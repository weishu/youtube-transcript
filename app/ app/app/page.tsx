 "use client";

  import { useState } from "react";

  interface TranscriptItem {
    text: string;
    offset: number;
    duration: number;
  }

  export default function Home() {
    const [url, setUrl] = useState("");
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const extractVideoId = (youtubeUrl: string): string | null => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
        /(?:youtu\.be\/)([^\?\s]+)/,
        /(?:youtube\.com\/embed\/)([^\?\s]+)/,
        /(?:youtube\.com\/v\/)([^\?\s]+)/,
      ];

      for (const pattern of patterns) {
        const match = youtubeUrl.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    const fetchTranscript = async () => {
      const videoId = extractVideoId(url);
      if (!videoId) {
        setError("无效的 YouTube 链接");
        return;
      }

      setLoading(true);
      setError("");
      setTranscript([]);

      try {
        const response = await fetch(`/api/transcript?videoId=${videoId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "获取字幕失败");
        }

        setTranscript(data.transcript);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取字幕失败");
      } finally {
        setLoading(false);
      }
    };

    const copyToClipboard = () => {
      const text = transcript.map((t) => t.text).join(" ");
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    };

    const copyItem = (text: string) => {
      navigator.clipboard.writeText(text);
    };

    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            YouTube 字幕提取器
          </h1>
          <p className="text-gray-400 text-center mb-8">
            输入 YouTube 链接，获取视频字幕
          </p>

          <div className="flex gap-3 mb-8">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => e.key === "Enter" && fetchTranscript()}
            />
            <button
              onClick={fetchTranscript}
              disabled={loading || !url}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "获取中..." : "获取字幕"}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {transcript.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">字幕内容</h2>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  {copied ? "✓ 已复制" : "复制全部"}
                </button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {transcript.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-900 rounded-lg hover:bg-gray-750 transition-colors group cursor-pointer"
                    onClick={() => copyItem(item.text)}
                    title="点击复制"
                  >
                    <p className="text-gray-200">{item.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.floor(item.offset / 60)}:{(item.offset % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-4">
                共 {transcript.length} 条字幕
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  ---
