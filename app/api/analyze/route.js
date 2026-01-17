import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server Error: ไม่พบ API Key" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("image");
    
    if (!file) {
      return NextResponse.json({ error: "ไม่พบรูปภาพ" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // --- จุดที่แก้ไข: อัปเกรดเป็น Gemini 2.5 Flash ---
    // โมเดลนี้เร็วและแม่นยำกว่า 1.5 มาก และรองรับภาษาไทยดีเยี่ยม
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    const prompt = `
      Task: Analyze this medication label/package image as an expert pharmacist.
      Target Audience: Elderly patients (Thai language).
      
      Extract and return ONLY a JSON object with these fields:
      {
        "drug_name": "Generic Name or Brand Name (ภาษาไทยถ้ามี)",
        "indication": "สรรพคุณสั้นๆ ง่ายๆ (เช่น แก้ปวด, ลดความดัน)",
        "usage_short": "วิธีใช้แบบกระชับ (เช่น วันละ 1 เม็ด หลังอาหารเช้า)",
        "times": ["morning", "noon", "evening", "bedtime"], 
        "quantity": "จำนวนเม็ดต่อมื้อ (ใส่เฉพาะตัวเลข เช่น 1, 0.5)",
        "warning": "คำเตือนสำคัญ (ถ้ามี)"
      }

      Conditions:
      - times: Select from [morning, noon, evening, bedtime] based on the label.
      - If image is NOT medication: return {"error": "ภาพไม่ชัดเจน หรือไม่ใช่ฉลากยา"}
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: file.type } },
    ]);

    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json|```/g, "").trim();
    
    try {
      return NextResponse.json(JSON.parse(text));
    } catch (e) {
      console.error("JSON Parse Error:", text);
      return NextResponse.json({ error: "อ่านข้อมูลไม่สำเร็จ กรุณาถ่ายใหม่ให้ชัดขึ้น" }, { status: 500 });
    }

  } catch (error) {
    console.error("AI Error:", error);
    // แจ้งเตือนลูกค้าให้ชัดเจน
    return NextResponse.json({ 
      error: `ระบบขัดข้อง: ${error.message.includes('404') ? 'รุ่น AI เก่าเกินไป (กำลังอัปเดต)' : 'กรุณาลองใหม่อีกครั้ง'}` 
    }, { status: 500 });
  }
}
