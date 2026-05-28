import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Hospital,
  ImagePlus,
  LogIn,
  LogOut,
  MapPin,
  Mic,
  MicOff,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

/* ─────────────────────────────────────────────
   브랜드 / 디자인 토큰
   ───────────────────────────────────────────── */
const KB = {
  navy: "#1E2761",
  navyDeep: "#141B47",
  navyLight: "#2A3573",
  navyMute: "#4A5396",
  gold: "#C9A961",
  goldLight: "#E5D3A1",
  goldMute: "#F5EBD3",
  cream: "#FAF7F0",
  bg: "#F6F4EE",
  ink: "#1A1F3A",
  inkSoft: "#4B5274",
  inkMute: "#8A8FA8",
  line: "#E8E3D6",
  ok: "#1F9D6E",
  okSoft: "#E6F4EE",
  warn: "#D97706",
  warnSoft: "#FEF3E2",
  bad: "#C2410C",
  badSoft: "#FCE8DC",
};

/* ─────────────────────────────────────────────
   데이터 (메모리 데이터 + 추가 mock)
   ───────────────────────────────────────────── */
const SITE = {
  id: "reto",
  name: "리투의원",
  type: "피부·미용 병원",
  address: "서울 강남구 청담동",
  manager: "박원준",
  staff: "박지용",
  grade: "VIP 관리",
  closeRule: "오전 9:30 전 마감",
  regularPoints: [
    { id: "p1", text: "6층 관리실 거울", icon: "🪞" },
    { id: "p2", text: "세면대 선반", icon: "🧴" },
    { id: "p3", text: "5·6층 출입문 유리", icon: "🚪" },
    { id: "p4", text: "파우더룸 먼지·머리카락", icon: "💄" },
    { id: "p5", text: "창틀 날파리·러브벌레", icon: "🪟" },
    { id: "p6", text: "원장실 쇼파 밑", icon: "🛋️" },
    { id: "p7", text: "환자 베드 밑", icon: "🛏️" },
  ],
  requiredPhotos: [
    { id: "rp1", text: "출입문 유리 (외부)", emoji: "🚪" },
    { id: "rp2", text: "화장실 입구 전경", emoji: "🚻" },
    { id: "rp3", text: "쓰레기 배출 상태", emoji: "🗑️" },
    { id: "rp4", text: "파우더룸 전체", emoji: "💄" },
    { id: "rp5", text: "원장실 입구", emoji: "🩺" },
  ],
  todayOrders: [
    {
      id: "o1",
      urgency: "high",
      text: "VIP 환자 방문 예정 — 파우더룸·원장실 사전점검 강화",
    },
    {
      id: "o2",
      urgency: "normal",
      text: "어제 컴플레인: 파우더룸 머리카락 재확인 후 사진 필수",
    },
  ],
};

const QUICK_CHIPS = [
  "병원 요청 있었음",
  "추가 작업 발생",
  "도어락 문제",
  "비품 부족",
  "VIP 사전점검 완료",
  "특이 컴플레인 없음",
];

/* 병원 — 내 요청 mock */
const MY_REQUESTS = [
  {
    id: "R-11-15",
    type: "컴플레인",
    urgency: "high",
    title: "파우더룸 바닥 머리카락",
    status: "완료",
    registeredAt: "11월 15일 14:22",
    completedAt: "11월 16일 09:18",
  },
  {
    id: "R-11-19",
    type: "요청",
    urgency: "normal",
    title: "VIP 방문 사전점검 요청",
    status: "완료",
    registeredAt: "11월 19일 09:30",
    completedAt: "11월 19일 17:48",
  },
  {
    id: "R-11-24",
    type: "요청",
    urgency: "normal",
    title: "탕비실 싱크대 배수구 냄새",
    status: "처리중",
    registeredAt: "11월 24일 16:05",
  },
];

/* 월간 보고서 데이터 */
const REPORT = {
  month: "2025년 11월",
  prevMonth: "10월",
  hospital: "리투의원",
  manager: "박원준",
  staff: "박지용",
  staffNote: "정기 담당 2년차",
  kpi: [
    { label: "방문 횟수", value: "13", sub: "정기 12 + 추가 1회" },
    { label: "정시 출근", value: "13 / 13", sub: "전월 12 / 13" },
    { label: "처리 요청", value: "8", sub: "평균 14시간 내" },
    { label: "증빙 사진", value: "142", sub: "전월 대비 +18장" },
  ],
  // 11월 1~30일
  calendar: [
    { d: 1, w: "토", s: "off" },
    { d: 2, w: "일", s: "off" },
    { d: 3, w: "월", s: "off" },
    { d: 4, w: "화", s: "visit" },
    { d: 5, w: "수", s: "visit" },
    { d: 6, w: "목", s: "visit" },
    { d: 7, w: "금", s: "off" },
    { d: 8, w: "토", s: "off" },
    { d: 9, w: "일", s: "off" },
    { d: 10, w: "월", s: "off" },
    { d: 11, w: "화", s: "visit" },
    { d: 12, w: "수", s: "visit" },
    { d: 13, w: "목", s: "visit" },
    { d: 14, w: "금", s: "off" },
    { d: 15, w: "토", s: "warn" },
    { d: 16, w: "일", s: "extra" },
    { d: 17, w: "월", s: "off" },
    { d: 18, w: "화", s: "visit" },
    { d: 19, w: "수", s: "visit" },
    { d: 20, w: "목", s: "visit" },
    { d: 21, w: "금", s: "off" },
    { d: 22, w: "토", s: "off" },
    { d: 23, w: "일", s: "off" },
    { d: 24, w: "월", s: "off" },
    { d: 25, w: "화", s: "visit" },
    { d: 26, w: "수", s: "visit" },
    { d: 27, w: "목", s: "visit" },
    { d: 28, w: "금", s: "off" },
    { d: 29, w: "토", s: "off" },
    { d: 30, w: "일", s: "off" },
  ],
  regularPoints: [
    { name: "6층 관리실 거울", icon: "🪞", visits: 13, photos: 26 },
    { name: "세면대 선반", icon: "🧴", visits: 13, photos: 26 },
    { name: "5·6층 출입문 유리", icon: "🚪", visits: 13, photos: 39 },
    {
      name: "파우더룸 먼지·머리카락",
      icon: "💄",
      visits: 13,
      photos: 32,
      highlighted: true,
      hlNote: "병원 요청 강화 항목",
    },
    { name: "창틀 날파리·러브벌레", icon: "🪟", visits: 13, photos: 13 },
    { name: "원장실 쇼파 밑", icon: "🛋️", visits: 13, photos: 13 },
    { name: "환자 베드 밑", icon: "🛏️", visits: 13, photos: 13 },
  ],
  requests: [
    {
      id: "11-03",
      no: "#11-03",
      type: "요청",
      urgency: "normal",
      title: "VIP 환자 방문 전 사전점검 요청",
      original:
        "다음 주 화요일 VIP 환자 방문 예정입니다. 사전점검 강화 부탁드립니다.",
      registeredAt: "11월 3일 16:42",
      adminInstruction:
        "11/5 화요일 정규 작업 + 파우더룸·원장실 추가 점검, 방문 30분 전 완료",
      assignee: "박지용",
      completedAt: "11월 5일 09:12",
      duration: "1일 16시간",
      confirmedAt: "11월 5일 11:30",
    },
    {
      id: "11-15",
      no: "#11-15",
      type: "컴플레인",
      urgency: "high",
      title: "파우더룸 바닥에 머리카락이 많이 보임",
      original:
        "오늘 환자가 파우더룸 바닥에 머리카락이 많다고 말씀하셨어요. 신경 써 주세요.",
      registeredAt: "11월 15일 14:22",
      adminInstruction:
        "파우더룸 바닥·선반·거울 주변 먼지·머리카락 전체 제거, 처리 후 사진 필수",
      assignee: "박지용",
      completedAt: "11월 16일 09:18",
      duration: "19시간",
      confirmedAt: "11월 16일 11:05",
    },
    {
      id: "11-19",
      no: "#11-19",
      type: "요청",
      urgency: "normal",
      title: "5층 출입문 유리 — 오후 햇빛 얼룩",
      original:
        "오후에 햇빛 비치면 유리 얼룩이 두드러집니다. 청소 시 조금 더 신경 부탁드려요.",
      registeredAt: "11월 19일 09:30",
      adminInstruction:
        "5·6층 출입문 유리 안쪽·바깥쪽 모두 무얼룩 마감, 햇빛 각도에서 확인 후 사진",
      assignee: "박지용",
      completedAt: "11월 19일 17:48",
      duration: "8시간",
      confirmedAt: "11월 20일 09:11",
    },
  ],
  galleries: [
    {
      key: "rest",
      title: "화장실 입구",
      icon: "🚻",
      photos: ["1주차", "2주차", "3주차", "4주차"],
    },
    {
      key: "glass",
      title: "출입문 유리",
      icon: "🚪",
      photos: ["1주차", "2주차", "3주차", "4주차"],
    },
    {
      key: "powder",
      title: "파우더룸",
      icon: "💄",
      photos: ["1주차", "2주차", "3주차", "4주차"],
    },
    {
      key: "trash",
      title: "쓰레기 배출",
      icon: "🗑️",
      photos: ["1주차", "2주차", "3주차", "4주차"],
    },
  ],
  comment: `이번 달 리투의원은 정기 방문 13회를 모두 정시 도착으로 완료했습니다.

11월 둘째 주 파우더룸 위생 관련 컴플레인 1건이 있어, 다음 달부터 매 방문 시 파우더룸 별도 체크리스트를 추가하여 운영하겠습니다.

또한 VIP 방문 사전점검 요청이 늘어남에 따라, 다음 달부터 별도 알림 채널을 운영하여 빠르게 대응하겠습니다.

겨울철 진입에 따라 창틀 결로·곰팡이 사전 예방 점검도 12월부터 정기 항목에 추가됩니다.`,
  nextMonth: [
    "파우더룸 위생관리 — 매방문 별도 체크리스트 운영",
    "VIP 사전점검 알림 채널 신설 (담당자 직통)",
    "창틀 결로·곰팡이 사전 예방 점검 (계절 대응 신규)",
  ],
};

/* ─────────────────────────────────────────────
   유틸 / 공통 컴포넌트
   ───────────────────────────────────────────── */
function useInjectFont() {
  useEffect(() => {
    if (document.getElementById("kb-pretendard")) return;
    const link = document.createElement("link");
    link.id = "kb-pretendard";
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css";
    document.head.appendChild(link);
  }, []);
}

const fontStack = `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif`;

/* ─────────────────────────────────────────────
   구글 보고서 전송 유틸
   - 사진은 전송 용량을 줄이기 위해 브라우저에서 JPEG로 압축합니다.
   - Google Apps Script Web App으로 직접 전달합니다.
   ───────────────────────────────────────────── */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function imageFileToCompressedDataUrl(file, maxSize = 1400, quality = 0.76) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const originalDataUrl = reader.result;
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, maxSize / img.width, maxSize / img.height);
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch (error) {
          // 압축 실패 시 원본 데이터 URL을 그대로 사용합니다.
          resolve(originalDataUrl);
        }
      };
      img.onerror = () => resolve(originalDataUrl);
      img.src = originalDataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function buildDailyReportPayload(state) {
  const checklist = SITE.regularPoints.map((point) => ({
    id: point.id,
    label: point.text,
    icon: point.icon,
    done: !!state.checks[point.id]?.done,
    photoTaken: !!state.checks[point.id]?.photo,
    photoName: state.checks[point.id]?.photoName || "",
    photoCapturedAt: state.checks[point.id]?.photoCapturedAt || "",
    photoDataUrl: state.checks[point.id]?.photoDataUrl || "",
  }));

  const specialOrders = SITE.todayOrders.map((order) => ({
    id: order.id,
    urgency: order.urgency,
    text: order.text,
    done: !!state.checks[`order_${order.id}`]?.done,
  }));

  const requiredPhotos = SITE.requiredPhotos.map((photo) => ({
    id: photo.id,
    label: photo.text,
    emoji: photo.emoji,
    taken: !!state.requiredPhotos[photo.id]?.taken,
    photoName: state.requiredPhotos[photo.id]?.photoName || "",
    photoCapturedAt: state.requiredPhotos[photo.id]?.photoCapturedAt || "",
    photoDataUrl: state.requiredPhotos[photo.id]?.photoDataUrl || "",
  }));

  return {
    appVersion: "kbclean-final-form-post-v1",
    submittedAt: new Date().toISOString(),
    site: SITE,
    staff: SITE.staff,
    manager: SITE.manager,
    clockInAt: state.clockInAt || "",
    clockOutAt: state.clockOutAt || "",
    checklist,
    specialOrders,
    requiredPhotos,
    notes: {
      noteMode: state.noteMode || "",
      chips: state.chips || [],
      text: state.text || "",
      voiceMimeType: state.voiceMimeType || "",
      voiceDuration: state.voiceDuration || 0,
      voiceDataUrl: state.voiceDataUrl || "",
    },
  };
}

const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwYOKtSWXCtLK2a0x4OmBiP6mUDi-sn8vbZsfuvTHZFS0GZsPDCdPdKx0kPO-rnotQq/exec";

async function submitDailyReport(payload) {
  // v6 FINAL: hidden form POST 방식
  // 이유: Apps Script Web App은 리다이렉트/CORS 때문에 fetch no-cors가 브라우저에서 조용히 실패할 수 있습니다.
  // form POST는 CORS의 영향을 받지 않아 Google Apps Script doPost 호출이 더 안정적입니다.
  const finalPayload = {
    ...payload,
    appVersion: "kbclean-final-form-post-v1",
    submitMode: "hidden-form-post-v6",
    clientSubmittedAt: new Date().toISOString(),
  };

  await submitToGasByHiddenForm(GAS_WEBAPP_URL, finalPayload);

  return {
    ok: true,
    message: "Google Drive/Sheet로 전송 요청을 보냈습니다. Google Drive를 새로고침해 확인하세요.",
  };
}

function submitToGasByHiddenForm(url, payload) {
  return new Promise((resolve, reject) => {
    try {
      const iframeName = `gas_submit_iframe_${Date.now()}`;
      const iframe = document.createElement("iframe");
      iframe.name = iframeName;
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;
      form.target = iframeName;
      form.style.display = "none";
      form.enctype = "application/x-www-form-urlencoded";

      const input = document.createElement("textarea");
      input.name = "payload";
      input.value = JSON.stringify(payload);
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();

      // cross-origin iframe 응답은 읽지 않습니다.
      // Apps Script 처리가 끝날 시간을 고려해 4초 뒤 성공 처리합니다.
      window.setTimeout(() => {
        try { form.remove(); } catch (e) {}
        try { iframe.remove(); } catch (e) {}
        resolve({ ok: true });
      }, 4000);
    } catch (error) {
      reject(error);
    }
  });
}


function Brand({ size = "md", invert = false }) {
  const ink = invert ? "#fff" : KB.navy;
  const sub = invert ? KB.goldLight : KB.gold;
  return (
    <div
      style={{ fontFamily: fontStack }}
      className="flex items-center gap-2 select-none"
    >
      <div
        style={{
          background: invert ? "#fff" : KB.navy,
          color: invert ? KB.navy : "#fff",
        }}
        className={`flex items-center justify-center rounded-md font-black ${
          size === "lg" ? "w-10 h-10 text-base" : "w-8 h-8 text-sm"
        }`}
      >
        KB
      </div>
      <div className="leading-tight">
        <div
          style={{ color: ink, letterSpacing: "-0.02em" }}
          className={`font-black ${size === "lg" ? "text-xl" : "text-base"}`}
        >
          KB클린
        </div>
        <div
          style={{ color: sub, letterSpacing: "0.18em" }}
          className="text-[10px] font-semibold"
        >
          FIELD OPS
        </div>
      </div>
    </div>
  );
}

function BigButton({ children, onClick, tone = "primary", disabled, icon: Icon }) {
  const tones = {
    primary: { bg: KB.navy, color: "#fff", hover: KB.navyDeep },
    gold: { bg: KB.gold, color: KB.navy, hover: "#B89548" },
    soft: { bg: "#fff", color: KB.navy, border: KB.navy },
    ghost: { bg: "transparent", color: KB.inkSoft, border: KB.line },
  };
  const t = tones[tone] || tones.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#E4E2DA" : t.bg,
        color: disabled ? "#A0A0A0" : t.color,
        border: t.border ? `1.5px solid ${t.border}` : "none",
        fontFamily: fontStack,
        letterSpacing: "-0.01em",
      }}
      className="w-full px-5 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:cursor-not-allowed shadow-sm"
    >
      {Icon && <Icon size={20} strokeWidth={2.4} />}
      {children}
    </button>
  );
}

function Pill({ children, tone = "navy" }) {
  const tones = {
    navy: { bg: KB.navy, color: "#fff" },
    gold: { bg: KB.goldMute, color: "#8B6914" },
    ok: { bg: KB.okSoft, color: KB.ok },
    warn: { bg: KB.warnSoft, color: KB.warn },
    bad: { bg: KB.badSoft, color: KB.bad },
    line: { bg: "#fff", color: KB.inkSoft, border: KB.line },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        background: t.bg,
        color: t.color,
        border: t.border ? `1px solid ${t.border}` : "none",
        fontFamily: fontStack,
      }}
      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold tracking-tight"
    >
      {children}
    </span>
  );
}

function Stepper({ step, total }) {
  return (
    <div className="flex items-center gap-1.5 px-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            background: i < step ? KB.navy : i === step ? KB.gold : KB.line,
            height: 4,
          }}
          className="flex-1 rounded-full transition-all"
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   루트 — 역할 선택
   ───────────────────────────────────────────── */
export default function App() {
  useInjectFont();
  const [role, setRole] = useState(null);

  return (
    <div
      style={{ background: KB.bg, fontFamily: fontStack, color: KB.ink }}
      className="min-h-screen"
    >
      {!role && <RoleHome onPick={setRole} />}
      {role === "work" && <WorkerApp onExit={() => setRole(null)} />}
      {role === "hospital" && <HospitalApp onExit={() => setRole(null)} />}
      {role === "admin" && <AdminPlaceholder onExit={() => setRole(null)} />}
    </div>
  );
}

function RoleHome({ onPick }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div
        style={{
          background: `linear-gradient(135deg, ${KB.navyDeep} 0%, ${KB.navy} 55%, ${KB.navyLight} 100%)`,
        }}
        className="px-6 pt-12 pb-10 text-white relative overflow-hidden"
      >
        <div
          style={{
            background: KB.gold,
            opacity: 0.15,
          }}
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl"
        />
        <div className="relative max-w-md mx-auto">
          <Brand size="lg" invert />
          <div className="mt-10">
            <div
              style={{ color: KB.goldLight, letterSpacing: "0.2em" }}
              className="text-[11px] font-bold"
            >
              KB CLEAN · FIELD MANAGEMENT
            </div>
            <h1
              style={{ letterSpacing: "-0.03em" }}
              className="mt-2 text-3xl font-black leading-tight"
            >
              병원 정기청소,<br />
              데이터로 증명합니다.
            </h1>
            <p className="mt-3 text-sm" style={{ color: "#C9D1F2" }}>
              직원 출근·증빙 사진·요청 처리·월간 보고까지<br />한 흐름으로 관리하는 KB클린 현장 시스템
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-5 pb-12 max-w-md mx-auto w-full">
        <div className="space-y-3">
          <RoleCard
            icon={UserRound}
            tag="STAFF"
            title="직원으로 시작"
            desc="QR · 출근 · 사진 · 퇴근까지 6단계로"
            onClick={() => onPick("work")}
            accent={KB.navy}
          />
          <RoleCard
            icon={Hospital}
            tag="HOSPITAL"
            title="병원으로 시작"
            desc="요청 등록 · 처리 현황 · 월간 보고서 열람"
            onClick={() => onPick("hospital")}
            accent={KB.gold}
          />
          <RoleCard
            icon={ShieldCheck}
            tag="ADMIN"
            title="관리자로 시작"
            desc="현장 통합 보드 · 직원 작업지시 · 보고서 발송"
            onClick={() => onPick("admin")}
            accent={KB.inkSoft}
          />
        </div>

        <div
          style={{ background: "#fff", border: `1px solid ${KB.line}` }}
          className="mt-6 rounded-xl p-4 text-xs"
        >
          <div className="flex items-center gap-2 font-bold" style={{ color: KB.navy }}>
            <Sparkles size={14} /> 데모 안내
          </div>
          <p className="mt-1.5" style={{ color: KB.inkSoft }}>
            리투의원 데이터가 미리 채워져 있습니다. 실제 운영 시에는 QR로 현장·직원이 자동 인식됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ icon: Icon, tag, title, desc, onClick, accent }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ background: "#fff", borderColor: KB.line }}
      className="w-full text-left rounded-2xl border p-5 flex items-center gap-4 hover:shadow-md transition"
    >
      <div
        style={{ background: accent + "14", color: accent }}
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      >
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          style={{ color: accent, letterSpacing: "0.18em" }}
          className="text-[10px] font-bold"
        >
          {tag}
        </div>
        <div
          style={{ color: KB.navy, letterSpacing: "-0.02em" }}
          className="text-base font-black"
        >
          {title}
        </div>
        <div className="text-xs mt-0.5" style={{ color: KB.inkSoft }}>
          {desc}
        </div>
      </div>
      <ChevronRight size={20} style={{ color: KB.inkMute }} />
    </motion.button>
  );
}

/* ═════════════════════════════════════════════
   ▒▒ 직원 위저드 ▒▒
   ═════════════════════════════════════════════ */
function WorkerApp({ onExit }) {
  const [step, setStep] = useState(0);
  const TOTAL = 6;

  const [state, setState] = useState({
    siteConfirmed: false,
    clockInAt: null,
    clockOutAt: null,
    checks: {}, // pointId -> { done: bool, photo: bool }
    requiredPhotos: {}, // rpId -> { taken, photoName, photoCapturedAt }
    noteMode: null, // null | 'none' | 'voice' | 'chips' | 'text'
    chips: [],
    text: "",
    voiceBlobUrl: null,
    voiceDataUrl: null,
    voiceMimeType: "",
    voiceDuration: 0,
    voiceError: "",
    submitStatus: "idle",
    submitError: "",
    reportUrl: "",
    reportPdfUrl: "",
    reportSheetUrl: "",
  });

  const update = (patch) => setState((s) => ({ ...s, ...patch }));

  const goNext = () => setStep((s) => Math.min(TOTAL, s + 1));
  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fff" }}>
      {/* 상단 헤더 */}
      <div
        style={{ background: "#fff", borderBottom: `1px solid ${KB.line}` }}
        className="sticky top-0 z-30"
      >
        <div className="max-w-md mx-auto px-4 pt-3 pb-3">
          <div className="flex items-center justify-between">
            <button
              onClick={step === 0 ? onExit : goPrev}
              className="flex items-center gap-1 text-sm font-semibold"
              style={{ color: KB.inkSoft }}
            >
              <ArrowLeft size={18} />
              {step === 0 ? "역할 선택" : "이전"}
            </button>
            <div
              style={{ color: KB.inkMute, letterSpacing: "0.18em" }}
              className="text-[10px] font-bold"
            >
              STEP {step + 1} / {TOTAL + 1}
            </div>
          </div>
          <div className="mt-3">
            <Stepper step={step} total={TOTAL + 1} />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full px-5 pb-32 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {step === 0 && (
              <StepSiteConfirm state={state} update={update} onNext={goNext} />
            )}
            {step === 1 && (
              <StepClockIn state={state} update={update} onNext={goNext} />
            )}
            {step === 2 && (
              <StepChecklist state={state} update={update} onNext={goNext} />
            )}
            {step === 3 && (
              <StepRequiredPhotos state={state} update={update} onNext={goNext} />
            )}
            {step === 4 && (
              <StepNotes state={state} update={update} onNext={goNext} />
            )}
            {step === 5 && (
              <StepSummary state={state} update={update} onNext={goNext} />
            )}
            {step === 6 && <StepDone state={state} onExit={onExit} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepHeader({ tag, title, desc }) {
  return (
    <div className="mb-6">
      <div
        style={{ color: KB.gold, letterSpacing: "0.2em" }}
        className="text-[10px] font-black"
      >
        {tag}
      </div>
      <h2
        style={{ color: KB.navy, letterSpacing: "-0.025em" }}
        className="mt-1 text-2xl font-black leading-tight"
      >
        {title}
      </h2>
      {desc && (
        <p className="mt-2 text-sm" style={{ color: KB.inkSoft }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* Step 0 — 현장 확인 */
function StepSiteConfirm({ update, onNext }) {
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 ${
    ["일", "월", "화", "수", "목", "금", "토"][now.getDay()]
  }요일`;

  return (
    <div>
      <StepHeader
        tag="현장 확인"
        title="오늘 청소할 현장이 맞나요?"
        desc="QR로 자동 인식했어요. 다르면 아래에서 변경하세요."
      />

      <div
        style={{
          background: `linear-gradient(135deg, ${KB.navyDeep} 0%, ${KB.navy} 100%)`,
        }}
        className="rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center gap-2 text-xs" style={{ color: KB.goldLight }}>
          <MapPin size={14} /> {dateStr}
        </div>
        <div className="mt-3 text-3xl font-black" style={{ letterSpacing: "-0.03em" }}>
          {SITE.name}
        </div>
        <div className="mt-1 text-sm opacity-80">
          {SITE.type} · {SITE.address}
        </div>
        <div className="mt-5 pt-5 border-t border-white/15 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-[11px] opacity-60">담당자</div>
            <div className="font-bold mt-0.5">{SITE.manager}</div>
          </div>
          <div>
            <div className="text-[11px] opacity-60">오늘 작업자</div>
            <div className="font-bold mt-0.5">{SITE.staff}</div>
          </div>
          <div className="col-span-2">
            <div className="text-[11px] opacity-60">마감 규칙</div>
            <div className="font-bold mt-0.5">{SITE.closeRule}</div>
          </div>
        </div>
      </div>

      {SITE.todayOrders.length > 0 && (
        <div
          style={{ background: KB.goldMute, border: `1px solid ${KB.goldLight}` }}
          className="mt-4 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 font-black text-sm" style={{ color: "#8B6914" }}>
            <Star size={14} fill="#8B6914" /> 오늘은 평소와 달라요
          </div>
          <ul className="mt-3 space-y-2">
            {SITE.todayOrders.map((o) => (
              <li key={o.id} className="flex gap-2 text-sm" style={{ color: KB.navy }}>
                <span className="font-black">·</span>
                <span>
                  {o.urgency === "high" && (
                    <span style={{ color: KB.bad }} className="font-black mr-1">
                      [중요]
                    </span>
                  )}
                  {o.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 space-y-2.5">
        <BigButton onClick={onNext} icon={ArrowRight}>
          네, 맞아요 — 다음으로
        </BigButton>
        <BigButton tone="ghost">다른 현장으로 변경</BigButton>
      </div>
    </div>
  );
}

/* Step 1 — 출근 */
function StepClockIn({ state, update, onNext }) {
  const [pressing, setPressing] = useState(false);
  const [done, setDone] = useState(false);

  const handleClock = () => {
    setPressing(true);
    setTimeout(() => {
      const now = new Date();
      const t = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      update({ clockInAt: t });
      setDone(true);
      setTimeout(onNext, 900);
    }, 600);
  };

  return (
    <div>
      <StepHeader
        tag="출근"
        title="출근 도장 찍기"
        desc="GPS와 시간이 자동으로 기록됩니다."
      />

      <div
        style={{ background: "#fff", border: `1px solid ${KB.line}` }}
        className="rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: KB.inkSoft }}>
          <MapPin size={14} /> {SITE.address}
        </div>
        <div className="mt-2 text-xs" style={{ color: KB.inkMute }}>
          GPS 정확도: 약 8m (정상)
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleClock}
          disabled={done}
          style={{
            background: done
              ? KB.ok
              : `radial-gradient(circle at 30% 30%, ${KB.navyLight}, ${KB.navyDeep})`,
            boxShadow: `0 20px 50px -10px ${KB.navy}66`,
          }}
          className="w-52 h-52 rounded-full text-white font-black text-xl flex flex-col items-center justify-center gap-2"
        >
          {done ? (
            <>
              <CheckCircle2 size={48} strokeWidth={2.2} />
              <div style={{ letterSpacing: "-0.02em" }}>출근 완료</div>
              <div className="text-sm font-bold" style={{ color: KB.goldLight }}>
                {state.clockInAt}
              </div>
            </>
          ) : (
            <>
              <LogIn size={48} strokeWidth={2.2} />
              <div style={{ letterSpacing: "-0.02em" }}>
                {pressing ? "기록 중..." : "출근하기"}
              </div>
              <div className="text-xs font-bold opacity-70">탭하세요</div>
            </>
          )}
        </motion.button>
        <div className="mt-6 text-xs" style={{ color: KB.inkMute }}>
          {done ? "잠시 후 다음 단계로 이동합니다" : "위치가 다르면 안내가 표시됩니다"}
        </div>
      </div>
    </div>
  );
}

/* Step 2 — 체크리스트 */
function StepChecklist({ state, update, onNext }) {
  const photoInputRefs = useRef({});

  const markOrderDone = (id) => {
    const cur = state.checks[id] || {};
    update({
      checks: { ...state.checks, [id]: { ...cur, done: !cur.done } },
    });
  };

  const requestPhoto = (id) => {
    photoInputRefs.current[id]?.click();
  };

  const handlePhotoCaptured = async (id, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const photoDataUrl = await imageFileToCompressedDataUrl(file);
    const cur = state.checks[id] || {};
    update({
      checks: {
        ...state.checks,
        [id]: {
          ...cur,
          done: true,
          photo: true,
          photoName: file.name,
          photoCapturedAt: new Date().toISOString(),
          photoDataUrl,
        },
      },
    });

    // 같은 항목을 다시 촬영할 수 있도록 input 값을 비웁니다.
    event.target.value = "";
  };

  const doneCount = SITE.regularPoints.filter(
    (p) => state.checks[p.id]?.done
  ).length;
  const total = SITE.regularPoints.length;

  return (
    <div>
      <StepHeader
        tag="오늘 할 일"
        title="정기 점검 항목 체크"
        desc="촬영을 완료해야 체크됩니다. 왼쪽 동그라미나 촬영 버튼을 누르면 카메라가 열립니다."
      />

      <div
        style={{ background: KB.navy, color: "#fff" }}
        className="rounded-2xl px-5 py-4 flex items-center justify-between"
      >
        <div>
          <div className="text-[11px] font-bold" style={{ color: KB.goldLight, letterSpacing: "0.15em" }}>
            진행 현황
          </div>
          <div className="text-2xl font-black mt-0.5">
            {doneCount} / {total}
            <span className="text-sm font-bold opacity-60 ml-1">완료</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-bold opacity-60">
            {SITE.name}
          </div>
          <div className="text-xs font-bold opacity-80 mt-0.5">
            {state.clockInAt} 출근
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {SITE.regularPoints.map((p) => {
          const c = state.checks[p.id] || {};
          return (
            <div
              key={p.id}
              style={{
                background: c.done ? KB.okSoft : "#fff",
                border: `1px solid ${c.done ? "#B5DDC8" : KB.line}`,
              }}
              className="rounded-xl p-3.5 flex items-center gap-3"
            >
              <input
                ref={(el) => {
                  if (el) photoInputRefs.current[p.id] = el;
                }}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => handlePhotoCaptured(p.id, event)}
              />
              <button
                onClick={() => requestPhoto(p.id)}
                style={{
                  background: c.done ? KB.ok : "#fff",
                  border: `2px solid ${c.done ? KB.ok : KB.line}`,
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                aria-label={`${p.text} 촬영하기`}
              >
                {c.done && <Check size={16} color="#fff" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <div
                  className="font-bold text-sm flex items-center gap-1.5"
                  style={{
                    color: KB.navy,
                    textDecoration: c.done ? "line-through" : "none",
                    opacity: c.done ? 0.6 : 1,
                  }}
                >
                  <span>{p.icon}</span>
                  {p.text}
                </div>
                {!c.done && (
                  <div className="text-[10px] font-bold mt-0.5" style={{ color: KB.inkMute }}>
                    촬영 완료 후 자동 체크
                  </div>
                )}
              </div>
              <button
                onClick={() => requestPhoto(p.id)}
                style={{
                  background: c.photo ? KB.gold : "#fff",
                  border: `1.5px solid ${c.photo ? KB.gold : KB.line}`,
                  color: c.photo ? "#fff" : KB.inkSoft,
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Camera size={14} />
                {c.photo ? "촬영됨" : "촬영"}
              </button>
            </div>
          );
        })}
      </div>

      {/* 오늘의 특별 작업지시 */}
      <div className="mt-6">
        <div
          style={{ color: KB.inkSoft, letterSpacing: "0.15em" }}
          className="text-[11px] font-black mb-2"
        >
          오늘의 특별 작업지시
        </div>
        <div className="space-y-2">
          {SITE.todayOrders.map((o) => {
            const id = "order_" + o.id;
            const c = state.checks[id] || {};
            return (
              <div
                key={o.id}
                style={{
                  background: c.done ? KB.okSoft : KB.goldMute,
                  border: `1px solid ${c.done ? "#B5DDC8" : KB.goldLight}`,
                }}
                className="rounded-xl p-3.5 flex items-start gap-3"
              >
                <button
                  onClick={() => markOrderDone(id)}
                  style={{
                    background: c.done ? KB.ok : "#fff",
                    border: `2px solid ${c.done ? KB.ok : "#8B6914"}`,
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                >
                  {c.done && <Check size={16} color="#fff" strokeWidth={3} />}
                </button>
                <div className="flex-1 text-sm font-bold" style={{ color: KB.navy }}>
                  {o.urgency === "high" && (
                    <span style={{ color: KB.bad }} className="font-black mr-1">
                      [중요]
                    </span>
                  )}
                  {o.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <BigButton onClick={onNext} icon={ArrowRight}>
          다음 — 필수 사진 단계로
        </BigButton>
        <div className="text-center mt-2 text-xs" style={{ color: KB.inkMute }}>
          정기 점검 항목은 사진 촬영이 완료된 항목만 체크됩니다
        </div>
      </div>
    </div>
  );
}

/* Step 3 — 필수 사진 */
function StepRequiredPhotos({ state, update, onNext }) {
  const photoInputRefs = useRef({});

  const isTaken = (id) => {
    const value = state.requiredPhotos[id];
    return value === true || value?.taken === true;
  };

  const requestPhoto = (id) => {
    photoInputRefs.current[id]?.click();
  };

  const handlePhotoCaptured = async (id, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const photoDataUrl = await imageFileToCompressedDataUrl(file);
    update({
      requiredPhotos: {
        ...state.requiredPhotos,
        [id]: {
          taken: true,
          photoName: file.name,
          photoCapturedAt: new Date().toISOString(),
          photoDataUrl,
        },
      },
    });

    // 같은 항목을 다시 촬영할 수 있도록 input 값을 비웁니다.
    event.target.value = "";
  };

  const total = SITE.requiredPhotos.length;
  const done = SITE.requiredPhotos.filter((rp) => isTaken(rp.id)).length;

  return (
    <div>
      <StepHeader
        tag="필수 증빙"
        title="현장 공통 사진을 남겨주세요"
        desc="필수 증빙 사진도 실제 촬영/선택이 완료되어야 촬영 완료로 표시됩니다."
      />

      <div className="flex items-center gap-2 text-xs font-bold mb-3" style={{ color: KB.inkSoft }}>
        <ImagePlus size={14} />
        <span>{done} / {total} 장 완료</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {SITE.requiredPhotos.map((rp) => {
          const taken = isTaken(rp.id);
          const photoInfo = state.requiredPhotos[rp.id];
          return (
            <div key={rp.id} className="relative">
              <input
                ref={(el) => {
                  if (el) photoInputRefs.current[rp.id] = el;
                }}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => handlePhotoCaptured(rp.id, event)}
              />
              <button
                onClick={() => requestPhoto(rp.id)}
                style={{
                  background: taken
                    ? `linear-gradient(135deg, ${KB.navy}, ${KB.navyLight})`
                    : "#fff",
                  border: `1.5px solid ${taken ? KB.navy : KB.line}`,
                  aspectRatio: "1 / 1",
                }}
                className="w-full rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden"
              >
                {taken && (
                  <div
                    style={{ background: KB.gold }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    <Check size={14} color={KB.navy} strokeWidth={3} />
                  </div>
                )}
                <div className="text-3xl">{rp.emoji}</div>
                <div
                  className="mt-2 text-xs font-bold text-center leading-tight"
                  style={{ color: taken ? "#fff" : KB.navy }}
                >
                  {rp.text}
                </div>
                <div
                  className="mt-2 text-[10px] font-bold"
                  style={{ color: taken ? KB.goldLight : KB.inkMute }}
                >
                  {taken ? "촬영 완료" : "탭해서 촬영"}
                </div>
                {taken && photoInfo?.photoCapturedAt && (
                  <div className="mt-1 text-[9px] font-bold opacity-70" style={{ color: KB.goldLight }}>
                    {new Date(photoInfo.photoCapturedAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div
        style={{ background: "#fff", border: `1px dashed ${KB.line}` }}
        className="mt-4 rounded-xl p-3 text-xs flex items-start gap-2"
      >
        <Camera size={14} style={{ color: KB.gold }} className="mt-0.5 shrink-0" />
        <div style={{ color: KB.inkSoft }}>
          <b style={{ color: KB.navy }}>같은 앵글로 촬영</b>해주세요. PC에서는 파일 선택창이 열리고, 휴대폰에서는 카메라 촬영 화면이 열립니다.
        </div>
      </div>

      <div className="mt-6">
        <BigButton onClick={onNext} icon={ArrowRight} disabled={done < total}>
          {done < total ? `${total - done}장 남았어요` : "다음 — 특이사항"}
        </BigButton>
      </div>
    </div>
  );
}

/* Step 4 — 특이사항 */
function StepNotes({ state, update, onNext }) {
  const toggleChip = (chip) => {
    const has = state.chips.includes(chip);
    const nextChips = has
      ? state.chips.filter((c) => c !== chip)
      : [...state.chips, chip];

    update({
      noteMode: nextChips.length > 0 ? "chips" : null,
      chips: nextChips,
    });
  };

  const toggleNone = () => {
    if (state.noteMode === "none") {
      update({ noteMode: null });
      return;
    }

    update({
      noteMode: "none",
      chips: [],
      text: "",
      voiceBlobUrl: null,
      voiceDataUrl: null,
      voiceMimeType: "",
      voiceDuration: 0,
      voiceError: "",
    });
  };

  const hasAnything =
    state.noteMode === "none" ||
    state.chips.length > 0 ||
    state.text.trim().length > 0 ||
    Boolean(state.voiceBlobUrl);

  return (
    <div>
      <StepHeader
        tag="특이사항"
        title="오늘 따로 보고할 게 있나요?"
        desc="특이사항 없음은 다시 누르면 해제됩니다. 음성 녹음은 브라우저 마이크 권한을 사용합니다."
      />

      {/* 특이사항 없음 */}
      <button
        onClick={toggleNone}
        style={{
          background: state.noteMode === "none" ? KB.ok : "#fff",
          border: `2px solid ${state.noteMode === "none" ? KB.ok : KB.line}`,
          color: state.noteMode === "none" ? "#fff" : KB.navy,
        }}
        className="w-full p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2"
      >
        <ThumbsUp size={22} />
        {state.noteMode === "none" ? "특이사항 없음 선택됨" : "특이사항 없음"}
      </button>
      {state.noteMode === "none" && (
        <div className="mt-2 text-center text-[11px] font-bold" style={{ color: KB.inkMute }}>
          다시 누르면 선택이 해제됩니다.
        </div>
      )}

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: KB.line }} />
        <div className="text-[10px] font-bold" style={{ color: KB.inkMute, letterSpacing: "0.2em" }}>
          또는
        </div>
        <div className="flex-1 h-px" style={{ background: KB.line }} />
      </div>

      {/* 자주 쓰는 칩 */}
      <div
        style={{ color: KB.inkSoft, letterSpacing: "0.15em" }}
        className="text-[11px] font-black mb-2"
      >
        자주 쓰는 메모
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_CHIPS.map((c) => {
          const on = state.chips.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggleChip(c)}
              style={{
                background: on ? KB.navy : "#fff",
                color: on ? "#fff" : KB.navy,
                border: `1.5px solid ${on ? KB.navy : KB.line}`,
              }}
              className="px-3.5 py-2 rounded-full text-sm font-bold"
            >
              {on && "✓ "}{c}
            </button>
          );
        })}
      </div>

      {/* 음성 / 텍스트 */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <VoiceButton state={state} update={update} />
        <button
          onClick={() => update({ noteMode: "text" })}
          style={{
            background: state.noteMode === "text" ? KB.goldMute : "#fff",
            border: `1.5px solid ${state.noteMode === "text" ? KB.gold : KB.line}`,
            color: KB.navy,
          }}
          className="rounded-xl p-3 font-bold text-sm flex flex-col items-center gap-1"
        >
          <FileText size={20} />
          직접 입력
        </button>
      </div>

      {state.noteMode === "text" && (
        <textarea
          value={state.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder="예: 6층 화장실 수도꼭지 약간 헐거움. 다음 방문 때 점검 필요"
          style={{ borderColor: KB.line, fontFamily: fontStack }}
          className="mt-3 w-full rounded-xl border p-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-offset-0"
        />
      )}

      {state.voiceBlobUrl && (
        <div
          style={{ background: KB.okSoft, border: `1px solid #B5DDC8` }}
          className="mt-3 rounded-xl p-3"
        >
          <div className="text-xs font-black mb-2" style={{ color: KB.ok }}>
            음성 메모 녹음 완료 {state.voiceDuration ? `· ${state.voiceDuration}초` : ""}
          </div>
          <audio controls src={state.voiceBlobUrl} className="w-full" />
        </div>
      )}

      {state.voiceError && (
        <div
          style={{ background: KB.badSoft, color: KB.bad, border: `1px solid #F8C9B8` }}
          className="mt-3 rounded-xl p-3 text-xs font-bold"
        >
          {state.voiceError}
        </div>
      )}

      <div className="mt-6">
        <BigButton onClick={onNext} icon={ArrowRight} disabled={!hasAnything}>
          {hasAnything ? "다음 — 요약 확인" : "위에서 하나 선택해주세요"}
        </BigButton>
      </div>
    </div>
  );
}

function VoiceButton({ state, update }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startedAtRef = useRef(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      update({
        noteMode: "voice",
        voiceError:
          "이 브라우저에서는 바로 녹음이 지원되지 않습니다. 휴대폰 Chrome/Safari 최신 버전 또는 HTTPS 주소에서 다시 시도해주세요.",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      startedAtRef.current = Date.now();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const voiceDataUrl = await blobToDataUrl(blob);
        const duration = startedAtRef.current
          ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
          : 0;

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        update({
          noteMode: "voice",
          voiceBlobUrl: url,
          voiceDataUrl,
          voiceMimeType: mimeType,
          voiceDuration: duration,
          voiceError: "",
        });
      };

      recorder.start();
      setRecording(true);
      update({ noteMode: "voice", voiceError: "" });
    } catch (error) {
      update({
        noteMode: "voice",
        voiceError:
          "마이크 권한이 허용되지 않았습니다. 브라우저 주소창의 권한 설정에서 마이크를 허용해주세요.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const toggle = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      onClick={toggle}
      style={{
        background: recording ? "#FEE2E2" : state.noteMode === "voice" ? KB.goldMute : "#fff",
        border: `1.5px solid ${
          recording ? "#FCA5A5" : state.noteMode === "voice" ? KB.gold : KB.line
        }`,
        color: recording ? "#B91C1C" : KB.navy,
      }}
      className="rounded-xl p-3 font-bold text-sm flex flex-col items-center gap-1"
    >
      {recording ? (
        <>
          <MicOff size={20} />
          녹음 중지
          <span className="text-[10px] font-bold opacity-70">탭하면 저장</span>
        </>
      ) : state.voiceBlobUrl ? (
        <>
          <Mic size={20} />
          다시 녹음
          <span className="text-[10px] font-bold opacity-70">기존 녹음 교체</span>
        </>
      ) : (
        <>
          <Mic size={20} />
          음성 녹음
          <span className="text-[10px] font-bold opacity-70">마이크 권한 필요</span>
        </>
      )}
    </button>
  );
}

/* Step 5 — 요약 + 퇴근 */
function StepSummary({ state, update, onNext }) {
  const [submitting, setSubmitting] = useState(false);

  const doneChecks = Object.values(state.checks).filter((c) => c.done).length;
  const totalChecks =
    SITE.regularPoints.length + SITE.todayOrders.length;
  const checklistPhotoCount = Object.values(state.checks).filter((c) => c.photo).length;
  const requiredPhotoCount = Object.values(state.requiredPhotos).filter(
    (p) => p === true || p?.taken === true
  ).length;
  const photoCount = checklistPhotoCount + requiredPhotoCount;

  const handleClockOut = async () => {
    setSubmitting(true);
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    const finalState = { ...state, clockOutAt: t };
    update({ clockOutAt: t, submitStatus: "submitting", submitError: "" });

    try {
      const payload = buildDailyReportPayload(finalState);
      const result = await submitDailyReport(payload);
      update({
        clockOutAt: t,
        submitStatus: "sent",
        submitError: "",
        reportUrl: result.slideUrl || "",
        reportPdfUrl: result.pdfUrl || "",
        reportSheetUrl: result.sheetUrl || "",
      });
    } catch (error) {
      update({
        clockOutAt: t,
        submitStatus: "failed",
        submitError: error.message || "구글 보고서 전송에 실패했습니다.",
      });
    }

    setSubmitting(false);
    setTimeout(onNext, 80);
  };

  return (
    <div>
      <StepHeader
        tag="오늘 한 일"
        title="요약 확인 후 퇴근"
        desc="퇴근하고 보고서 보내기를 누르면 퇴근 시간이 자동 기록되고 Google 보고서 생성 요청이 전송됩니다."
      />

      <div
        style={{
          background: `linear-gradient(135deg, #fff 0%, ${KB.goldMute} 100%)`,
          border: `1px solid ${KB.line}`,
        }}
        className="rounded-2xl p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold" style={{ color: KB.gold, letterSpacing: "0.15em" }}>
              DAILY REPORT
            </div>
            <div className="text-xl font-black mt-1" style={{ color: KB.navy }}>
              {SITE.name}
            </div>
          </div>
          <Brand size="md" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <SummaryCell label="출근" value={state.clockInAt || "—"} />
          <SummaryCell label="퇴근" value={state.clockOutAt || "전송 시 기록"} />
          <SummaryCell label="체크" value={`${doneChecks}/${totalChecks}`} />
          <SummaryCell label="사진" value={`${photoCount}장`} />
        </div>

        <div
          style={{ borderTop: `1px dashed ${KB.line}` }}
          className="mt-4 pt-4 text-sm"
        >
          <div
            className="text-[11px] font-black mb-1"
            style={{ color: KB.inkSoft, letterSpacing: "0.15em" }}
          >
            특이사항
          </div>
          {state.noteMode === "none" && (
            <div style={{ color: KB.ok }} className="font-bold">
              ✓ 특이사항 없음
            </div>
          )}
          {state.chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {state.chips.map((c) => (
                <Pill key={c} tone="gold">{c}</Pill>
              ))}
            </div>
          )}
          {state.text && state.noteMode !== "none" && (
            <div className="mt-2" style={{ color: KB.navy }}>
              {state.text}
            </div>
          )}
          {state.voiceBlobUrl && (
            <div className="mt-3">
              <div className="text-xs font-black mb-1" style={{ color: KB.ok }}>
                음성 메모 첨부됨 {state.voiceDuration ? `· ${state.voiceDuration}초` : ""}
              </div>
              <audio controls src={state.voiceBlobUrl} className="w-full" />
            </div>
          )}
        </div>
      </div>

      <div
        style={{ background: "#fff", border: `1px solid ${KB.line}` }}
        className="mt-4 rounded-xl p-3 text-xs"
      >
        <div className="font-black" style={{ color: KB.navy }}>
          전송 시 포함되는 시간
        </div>
        <div className="mt-1" style={{ color: KB.inkSoft }}>
          출근 시간: <b>{state.clockInAt || "—"}</b> · 퇴근 시간: <b>버튼 클릭 시 자동 기록</b>
        </div>
      </div>

      <div className="mt-8">
        <BigButton
          onClick={handleClockOut}
          icon={submitting ? null : LogOut}
          tone="primary"
          disabled={submitting}
        >
          {submitting ? "Google 보고서 생성 중..." : "퇴근하고 보고서 보내기"}
        </BigButton>
        <button
          className="w-full mt-3 text-sm font-bold"
          style={{ color: KB.inkSoft }}
        >
          오늘 다른 현장도 가야 해요
        </button>
      </div>
    </div>
  );
}

function SummaryCell({ label, value }) {
  return (
    <div
      style={{ background: "#fff", border: `1px solid ${KB.line}` }}
      className="rounded-xl p-3 text-center"
    >
      <div
        className="text-[10px] font-bold"
        style={{ color: KB.inkSoft, letterSpacing: "0.15em" }}
      >
        {label}
      </div>
      <div className="mt-0.5 text-lg font-black" style={{ color: KB.navy }}>
        {value}
      </div>
    </div>
  );
}

/* Step 6 — 완료 */
function StepDone({ state, onExit }) {
  const doneChecks = Object.values(state.checks).filter((c) => c.done).length;
  const totalChecks = SITE.regularPoints.length + SITE.todayOrders.length;
  const checklistPhotoCount = Object.values(state.checks).filter((c) => c.photo).length;
  const requiredPhotoCount = Object.values(state.requiredPhotos).filter(
    (p) => p === true || p?.taken === true
  ).length;
  const photoCount = checklistPhotoCount + requiredPhotoCount;

  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${KB.gold}, #B89548)`,
          boxShadow: `0 20px 50px -10px ${KB.gold}66`,
        }}
        className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
      >
        <Check size={64} color={KB.navy} strokeWidth={3} />
      </motion.div>
      <h2
        className="mt-8 text-3xl font-black"
        style={{ color: KB.navy, letterSpacing: "-0.03em" }}
      >
        보고서 전송 완료
      </h2>
      <p className="mt-3 text-sm" style={{ color: KB.inkSoft }}>
        오늘의 보고서가 관리자에게 전송되었습니다.<br />
        출근·퇴근 시간이 함께 기록되었습니다.
      </p>

      <div
        style={{ background: "#fff", border: `1px solid ${KB.line}` }}
        className="mt-8 rounded-2xl p-4 text-left"
      >
        <div className="text-xs font-bold" style={{ color: KB.gold, letterSpacing: "0.15em" }}>
          SENT REPORT
        </div>
        <div className="mt-1 text-lg font-black" style={{ color: KB.navy }}>
          {SITE.name}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <SummaryCell label="출근" value={state.clockInAt || "—"} />
          <SummaryCell label="퇴근" value={state.clockOutAt || "—"} />
          <SummaryCell label="체크" value={`${doneChecks}/${totalChecks}`} />
          <SummaryCell label="사진" value={`${photoCount}장`} />
        </div>

        {state.submitStatus === "sent" && (state.reportUrl || state.reportPdfUrl) && (
          <div className="mt-4 grid grid-cols-1 gap-2">
            {state.reportUrl && (
              <a
                href={state.reportUrl}
                target="_blank"
                rel="noreferrer"
                style={{ background: KB.navy, color: "#fff" }}
                className="rounded-xl px-4 py-3 text-center text-sm font-black"
              >
                생성된 구글 슬라이드 열기
              </a>
            )}
            {state.reportPdfUrl && (
              <a
                href={state.reportPdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{ background: KB.gold, color: KB.navy }}
                className="rounded-xl px-4 py-3 text-center text-sm font-black"
              >
                PDF 다운로드/확인
              </a>
            )}
          </div>
        )}

        {state.submitStatus === "failed" && (
          <div
            style={{ background: KB.badSoft, color: KB.bad }}
            className="mt-4 rounded-xl p-3 text-sm font-bold"
          >
            Google 보고서 전송 실패: {state.submitError || "환경변수 또는 Apps Script URL을 확인해주세요."}
          </div>
        )}
        <div className="mt-4 pt-4 text-sm" style={{ borderTop: `1px dashed ${KB.line}` }}>
          <div className="text-[11px] font-black mb-1" style={{ color: KB.inkSoft, letterSpacing: "0.15em" }}>
            특이사항
          </div>
          {state.noteMode === "none" && (
            <div style={{ color: KB.ok }} className="font-bold">✓ 특이사항 없음</div>
          )}
          {state.chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {state.chips.map((c) => <Pill key={c} tone="gold">{c}</Pill>)}
            </div>
          )}
          {state.text && state.noteMode !== "none" && (
            <div className="mt-2" style={{ color: KB.navy }}>{state.text}</div>
          )}
          {state.voiceBlobUrl && (
            <div className="mt-3">
              <div className="text-xs font-black mb-1" style={{ color: KB.ok }}>
                음성 메모 첨부됨 {state.voiceDuration ? `· ${state.voiceDuration}초` : ""}
              </div>
              <audio controls src={state.voiceBlobUrl} className="w-full" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 max-w-xs mx-auto">
        <BigButton onClick={onExit} tone="ghost">
          처음 화면으로
        </BigButton>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   ▒▒ 병원 앱 ▒▒
   ═════════════════════════════════════════════ */
function HospitalApp({ onExit }) {
  const [tab, setTab] = useState("report"); // home, request, mine, report

  return (
    <div className="min-h-screen flex flex-col" style={{ background: KB.bg }}>
      {/* 상단 헤더 */}
      <header
        style={{ background: "#fff", borderBottom: `1px solid ${KB.line}` }}
        className="sticky top-0 z-30"
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: KB.inkSoft }}
          >
            <ArrowLeft size={16} /> 역할
          </button>
          <div className="text-center">
            <div
              className="text-[10px] font-bold"
              style={{ color: KB.gold, letterSpacing: "0.18em" }}
            >
              HOSPITAL
            </div>
            <div className="text-sm font-black" style={{ color: KB.navy, letterSpacing: "-0.02em" }}>
              리투의원
            </div>
          </div>
          <Brand size="md" />
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full pb-24">
        {tab === "home" && <HospHome setTab={setTab} />}
        {tab === "request" && <HospNewRequest setTab={setTab} />}
        {tab === "mine" && <HospMyRequests setTab={setTab} />}
        {tab === "report" && <HospMonthlyReport />}
      </main>

      {/* 하단 탭 */}
      <nav
        style={{ background: "#fff", borderTop: `1px solid ${KB.line}` }}
        className="fixed bottom-0 inset-x-0 z-30"
      >
        <div className="max-w-md mx-auto px-2 py-2 grid grid-cols-4 gap-1">
          <HospTab icon={Hospital} label="홈" active={tab === "home"} onClick={() => setTab("home")} />
          <HospTab icon={Plus} label="요청" active={tab === "request"} onClick={() => setTab("request")} />
          <HospTab icon={ClipboardList} label="내 요청" active={tab === "mine"} onClick={() => setTab("mine")} />
          <HospTab icon={FileText} label="보고서" active={tab === "report"} onClick={() => setTab("report")} />
        </div>
      </nav>
    </div>
  );
}

function HospTab({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ color: active ? KB.navy : KB.inkMute }}
      className="flex flex-col items-center gap-0.5 py-2 rounded-lg"
    >
      <Icon size={20} strokeWidth={active ? 2.6 : 2} />
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function HospHome({ setTab }) {
  return (
    <div className="px-4 pt-4 space-y-3">
      <div
        style={{
          background: `linear-gradient(135deg, ${KB.navyDeep}, ${KB.navy})`,
        }}
        className="rounded-2xl p-5 text-white relative overflow-hidden"
      >
        <div
          style={{ background: KB.gold, opacity: 0.2 }}
          className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-2xl"
        />
        <div className="relative">
          <div
            className="text-[10px] font-bold"
            style={{ color: KB.goldLight, letterSpacing: "0.2em" }}
          >
            KB CLEAN × 리투의원
          </div>
          <div className="mt-2 text-2xl font-black leading-tight" style={{ letterSpacing: "-0.02em" }}>
            요청은 24시간 내<br />
            처리해 드립니다.
          </div>
          <div className="mt-4 text-xs opacity-80">
            담당 매니저 박원준 · 010-XXXX-XXXX
          </div>
        </div>
      </div>

      <button
        onClick={() => setTab("request")}
        style={{ background: KB.gold }}
        className="w-full rounded-2xl p-5 text-left flex items-center gap-4"
      >
        <div
          style={{ background: "#fff" }}
          className="w-12 h-12 rounded-xl flex items-center justify-center"
        >
          <Plus size={24} color={KB.navy} strokeWidth={2.5} />
        </div>
        <div style={{ color: KB.navy }}>
          <div className="font-black text-base">새 요청 / 컴플레인 등록</div>
          <div className="text-xs mt-0.5 opacity-80">사진과 함께 빠르게 전달</div>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <HomeQuickCard
          icon={ClipboardList}
          label="내 요청 보기"
          sub="3건 진행 중"
          onClick={() => setTab("mine")}
        />
        <HomeQuickCard
          icon={FileText}
          label="11월 보고서"
          sub="새 보고서 도착"
          onClick={() => setTab("report")}
          highlight
        />
      </div>
    </div>
  );
}

function HomeQuickCard({ icon: Icon, label, sub, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: highlight ? KB.goldMute : "#fff",
        border: `1px solid ${highlight ? KB.goldLight : KB.line}`,
      }}
      className="rounded-2xl p-4 text-left relative"
    >
      {highlight && (
        <div
          style={{ background: KB.bad }}
          className="absolute top-3 right-3 w-2 h-2 rounded-full"
        />
      )}
      <Icon size={20} color={KB.navy} />
      <div className="mt-2 text-sm font-black" style={{ color: KB.navy }}>
        {label}
      </div>
      <div className="text-[11px] mt-0.5" style={{ color: KB.inkSoft }}>
        {sub}
      </div>
    </button>
  );
}

/* 새 요청 — 간단한 단일 폼 */
function HospNewRequest({ setTab }) {
  const [form, setForm] = useState({
    type: "요청",
    urgency: "normal",
    location: "",
    body: "",
    photo: false,
  });
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="px-4 pt-10 text-center">
        <div
          style={{ background: KB.okSoft }}
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
        >
          <CheckCircle2 size={40} color={KB.ok} />
        </div>
        <h2 className="mt-6 text-xl font-black" style={{ color: KB.navy }}>
          요청 등록 완료
        </h2>
        <p className="mt-2 text-sm" style={{ color: KB.inkSoft }}>
          담당 매니저가 확인 후<br />처리 결과를 알려드립니다.
        </p>
        <div className="mt-6 max-w-xs mx-auto space-y-2">
          <BigButton onClick={() => setTab("mine")} icon={ClipboardList}>
            내 요청 확인
          </BigButton>
          <BigButton onClick={() => setTab("home")} tone="ghost">
            홈으로
          </BigButton>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 space-y-4">
      <h2 className="text-xl font-black" style={{ color: KB.navy, letterSpacing: "-0.02em" }}>
        새 요청 등록
      </h2>

      <FormField label="구분">
        <div className="grid grid-cols-2 gap-2">
          <Choice
            active={form.type === "요청"}
            onClick={() => setForm({ ...form, type: "요청" })}
          >
            요청사항
          </Choice>
          <Choice
            active={form.type === "컴플레인"}
            tone="bad"
            onClick={() => setForm({ ...form, type: "컴플레인" })}
          >
            컴플레인
          </Choice>
        </div>
      </FormField>

      <FormField label="긴급도">
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: "normal", label: "보통" },
            { v: "high", label: "긴급" },
            { v: "vip", label: "VIP" },
          ].map((u) => (
            <Choice
              key={u.v}
              active={form.urgency === u.v}
              onClick={() => setForm({ ...form, urgency: u.v })}
            >
              {u.label}
            </Choice>
          ))}
        </div>
      </FormField>

      <FormField label="발생 위치">
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="예: 5층 파우더룸"
          style={{ borderColor: KB.line, fontFamily: fontStack }}
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
        />
      </FormField>

      <FormField label="내용">
        <textarea
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="상황을 자유롭게 적어주세요"
          style={{ borderColor: KB.line, fontFamily: fontStack }}
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none min-h-[120px]"
        />
      </FormField>

      <FormField label="사진 첨부 (선택)">
        <button
          onClick={() => setForm({ ...form, photo: !form.photo })}
          style={{
            background: form.photo ? KB.goldMute : "#fff",
            border: `1.5px ${form.photo ? "solid" : "dashed"} ${
              form.photo ? KB.gold : KB.line
            }`,
            color: KB.navy,
          }}
          className="w-full rounded-xl py-5 font-bold text-sm flex flex-col items-center gap-2"
        >
          <Camera size={24} />
          {form.photo ? "사진 1장 첨부됨" : "사진 찍기 / 선택"}
        </button>
      </FormField>

      <div className="pt-2">
        <BigButton
          onClick={() => setSent(true)}
          icon={Send}
          disabled={!form.body || !form.location}
        >
          요청 전송
        </BigButton>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <div
        className="text-xs font-black mb-1.5"
        style={{ color: KB.navy, letterSpacing: "-0.01em" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Choice({ active, children, onClick, tone = "navy" }) {
  const colors = {
    navy: { bg: KB.navy, color: "#fff" },
    bad: { bg: KB.bad, color: "#fff" },
  };
  const c = colors[tone];
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? c.bg : "#fff",
        color: active ? c.color : KB.inkSoft,
        border: `1.5px solid ${active ? c.bg : KB.line}`,
      }}
      className="rounded-xl py-3 font-bold text-sm"
    >
      {children}
    </button>
  );
}

/* 내 요청 */
function HospMyRequests() {
  return (
    <div className="px-4 pt-4 space-y-3">
      <h2 className="text-xl font-black" style={{ color: KB.navy, letterSpacing: "-0.02em" }}>
        내 요청 현황
      </h2>
      {MY_REQUESTS.map((r) => (
        <div
          key={r.id}
          style={{ background: "#fff", border: `1px solid ${KB.line}` }}
          className="rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Pill tone={r.type === "컴플레인" ? "bad" : "navy"}>
                {r.type}
              </Pill>
              {r.urgency === "high" && <Pill tone="warn">긴급</Pill>}
            </div>
            <Pill tone={r.status === "완료" ? "ok" : "gold"}>{r.status}</Pill>
          </div>
          <div className="mt-2.5 font-black text-base" style={{ color: KB.navy }}>
            {r.title}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <div style={{ color: KB.inkMute }}>등록</div>
              <div className="font-bold mt-0.5" style={{ color: KB.navy }}>
                {r.registeredAt}
              </div>
            </div>
            <div>
              <div style={{ color: KB.inkMute }}>완료</div>
              <div className="font-bold mt-0.5" style={{ color: KB.navy }}>
                {r.completedAt || "처리 중"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ▒ 월간 보고서 ▒  (핵심 자산)
   ───────────────────────────────────────────── */
function HospMonthlyReport() {
  return (
    <div className="bg-white">
      {/* 월 선택 */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between" style={{ background: KB.bg }}>
        <div>
          <div
            className="text-[10px] font-bold"
            style={{ color: KB.gold, letterSpacing: "0.2em" }}
          >
            MONTHLY HYGIENE REPORT
          </div>
          <div className="text-lg font-black mt-0.5" style={{ color: KB.navy, letterSpacing: "-0.02em" }}>
            {REPORT.month}
          </div>
        </div>
        <button
          style={{ background: "#fff", border: `1px solid ${KB.line}`, color: KB.navy }}
          className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
        >
          {REPORT.prevMonth} 비교 <ChevronRight size={14} />
        </button>
      </div>

      <ReportCover />
      <ReportKPI />
      <ReportCalendar />
      <ReportRegularPoints />
      <ReportRequestHistory />
      <ReportGallery />
      <ReportManagerComment />
      <ReportDownload />
    </div>
  );
}

function ReportCover() {
  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${KB.navyDeep} 0%, ${KB.navy} 60%, ${KB.navyLight} 100%)`,
      }}
      className="text-white px-6 py-10 relative overflow-hidden"
    >
      <div
        style={{ background: KB.gold, opacity: 0.18 }}
        className="absolute -right-16 -top-16 w-72 h-72 rounded-full blur-3xl"
      />
      <div
        style={{ background: KB.gold, opacity: 0.08 }}
        className="absolute -left-20 bottom-0 w-60 h-60 rounded-full blur-3xl"
      />
      <div className="relative">
        <div
          style={{ color: KB.goldLight, letterSpacing: "0.22em" }}
          className="text-[11px] font-bold"
        >
          {REPORT.month} 위생관리 리포트
        </div>
        <h1
          style={{ letterSpacing: "-0.03em" }}
          className="mt-3 text-4xl font-black leading-[1.1]"
        >
          {REPORT.hospital}
        </h1>
        <div className="mt-2 text-sm opacity-80">
          정기 위생관리 결과 보고
        </div>

        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[10px] font-bold uppercase opacity-60">
              담당 매니저
            </div>
            <div className="mt-1 font-black text-base">
              {REPORT.manager}
            </div>
            <div className="text-xs opacity-70">KB클린 대표</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase opacity-60">
              현장 작업자
            </div>
            <div className="mt-1 font-black text-base">{REPORT.staff}</div>
            <div className="text-xs opacity-70">{REPORT.staffNote}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportKPI() {
  return (
    <section className="px-5 py-7">
      <SectionHeader tag="이번 달 한눈에" title="핵심 지표" />
      <div className="grid grid-cols-2 gap-3">
        {REPORT.kpi.map((k) => (
          <div
            key={k.label}
            style={{ background: "#fff", border: `1px solid ${KB.line}` }}
            className="rounded-2xl p-4"
          >
            <div
              className="text-[10px] font-bold"
              style={{ color: KB.inkSoft, letterSpacing: "0.15em" }}
            >
              {k.label}
            </div>
            <div
              className="mt-1 text-3xl font-black"
              style={{ color: KB.navy, letterSpacing: "-0.03em" }}
            >
              {k.value}
            </div>
            <div className="text-[11px] mt-1.5 font-bold" style={{ color: KB.gold }}>
              {k.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportCalendar() {
  const [pick, setPick] = useState(null);

  // 첫 주에 빈 칸 채우기 (1일이 토요일이라고 가정 — 데이터에 맞춰)
  const firstDay = REPORT.calendar[0].w;
  const dayOrder = ["일", "월", "화", "수", "목", "금", "토"];
  const blanks = dayOrder.indexOf(firstDay);

  const statusColor = (s) => {
    if (s === "visit") return { bg: KB.navy, color: "#fff", label: "정시 방문" };
    if (s === "warn") return { bg: KB.warn, color: "#fff", label: "특이사항" };
    if (s === "extra") return { bg: KB.gold, color: KB.navy, label: "추가 방문" };
    return { bg: "transparent", color: KB.inkMute, label: "비번" };
  };

  return (
    <section className="px-5 py-7" style={{ background: KB.bg }}>
      <SectionHeader tag="방문 캘린더" title="이번 달 출근 현황" />

      <div
        style={{ background: "#fff", border: `1px solid ${KB.line}` }}
        className="rounded-2xl p-4"
      >
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold mb-2" style={{ color: KB.inkMute, letterSpacing: "0.1em" }}>
          {dayOrder.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: blanks }).map((_, i) => (
            <div key={"b" + i} />
          ))}
          {REPORT.calendar.map((c) => {
            const s = statusColor(c.s);
            const isVisit = c.s === "visit" || c.s === "warn" || c.s === "extra";
            return (
              <button
                key={c.d}
                onClick={() => isVisit && setPick(c)}
                style={{
                  background: s.bg,
                  color: s.color,
                  border: isVisit ? "none" : `1px solid ${KB.line}`,
                  aspectRatio: "1 / 1",
                }}
                className="rounded-lg text-xs font-black flex items-center justify-center"
              >
                {c.d}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <LegendDot color={KB.navy} label="정시 방문 12회" />
          <LegendDot color={KB.gold} label="추가 방문 1회" />
          <LegendDot color={KB.warn} label="특이사항 1일" />
          <LegendDot color={KB.line} label="비번일" border />
        </div>
      </div>

      {pick && (
        <div
          style={{ background: "#fff", border: `1px solid ${KB.line}` }}
          className="mt-3 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="font-black" style={{ color: KB.navy }}>
              11월 {pick.d}일 ({pick.w}요일)
            </div>
            <Pill tone={pick.s === "warn" ? "warn" : "navy"}>
              {statusColor(pick.s).label}
            </Pill>
          </div>
          <div className="mt-2 text-xs space-y-1" style={{ color: KB.inkSoft }}>
            <div>· 08:35 도착 / 10:12 종료</div>
            <div>· 정기 점검 7/7 완료 · 사진 11장</div>
            {pick.s === "warn" && (
              <div style={{ color: KB.warn }} className="font-bold">
                · 파우더룸 컴플레인 발생 → 다음날 처리 완료
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function LegendDot({ color, label, border }) {
  return (
    <div className="flex items-center gap-1.5" style={{ color: KB.inkSoft }}>
      <div
        style={{
          background: color,
          border: border ? `1px solid ${KB.line}` : "none",
        }}
        className="w-3 h-3 rounded-sm"
      />
      <span className="font-bold">{label}</span>
    </div>
  );
}

function ReportRegularPoints() {
  return (
    <section className="px-5 py-7">
      <SectionHeader
        tag="정기 관리 포인트"
        title="병원 요청 항목 점검 현황"
      />
      <div className="space-y-2">
        {REPORT.regularPoints.map((p) => (
          <div
            key={p.name}
            style={{
              background: p.highlighted ? KB.goldMute : "#fff",
              border: `1px solid ${p.highlighted ? KB.goldLight : KB.line}`,
            }}
            className="rounded-xl p-3.5 flex items-center gap-3"
          >
            <div
              style={{
                background: p.highlighted ? "#fff" : KB.bg,
                fontSize: 20,
              }}
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            >
              {p.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm flex items-center gap-1.5" style={{ color: KB.navy }}>
                {p.name}
                {p.highlighted && (
                  <Star size={12} fill={KB.gold} strokeWidth={0} />
                )}
              </div>
              {p.hlNote && (
                <div className="text-[10px] font-bold mt-0.5" style={{ color: "#8B6914" }}>
                  ★ {p.hlNote}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-bold" style={{ color: KB.navy }}>
                {p.visits}회 점검
              </div>
              <div className="text-[10px]" style={{ color: KB.inkSoft }}>
                사진 {p.photos}장
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportRequestHistory() {
  return (
    <section className="px-5 py-7" style={{ background: KB.bg }}>
      <SectionHeader
        tag="요청·컴플레인 처리"
        title="이번 달 처리 내역"
      />
      <div className="space-y-4">
        {REPORT.requests.map((r) => (
          <RequestReportCard key={r.id} r={r} />
        ))}
      </div>
    </section>
  );
}

function RequestReportCard({ r }) {
  return (
    <div
      style={{ background: "#fff", border: `1px solid ${KB.line}` }}
      className="rounded-2xl overflow-hidden"
    >
      {/* 헤더 */}
      <div
        style={{
          background:
            r.type === "컴플레인" ? KB.badSoft : KB.bg,
          borderBottom: `1px solid ${KB.line}`,
        }}
        className="px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-black"
            style={{ color: KB.inkSoft, letterSpacing: "0.1em" }}
          >
            {r.no}
          </span>
          <Pill tone={r.type === "컴플레인" ? "bad" : "navy"}>{r.type}</Pill>
          {r.urgency === "high" && <Pill tone="warn">긴급</Pill>}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-black" style={{ color: KB.gold }}>
          <Clock size={12} /> {r.duration} 처리
        </div>
      </div>

      <div className="px-4 py-4">
        <h4 className="font-black text-base" style={{ color: KB.navy, letterSpacing: "-0.01em" }}>
          {r.title}
        </h4>

        {/* 병원 원문 */}
        <div
          style={{ background: KB.bg, border: `1px solid ${KB.line}` }}
          className="mt-3 rounded-xl p-3"
        >
          <div className="text-[10px] font-black mb-1" style={{ color: KB.inkSoft, letterSpacing: "0.1em" }}>
            병원 요청 원문 · {r.registeredAt}
          </div>
          <p className="text-sm" style={{ color: KB.inkSoft }}>
            "{r.original}"
          </p>
        </div>

        {/* 화살표 */}
        <div className="flex items-center justify-center my-2">
          <div className="w-0.5 h-4" style={{ background: KB.line }} />
        </div>

        {/* 관리자 작업지시 */}
        <div
          style={{ background: KB.goldMute, border: `1px solid ${KB.goldLight}` }}
          className="rounded-xl p-3"
        >
          <div className="text-[10px] font-black mb-1" style={{ color: "#8B6914", letterSpacing: "0.1em" }}>
            관리자 작업지시 · 담당 {r.assignee}
          </div>
          <p className="text-sm font-bold" style={{ color: KB.navy }}>
            {r.adminInstruction}
          </p>
        </div>

        {/* 사진 전후 */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <PhotoSlot label="처리 전" tone="bad" />
          <PhotoSlot label="처리 후" tone="ok" />
        </div>

        <div
          style={{ borderTop: `1px dashed ${KB.line}` }}
          className="mt-3 pt-3 flex items-center justify-between text-xs"
        >
          <div style={{ color: KB.inkSoft }}>
            완료: {r.completedAt}
          </div>
          <div
            style={{ color: KB.ok }}
            className="flex items-center gap-1 font-black"
          >
            <CheckCircle2 size={14} /> 병원 확인 ({r.confirmedAt})
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoSlot({ label, tone }) {
  const colors =
    tone === "bad"
      ? { bg: "#FCE8DC", border: KB.bad }
      : { bg: KB.okSoft, border: KB.ok };
  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}40`,
        aspectRatio: "4 / 3",
      }}
      className="rounded-xl flex flex-col items-center justify-center relative"
    >
      <Camera size={24} color={colors.border} />
      <div
        className="mt-1 text-[10px] font-black"
        style={{ color: colors.border, letterSpacing: "0.15em" }}
      >
        {label}
      </div>
    </div>
  );
}

function ReportGallery() {
  return (
    <section className="px-5 py-7">
      <SectionHeader
        tag="포토 갤러리"
        title="같은 앵글, 4주간 변화"
      />
      <div className="space-y-4">
        {REPORT.galleries.map((g) => (
          <div key={g.key}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{g.icon}</span>
              <span className="font-black text-sm" style={{ color: KB.navy }}>
                {g.title}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {g.photos.map((w) => (
                <div
                  key={w}
                  style={{
                    background: `linear-gradient(135deg, ${KB.goldMute} 0%, #fff 100%)`,
                    border: `1px solid ${KB.line}`,
                    aspectRatio: "3 / 4",
                  }}
                  className="rounded-lg flex flex-col items-center justify-center"
                >
                  <Camera size={16} color={KB.inkMute} />
                  <div
                    className="mt-1 text-[9px] font-black"
                    style={{ color: KB.inkSoft, letterSpacing: "0.1em" }}
                  >
                    {w}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportManagerComment() {
  return (
    <section className="px-5 py-7" style={{ background: KB.bg }}>
      <SectionHeader
        tag="담당 매니저 코멘트"
        title="이번 달을 돌아보며"
      />
      <div
        style={{
          background: `linear-gradient(135deg, #fff 0%, ${KB.goldMute} 100%)`,
          border: `1px solid ${KB.goldLight}`,
        }}
        className="rounded-2xl p-5"
      >
        <p
          className="text-sm whitespace-pre-line leading-relaxed"
          style={{ color: KB.navy }}
        >
          {REPORT.comment}
        </p>
        <div
          style={{ borderTop: `1px dashed ${KB.gold}` }}
          className="mt-5 pt-4 flex items-center justify-end gap-2"
        >
          <div className="text-right">
            <div
              className="text-[10px] font-bold"
              style={{ color: "#8B6914", letterSpacing: "0.15em" }}
            >
              KB CLEAN
            </div>
            <div className="font-black text-base" style={{ color: KB.navy, letterSpacing: "-0.02em" }}>
              박원준 드림
            </div>
          </div>
        </div>
      </div>

      {/* 다음 달 약속 */}
      <div className="mt-5">
        <div
          className="text-[10px] font-black mb-2"
          style={{ color: KB.gold, letterSpacing: "0.2em" }}
        >
          📅 다음 달 강화 포인트
        </div>
        <div className="space-y-2">
          {REPORT.nextMonth.map((n, i) => (
            <div
              key={i}
              style={{ background: "#fff", border: `1px solid ${KB.line}` }}
              className="rounded-xl p-3 flex items-start gap-3"
            >
              <div
                style={{ background: KB.navy, color: "#fff" }}
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black text-xs"
              >
                {i + 1}
              </div>
              <div className="flex-1 text-sm font-bold" style={{ color: KB.navy }}>
                {n}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportDownload() {
  return (
    <section className="px-5 py-8">
      <div
        style={{
          background: `linear-gradient(135deg, ${KB.navyDeep}, ${KB.navy})`,
        }}
        className="rounded-2xl p-5 text-white"
      >
        <div className="text-center">
          <div
            className="text-[10px] font-bold"
            style={{ color: KB.goldLight, letterSpacing: "0.2em" }}
          >
            REPORT EXPORT
          </div>
          <div className="mt-1 text-lg font-black" style={{ letterSpacing: "-0.02em" }}>
            보고서를 보관하시겠어요?
          </div>
          <div className="text-xs opacity-70 mt-1">
            원장님 결재용 · 위생점검 증빙용
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <button
            style={{ background: KB.gold, color: KB.navy }}
            className="w-full rounded-xl py-3.5 font-black text-sm flex items-center justify-center gap-2"
          >
            <Download size={18} />
            PDF로 저장하기
          </button>
          <button
            style={{
              background: "transparent",
              border: "1.5px solid rgba(255,255,255,0.3)",
            }}
            className="w-full rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 text-white"
          >
            <Send size={16} />
            이메일로 받기
          </button>
        </div>
      </div>

      <div className="text-center mt-6 text-[11px]" style={{ color: KB.inkMute }}>
        본 리포트는 KB클린 자동 생성 시스템으로 발행되었습니다.<br />
        문의 / 다음 달 요청 사항이 있으시면 담당 매니저에게 연락 주세요.
      </div>
    </section>
  );
}

function SectionHeader({ tag, title, right }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <div
          className="text-[10px] font-black"
          style={{ color: KB.gold, letterSpacing: "0.2em" }}
        >
          {tag}
        </div>
        <h3
          className="mt-1 text-lg font-black"
          style={{ color: KB.navy, letterSpacing: "-0.025em" }}
        >
          {title}
        </h3>
      </div>
      {right}
    </div>
  );
}

/* ═════════════════════════════════════════════
   ▒▒ 관리자 (placeholder — 추후 별도 화면) ▒▒
   ═════════════════════════════════════════════ */
function AdminPlaceholder({ onExit }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header
        style={{ background: "#fff", borderBottom: `1px solid ${KB.line}` }}
        className="px-4 py-3 flex items-center justify-between"
      >
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: KB.inkSoft }}
        >
          <ArrowLeft size={16} /> 역할
        </button>
        <Brand size="md" />
      </header>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <div
            style={{ background: KB.goldMute }}
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          >
            <Wrench size={32} color={KB.navy} />
          </div>
          <h2
            className="mt-5 text-2xl font-black"
            style={{ color: KB.navy, letterSpacing: "-0.02em" }}
          >
            관리자 화면
          </h2>
          <p className="mt-2 text-sm" style={{ color: KB.inkSoft }}>
            현장 통합 보드 · 작업지시 변환 · 보고서 발송<br />
            기존 prototype의 AdminPortal을 이쪽에 연결할 예정입니다.
          </p>
          <div className="mt-6">
            <BigButton onClick={onExit} tone="ghost">
              역할 선택으로
            </BigButton>
          </div>
        </div>
      </div>
    </div>
  );
}
