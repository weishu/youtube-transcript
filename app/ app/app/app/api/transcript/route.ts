import { NextRequest, NextResponse } from "next/server";
  import { YoutubeTranscript } from "youtube-transcript";

  export const runtime = "nodejs";
  export const dynamic = "force-dynamic";

  interface TranscriptItem {
    text: string;
    offset: number;
    duration: number;
  }

  export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "缺少 videoId 参数" },
        { status: 400 }
      );
    }

    try {
      const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: "zh,zh-Hans,zh-CN,en",
      });

      const transcript: TranscriptItem[] = rawTranscript.map((item) => ({
        text: item.text,
        offset: item.offset / 1000,
        duration: item.duration / 1000,
      }));

      return NextResponse.json({ transcript });
    } catch (error) {
      console.error("获取字幕失败:", error);

      try {
        const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId);

        const transcript: TranscriptItem[] = rawTranscript.map((item) => ({
          text: item.text,
          offset: item.offset / 1000,
          duration: item.duration / 1000,
        }));

        return NextResponse.json({ transcript });
      } catch {
        return NextResponse.json(
          {
            error: "无法获取该视频的字幕，可能原因：1) 视频没有字幕 2) 视频 ID 不正确",
          },
          { status: 500 }
        );
      }
    }
  }

  ---
