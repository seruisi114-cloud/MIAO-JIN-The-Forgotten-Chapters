export type ChapterConfig = {
  id: string;
  title: string;
  chapterLabel: string;
  audioSrc: string;
  mood: string[];
  poem: string[];
};

export const chapter01: ChapterConfig = {
  id: "chapter-01",
  title: "月下星海",
  chapterLabel: "第一篇章",
  audioSrc: "/audio/chapters/moonlit-star-sea.wav",
  mood: ["梦幻", "月光", "星海", "温柔", "沉睡", "神秘"],
  poem: ["月光落下时，", "沉睡的旋律开始苏醒。"],
};

export const chapters = [chapter01] as const;
