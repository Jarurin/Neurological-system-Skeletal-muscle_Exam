
"use strict";

// ========================================
// Google Apps Script: บันทึกสถิติเกม
// ใช้ URL เดิม ไม่เปลี่ยน Code.gs
// ========================================

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

// ป้องกันการเรียกส่งข้อมูลซ้อนในช่วงเวลาสั้น ๆ
let statsRequestInProgress = false;

/**
 * เรียกจาก check() เมื่อผู้เล่นกด "ส่งคำตอบ"
 *
 * gameIndex: 0 = Level of Consciousness
 *            1 = Muscle Power
 *            2 = Glasgow Coma Scale
 *
 * subIndex:  0 = Eye opening
 *            1 = Verbal response
 *            2 = Motor response
 *
 * correctCount: จำนวนคู่ที่ตอบถูก
 * totalCount:   จำนวนคู่ทั้งหมดในชุดนั้น
 */
function recordGameSubmission(
  gameIndex,
  subIndex,
  correctCount,
  totalCount
) {
  // ตรวจสอบข้อมูลก่อนส่ง
  if (
    !Number.isInteger(gameIndex) ||
    gameIndex < 0 ||
    gameIndex >= GAME_NAMES.length
  ) {
    console.error("ไม่สามารถบันทึกสถิติ: gameIndex ไม่ถูกต้อง", gameIndex);
    return;
  }

  if (
    !Number.isInteger(correctCount) ||
    !Number.isInteger(totalCount) ||
    totalCount < 1 ||
    correctCount < 0 ||
    correctCount > totalCount
  ) {
    console.error("ไม่สามารถบันทึกสถิติ: คะแนนไม่ถูกต้อง", {
      correctCount,
      totalCount
    });
    return;
  }

  // ป้องกันการเรียกซ้อนระหว่างที่คำขอก่อนหน้ายังไม่เสร็จ
  if (statsRequestInProgress) {
    console.warn("กำลังส่งสถิติรายการก่อนหน้า กรุณารอสักครู่");
    return;
  }

  let gameName = GAME_NAMES[gameIndex];

  // แยกชุดย่อยของ GCS
  if (gameIndex === 2) {
    if (
      !Number.isInteger(subIndex) ||
      subIndex < 0 ||
      subIndex >= GCS_SUBGAME_NAMES.length
    ) {
      console.error("ไม่สามารถบันทึกสถิติ: subIndex ไม่ถูกต้อง", subIndex);
      return;
    }

    gameName += " - " + GCS_SUBGAME_NAMES[subIndex];
  }

  const incorrectCount = totalCount - correctCount;

  const sessionId =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Date.now() + "-" + Math.random().toString(36).slice(2);

  // คงชื่อฟิลด์และรูปแบบข้อมูลให้เข้ากับระบบเดิม
  const payload = {
    game: gameName,
    event: "answer",
    correct: correctCount,
    incorrect: incorrectCount,
    session: sessionId
  };

  console.log("กำลังส่งสถิติเกม:", payload);

  statsRequestInProgress = true;

  fetch(STATS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload),
    keepalive: true
  })
    .then(() => {
      // no-cors ไม่สามารถอ่านผลตอบกลับจาก Apps Script ได้
      console.log(
        "ส่งคำขอสถิติแล้ว (ยังไม่ใช่การยืนยันว่าบันทึกลงชีตสำเร็จ)"
      );
    })
    .catch((error) => {
      console.error("ส่งคำขอสถิติไม่สำเร็จ:", error);
    })
    .finally(() => {
      statsRequestInProgress = false;
    });
}
