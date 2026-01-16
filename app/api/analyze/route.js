import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");
    if (!file) return NextResponse.json({ error: "ไม่พบรูปภาพ" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      คุณคือเภสัชกรผู้เชี่ยวชาญ ดูรูปภาพซองยา/ฉลากยา แล้วสกัดข้อมูลออกมาเป็น JSON (ห้ามมี Markdown)
      Output Format:
      {
        "drug_name": "ชื่อยา (ถ้ามีชื่อสามัญให้ระบุด้วย)",
        "indication": "สรรพคุณสั้นๆ เข้าใจง่าย (เช่น แก้ปวด, ลดความดัน)",
        "usage_short": "วิธีใช้สั้นๆ (เช่น วันละ 1 เม็ด หลังอาหารเช้า)",
        "times": ["morning", "noon", "evening", "bedtime"], 
        "quantity": "จำนวนเม็ดต่อครั้ง (ระบุแค่ตัวเลข ถ้าไม่มีใส่ 1)",
        "warning": "คำเตือนสำคัญ (ถ้ามี)"
      }
      *หมายเหตุ: 
      - ถ้าในรูปไม่ใช่ยา ให้ตอบกลับมาว่า {"error": "ไม่สามารถอ่านฉลากยาได้"}
      - times ให้เลือกเฉพาะ: morning (เช้า), noon (กลางวัน), evening (เย็น), bedtime (ก่อนนอน)
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: file.type } },
    ]);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการประมวลผล" }, { status: 500 });
  }
}
