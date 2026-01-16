'use client';
import { useState } from 'react';
import { Camera, Volume2, Plus, Trash2, Download, ChevronRight, Activity, Pill, Clock, ArrowLeft, Menu, Phone, User, Home as HomeIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function Home() {
  const [mode, setMode] = useState('menu');
  const [loading, setLoading] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [medList, setMedList] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const processImage = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setLoading(false);
      return data;
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
      setLoading(false);
      return null;
    }
  };

  const handleImageUpload = async (e, targetMode) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await processImage(file);
    if (data?.error) {
      alert("AI อ่านไม่ออก: " + data.error);
      return;
    }
    if (targetMode === 'scan') {
      setSingleResult(data);
    } else if (targetMode === 'timeline') {
      const imgUrl = URL.createObjectURL(file);
      setMedList(prev => [...prev, { ...data, img: imgUrl, id: Date.now() }]);
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    window.speechSynthesis.speak(utterance);
  };

  const saveTimeline = () => {
    const element = document.getElementById('timeline-canvas');
    html2canvas(element, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'ตารางยา_NPR.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const Navbar = () => (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md transform rotate-3">
                <Activity size={26} />
             </div>
             <div className="flex flex-col">
                <span className="text-slate-800 font-bold text-xl leading-none">Elderly Care</span>
                <span className="text-teal-600 text-sm font-medium">Smart Label NPR</span>
             </div>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-slate-600 font-medium">
            <button onClick={() => setMode('menu')} className="hover:text-teal-700 transition-colors flex items-center gap-2"><HomeIcon size={18}/> หน้าแรก</button>
            <a href="#" className="hover:text-teal-700 transition-colors flex items-center gap-2"><User size={18}/> สำหรับเภสัชกร</a>
            <a href="#" className="hover:text-teal-700 transition-colors flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100"><Phone size={18}/> ติดต่อเรา</a>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-teal-700 p-2">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const Footer = () => (
    <footer className="bg-slate-900 text-white py-10 mt-auto">
       <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white"><Activity size={20}/></div>
               <h3 className="font-bold text-xl">กลุ่มงานเภสัชกรรม</h3>
            </div>
            <p className="text-slate-400 font-light">โรงพยาบาลนพรัตนราชธานี กรมการแพทย์<br/>681 ถนนรามอินทรา แขวงคันนายาว เขตคันนายาว กรุงเทพมหานคร 10230</p>
          </div>
          <div className="text-right text-slate-500 text-sm">
             <p>© 2026 Innovation for Society Award Project.</p>
             <p>All rights reserved.</p>
          </div>
       </div>
    </footer>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative">
             <div className="w-24 h-24 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center"><Activity className="text-teal-500 animate-pulse" /></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-8">กำลังประมวลผล...</h2>
          <p className="text-slate-500 mt-2 font-light text-lg">AI กำลังอ่านฉลากยา กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  if (mode === 'menu') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="bg-teal-700 relative overflow-hidden py-10">
           <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between">
             <div className="md:w-3/4">
                <span className="bg-teal-800 text-teal-100 px-4 py-1 rounded-full text-xs font-medium inline-block mb-3 border border-teal-600">
                  นวัตกรรมเพื่อสังคม ปี 2569
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  สวัสดีครับ, ยินดีต้อนรับสู่ระบบอัจฉริยะ
                </h1>
                <p className="text-teal-100 text-lg font-light opacity-90">
                  ผู้ช่วยอ่านฉลากยาและแจ้งเตือนการกินยาสำหรับผู้สูงอายุ
                </p>
             </div>
             <div className="hidden md:block opacity-10">
                <Activity size={100} className="text-white"/>
             </div>
           </div>
        </div>
        <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 relative z-20">
          <div className="grid md:grid-cols-2 gap-6">
            <button onClick={() => setMode('scan')} className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-left flex flex-col h-full hover:shadow-2xl hover:border-blue-200 transition-all duration-200 active:scale-95 active:bg-slate-50 active:shadow-inner group">
               <div className="flex items-start justify-between mb-6">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300"><Camera size={32} /></div>
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors"><ChevronRight size={20}/></div>
               </div>
               <div className="mt-auto">
                 <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700">สแกนฉลากยา</h3>
                 <p className="text-slate-500 font-light">ถ่ายรูปหน้าซองยา เพื่อขยายตัวอักษร<br/>และฟังเสียงคำแนะนำ</p>
               </div>
            </button>
            <button onClick={() => setMode('timeline')} className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-left flex flex-col h-full hover:shadow-2xl hover:border-teal-200 transition-all duration-200 active:scale-95 active:bg-slate-50 active:shadow-inner group">
               <div className="flex items-start justify-between mb-6">
                 <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300"><Clock size={32} /></div>
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-teal-500 transition-colors"><ChevronRight size={20}/></div>
               </div>
               <div className="mt-auto">
                 <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-700">สร้างตารางยา</h3>
                 <p className="text-slate-500 font-light">รวมภาพซองยาหลายซอง<br/>ให้เป็นตารางการกินยาแผ่นเดียว</p>
               </div>
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (mode === 'scan') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
           <div className="w-full max-w-4xl mx-auto mb-6">
             <button onClick={() => setMode('menu')} className="flex items-center text-slate-500 hover:text-teal-700 transition-colors font-medium active:scale-95"><ArrowLeft size={24} className="mr-2"/> กลับหน้าหลัก</button>
           </div>
           {!singleResult ? (
             <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 p-8 text-center">
                 <div className="mb-8">
                    <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4"><Camera size={48} className="text-teal-600" /></div>
                    <h2 className="text-2xl font-bold text-slate-800">ถ่ายรูปซองยา</h2>
                    <p className="text-slate-500 mt-2">วางซองยาให้อยู่ในกรอบภาพ และถ่ายให้ชัดเจน</p>
                 </div>
                 <label className="block w-full cursor-pointer bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold text-xl shadow-lg shadow-teal-200 transition-all transform active:scale-95 active:bg-teal-800">
                    เปิดกล้องถ่ายรูป
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleImageUpload(e, 'scan')} />
                 </label>
             </div>
           ) : (
             <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-teal-700 p-8 text-white flex justify-between items-start">
                   <div><span className="text-teal-200 text-sm font-bold uppercase tracking-wider">ชื่อยา / Drug Name</span><h2 className="text-4xl font-bold mt-2">{singleResult.drug_name}</h2></div>
                   <div className="bg-white/10 p-3 rounded-xl"><Pill size={32} className="text-white"/></div>
                </div>
                <div className="p-8 space-y-8">
                   <div className="space-y-3"><label className="text-slate-400 text-sm font-bold uppercase tracking-wider">วิธีใช้ / Usage</label><div className="text-5xl font-bold text-slate-800 leading-tight border-l-8 border-teal-500 pl-6 py-2">{singleResult.usage_short}</div></div>
                   <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-start gap-4"><div className="bg-orange-100 p-3 rounded-lg text-orange-600 mt-1"><Activity size={24} /></div><div><span className="text-orange-800 font-bold block mb-1 text-lg">สรรพคุณ</span><p className="text-2xl text-slate-700 font-medium">{singleResult.indication}</p></div></div>
                   {singleResult.warning && (<div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex gap-4 items-center"><div className="w-2 h-12 bg-red-500 rounded-full"></div><p className="text-red-700 font-bold text-xl">{singleResult.warning}</p></div>)}
                   <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                      <button onClick={() => speak(`ยาชื่อ ${singleResult.drug_name} สรรพคุณ ${singleResult.indication} วิธีใช้ ${singleResult.usage_short}`)} className="bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-teal-100 transition-all active:scale-95"><Volume2 size={24} /> ฟังเสียง</button>
                      <button onClick={() => setSingleResult(null)} className="bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-600 py-5 rounded-2xl font-bold text-xl transition-all active:scale-95">ถ่ายใหม่</button>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    );
  }

  if (mode === 'timeline') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 pb-20">
         <Navbar />
         <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
               <button onClick={() => setMode('menu')} className="flex items-center text-slate-500 hover:text-teal-700 transition-colors font-medium active:scale-95"><ArrowLeft size={20} className="mr-2"/> กลับหน้าหลัก</button>
               <h2 className="text-xl font-bold text-teal-800">จัดการตารางยา</h2>
            </div>
            {medList.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Clock size={40} /></div>
                  <h3 className="text-xl font-bold text-slate-700">ยังไม่มีรายการยา</h3>
                  <p className="text-slate-400 mt-2">กดปุ่ม + ด้านล่างเพื่อเริ่มถ่ายรูปซองยา</p>
               </div>
            ) : (
               <div id="timeline-canvas" className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                     <div className="w-14 h-14 bg-teal-800 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md">N</div>
                     <div><h3 className="font-bold text-2xl text-slate-800">ตารางการใช้ยาประจำวัน</h3><p className="text-slate-500 font-medium">โรงพยาบาลนพรัตนราชธานี</p></div>
                  </div>
                  {['morning', 'noon', 'evening', 'bedtime'].map((time) => {
                      const medsInSlot = medList.filter(m => m.times?.includes(time));
                      if(medsInSlot.length === 0) return null;
                      const config = { morning: { label: 'เช้า', color: 'text-orange-600', bg: 'bg-orange-100', icon: '☀️' }, noon: { label: 'กลางวัน', color: 'text-blue-600', bg: 'bg-blue-100', icon: '🌤️' }, evening: { label: 'เย็น', color: 'text-indigo-600', bg: 'bg-indigo-100', icon: '🌆' }, bedtime: { label: 'ก่อนนอน', color: 'text-purple-600', bg: 'bg-purple-100', icon: '🌙' } }[time];
                      return (
                         <div key={time} className="mb-8 last:mb-0">
                            <div className="flex items-center gap-4 mb-4"><div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center text-lg shadow-sm`}>{config.icon}</div><h4 className={`font-bold text-xl ${config.color}`}>ช่วง{config.label}</h4></div>
                            <div className="pl-14 space-y-4">
                               {medsInSlot.map((med, idx) => (
                                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                                     <span className="font-bold text-lg text-slate-700">{med.drug_name}</span>
                                     <span className="text-sm font-bold bg-white border border-slate-200 px-3 py-1 rounded-lg text-slate-600 shadow-sm">{med.quantity} เม็ด</span>
                                  </div>
                               ))}
                            </div>
                         </div>
                      );
                  })}
                  <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400 font-light">เอกสารนี้สร้างโดยระบบอัตโนมัติจาก Elderly Care Smart Label NPR Application</div>
               </div>
            )}
         </div>
         <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200 p-2 pl-4 pr-2 rounded-full shadow-2xl flex gap-3 z-50">
             <label className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"><Plus size={20} /> เพิ่มยา<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleImageUpload(e, 'timeline')} /></label>
             {medList.length > 0 && (<><button onClick={saveTimeline} className="w-12 h-12 bg-white text-teal-600 border border-teal-100 rounded-full flex items-center justify-center hover:bg-teal-50 transition-colors active:scale-95"><Download size={20} /></button><button onClick={() => setMedList([])} className="w-12 h-12 bg-white text-red-500 border border-red-100 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors active:scale-95"><Trash2 size={20} /></button></>)}
         </div>
      </div>
    );
  }
}
