import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import backIcon from "../assets/Back.svg";
import joinBg from "../assets/雲.png"; // ← 請放你的淺藍背景圖
import roomIcon from "../assets/login.png";
import "../style/JoinRoom.css";

const DIGITS = 4;

const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<string[]>(Array(DIGITS).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = values.join("");
  const canSubmit = code.length === DIGITS;

  const onChange = (idx: number, v: string) => {
    // 只收 0-9
    const digit = v.replace(/\D/g, "").slice(0, 1);
    const next = [...values];
    next[idx] = digit;
    setValues(next);

    // 自動跳到下一格
    if (digit && idx < DIGITS - 1) {
      inputsRef.current[idx + 1]?.focus();
      inputsRef.current[idx + 1]?.select();
    }
  };

  const onKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      // 往回刪
      const prev = idx - 1;
      inputsRef.current[prev]?.focus();
      setValues((arr) => {
        const n = [...arr];
        n[prev] = "";
        return n;
      });
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < DIGITS - 1) inputsRef.current[idx + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGITS);
    if (!txt) return;
    e.preventDefault();
    const arr = txt.split("");
    const filled = Array(DIGITS).fill("");
    for (let i = 0; i < Math.min(arr.length, DIGITS); i++) filled[i] = arr[i];
    setValues(filled);
    // 聚焦到最後一格
    inputsRef.current[Math.min(arr.length, DIGITS) - 1]?.focus();
  };

  const submit = () => {
    if (!canSubmit) return;
    // 這裡先用預設 4 人，你也可以從後端拿實際人數
    navigate(`/rooms/lobby?code=${code}&players=4`);
  };

  return (
    <div
      className="selection-bg join-bg"
      style={{ backgroundImage: `url(${joinBg})` }}
    >
      <main className="join-main">
        <section
          className="join-stage"
          aria-label="加入房間"
        >
          {/* 返回 */}
          <button
            type="button"
            className="join-back"
            aria-label="返回"
            onClick={() => window.history.back()}
          >
            <img src={backIcon} alt="返回" />
          </button>

          {/* 頁面標題 */}
          <div className="join-title">
            <img className="join-title-icon" src={roomIcon} alt="" />
            <span>加入房間</span>
          </div>

          {/* 輸入區 */}
          <div className="join-card">
            <h2 className="join-card-title">請輸入房號</h2>

            <div className="join-code-inputs" onPaste={onPaste}>
              {Array.from({ length: DIGITS }, (_, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  className="join-digit"
                  inputMode="numeric"
                  maxLength={1}
                  value={values[i]}
                  onChange={(e) => onChange(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  aria-label={`房號第 ${i + 1} 碼`}
                />
              ))}
            </div>

            <button
              className="join-submit"
              disabled={!canSubmit}
              onClick={submit}
              title={canSubmit ? "" : "請先輸入完整 4 位房號"}
            >
              確認加入
            </button>

            <p className="join-hint">房號由房主建立後分享給你喔！</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default JoinRoom;
