// script.js
// บันทึกสถิติเฉพาะเมื่อผู้เล่นกด "ส่งคำตอบ" และแยกตามเกม
// ใช้ Google Apps Script Web App และ Google Sheets เดิม

const STATS_URL =
  "https://script.google.com/macros/s/AKfycbyB4Ydw1c16MFGyTBcKXJti64OyyDf13Ma24Q7ywvkgwNChCHhEubCdkNKUuUilJRuZMw/exec";

const GAME_NAMES = [
  "Level of Consciousness",
  "Muscle Power",
  "Glasgow Coma Scale (GCS)"
];

const GCS_SUBGAME_NAMES = [
  "Eye opening",
  "Verbal response",
  "Motor response"
];

/**
 * เรียกเฉพาะจาก check() ซึ่งทำงานเมื่อกดปุ่ม "ส่งคำตอบ"
 * ทุกครั้งที่กดส่งคำตอบ จะบันทึก 1 เหตุการณ์ในชีต Events
 * correct = จำนวนคู่ที่ถูกในรอบส่งคำตอบนี้
 * incorrect = จำนวนคู่ที่ยังไม่ถูกในรอบส่งคำตอบนี้
 */
function recordGameSubmission(gameIndex, subIndex, correctCount, totalCount) {
  if (!Number.isInteger(gameIndex) || !GAME_NAMES[gameIndex]) {
    console.warn("ไม่พบเกมสำหรับบันทึกสถิติ:", gameIndex);
    return;
  }

  const incorrectCount = Math.max(0, totalCount - correctCount);
  const gameName =
    gameIndex === 2
      ? `${GAME_NAMES[gameIndex]} - ${GCS_SUBGAME_NAMES[subIndex] || "Unknown section"}`
      : GAME_NAMES[gameIndex];

  const sessionId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const payload = {
    game: gameName,
    event: "answer",
    correct: correctCount,
    incorrect: incorrectCount,
    session: sessionId
  };

  fetch(STATS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch((error) => {
    console.error("ส่งสถิติการกดส่งคำตอบไม่สำเร็จ:", error);
  });
}

