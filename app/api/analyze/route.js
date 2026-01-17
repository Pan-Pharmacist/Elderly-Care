import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. เช็ค API Key ก่อนเลย
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server Error: ไม่พบ API Key ใน Vercel (กรุณาตรวจสอบ Environment Variables)" }, { status: 500 });
    }

    // 2. รับข้อมูลรูปภาพ
    const formData = await req.formData();
    const file = formData.get("image");
    
    if (!file) {
      return NextResponse.json({ error: "ไม่พบรูปภาพที่ส่งมา" }, { status: 400 });
    }

    // 3. แปลงไฟล์และเตรียมส่ง (Masterpiece: เพิ่มการดักจับ Error ที่ละเอียดขึ้น)
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    
    // เชื่อมต่อ AI
    const genAI = new GoogleGenerativeAI(apiKey);
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
      - ถ้าในรูปไม่ใช่ยา ให้ตอบกลับมาว่า {"error": "ไม่สามารถอ่านฉลากยาได้ หรือภาพไม่ชัดเจน"}
      - times ให้เลือกเฉพาะ: morning (เช้า), noon (กลางวัน), evening (เย็น), bedtime (ก่อนนอน)
    `;

    // 4. เรียกใช้ AI
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: file.type } },
    ]);

    const response = await result.response;
    let text = response.text();
    
    // Clean JSON Format
    text = text.replace(/```json|```/g, "").trim();
    
    try {
      return NextResponse.json(JSON.parse(text));
    } catch (e) {
      console.error("JSON Parse Error:", text);
      return NextResponse.json({ error: "AI ตอบกลับมาผิดรูปแบบ กรุณาลองใหม่" }, { status: 500 });
    }

  } catch (error) {
    console.error("AI Error Details:", error);
    
    // Masterpiece Error Handling: บอกสาเหตุที่แท้จริง
    let errorMessage = error.message;
    if (errorMessage.includes("API key not valid")) {
      errorMessage = "API Key ไม่ถูกต้อง กรุณาเช็คใน Google AI Studio";
    } else if (errorMessage.includes("413")) {
      errorMessage = "ไฟล์รูปภาพใหญ่เกินไป กรุณาลดขนาดภาพ";
    }

    return NextResponse.json({ 
      error: `ระบบขัดข้อง: ${errorMessage}` 
    }, { status: 500 });
  }
}
