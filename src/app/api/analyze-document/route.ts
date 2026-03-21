import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();

    // HWP 바이너리는 직접 파싱 불가 - 안내 메시지 반환
    if (ext === 'hwp') {
      return NextResponse.json({
        summary: 'HWP 바이너리 파일입니다. 한글 프로그램에서 HWPX로 저장 후 재업로드하면 정확한 분석이 가능합니다.',
        document_type: 'HWP 문서',
        key_points: [
          `파일명: ${file.name}`,
          `파일 크기: ${(file.size / 1024).toFixed(1)}KB`,
          'HWP 바이너리 형식 — HWPX 변환 권장',
        ],
        fill_suggestions: ['한글에서 다른 이름으로 저장 → HWPX 선택 후 재업로드'],
        tone: '분석 불가 (바이너리)',
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // DOCX: application/vnd.openxmlformats-officedocument.wordprocessingml.document
    // HWPX: ZIP 기반 XML — PDF처럼 처리 시도
    const mediaType =
      ext === 'docx'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/zip';

    const prompt = `이 문서(${file.name})를 분석하고 다음 JSON 형식으로 응답해주세요:
{
  "summary": "문서 전체 요약 (3-5문장)",
  "document_type": "문서 유형 (예: 가정예배 주보, 보고서, 안내문 등)",
  "key_points": ["핵심 내용 1", "핵심 내용 2", "핵심 내용 3"],
  "fill_suggestions": ["AI가 채워줄 수 있는 항목 1", "항목 2"],
  "word_count": "추정 단어 수",
  "tone": "문서 톤 (공식/비공식/종교적 등)"
}`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'text',
              text: `[파일 내용 base64]: ${base64.substring(0, 500)}... (${ext} 문서, ${(file.size / 1024).toFixed(1)}KB)`,
            },
          ],
        },
      ],
    });

    const text = (message.content[0] as { type: string; text: string }).text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: '분석 실패' }, { status: 500 });
    }
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error('분석 오류:', err);
    return NextResponse.json({ error: '문서 분석에 실패했습니다.' }, { status: 500 });
  }
}
