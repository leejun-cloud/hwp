import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, TableRow, TableCell, Table,
  WidthType, ShadingType,
} from 'docx';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { verses } = await req.json() as { verses: string[] };

  if (!verses || verses.length !== 5) {
    return NextResponse.json({ error: '성경 구절 5개가 필요합니다.' }, { status: 400 });
  }

  // Claude로 주보 내용 생성
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `아래 성경 구절 5개를 바탕으로 가정예배 주보를 작성해주세요.

성경 구절:
1. ${verses[0]}
2. ${verses[1]}
3. ${verses[2]}
4. ${verses[3]}
5. ${verses[4]}

다음 형식으로 작성해주세요 (JSON으로 응답):
{
  "title": "이번 주 가정예배 주제",
  "date": "날짜 (예: 2026년 3월 21일)",
  "opening_prayer": "시작 기도 (3-4문장)",
  "worship_song": "찬양 제목 2곡 (예: 주님의 사랑으로 외)",
  "bible_reading": "본문 말씀 요약 (각 구절별 한 줄 묵상)",
  "sermon": "설교 제목과 내용 요약 (200자 이내)",
  "family_sharing": "가정 나눔 질문 3가지",
  "closing_prayer": "마침 기도 (3-4문장)",
  "announcements": "가정 기도 제목 2-3가지"
}`,
      },
    ],
  });

  const text = (message.content[0] as { type: string; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: '생성 실패' }, { status: 500 });
  }
  const data = JSON.parse(jsonMatch[0]);

  // DOCX 문서 생성
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: '가정예배 주보',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: data.title, bold: true, size: 28 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: data.date, size: 22, color: '666666' })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),

          makeSectionHeader('✝ 시작 기도'),
          new Paragraph({ children: [new TextRun({ text: data.opening_prayer, size: 22 })] }),
          new Paragraph({ text: '' }),

          makeSectionHeader('🎵 찬양'),
          new Paragraph({ children: [new TextRun({ text: data.worship_song, size: 22 })] }),
          new Paragraph({ text: '' }),

          makeSectionHeader('📖 본문 말씀 묵상'),
          ...data.bible_reading.split('\n').map((line: string) =>
            new Paragraph({ children: [new TextRun({ text: line, size: 22 })] })
          ),
          new Paragraph({ text: '' }),

          makeSectionHeader('📣 말씀'),
          new Paragraph({ children: [new TextRun({ text: data.sermon, size: 22 })] }),
          new Paragraph({ text: '' }),

          makeSectionHeader('💬 가정 나눔'),
          ...data.family_sharing.split('\n').map((line: string) =>
            new Paragraph({ children: [new TextRun({ text: line, size: 22 })] })
          ),
          new Paragraph({ text: '' }),

          makeSectionHeader('🙏 마침 기도'),
          new Paragraph({ children: [new TextRun({ text: data.closing_prayer, size: 22 })] }),
          new Paragraph({ text: '' }),

          makeSectionHeader('📌 기도 제목'),
          new Paragraph({ children: [new TextRun({ text: data.announcements, size: 22 })] }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="가정예배주보_${data.date.replace(/\s/g, '')}.docx"`,
    },
  });
}

function makeSectionHeader(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, color: '1a56db' })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'e5e7eb' } },
    spacing: { after: 120 },
  });
}

// docx Table/Shading imports are referenced to avoid unused import errors
void [Table, TableRow, TableCell, WidthType, ShadingType];
