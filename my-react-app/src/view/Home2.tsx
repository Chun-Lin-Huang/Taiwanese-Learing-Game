import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home.css";
import "../App.css";
import "../style/GameSelection.css";

import bearImage from "../assets/bear.png";
import backIcon from "../assets/Back.svg";

import TopicSelectionMenu from "../view/TopicSelectionMenu";
import type { TopicItem } from "../view/TopicSelectionMenu";
import { api } from "../enum/api";
import { asyncPost } from "../utils/fetch";

type ChatMsg = { type: "incoming" | "outgoing"; sender: string; content: React.ReactNode };
const Home2: React.FC = () => {
  const navigate = useNavigate();

  // 對話狀態
  const [chatLog, setChatLog] = useState<ChatMsg[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [topic, setTopic] = useState<TopicItem | null>(null);
  
  // 語音狀態
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // 是否顯示主題選單
  const [showTopicMenu, setShowTopicMenu] = useState(true);

  // 捲到最底的錨點
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  // 進入頁面：顯示提示
  useEffect(() => {
    setChatLog([
      {
        type: "incoming",
        sender: "小熊",
        content: <span>請先從主題選單選一個主題開始對話～</span>,
      },
    ]);
  }, []);

  /** 選主題 → 開始對話（POST /scenario/start） */
  const handleTopicClick = useCallback(async (t: TopicItem) => {
    try {
      // 使用者選單題（右邊泡泡）
      setChatLog(prev => [...prev, { type: "outgoing", sender: "你", content: <span>{t.name}</span> }]);

      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("尚未登入，缺少 userId");

      // 後端欄位：chatChooseId + userId
      const payload = { chatChooseId: t.id, userId };
      const startRes = await asyncPost(api.scenarioStart, payload);
      const body = startRes?.body ?? startRes ?? {};
      const sid: string | undefined = body.session_id || body.sessionId;
      const npcText: string = body.npc_text || body.npcText || "開始囉！";

      if (!sid) throw new Error("缺少 session_id");

      setSessionId(sid);
      setTopic(t);
      setShowTopicMenu(false); // 關閉主題選單

      // 小熊開場白（左邊泡泡）
      setChatLog(prev => [...prev, { type: "incoming", sender: "小熊", content: <span>{npcText}</span> }]);
    } catch (e: any) {
      setChatLog(prev => [
        ...prev,
        {
          type: "incoming",
          sender: "小熊",
          content: <span style={{ color: "#b00" }}>開始對話失敗：{e?.message || "未知錯誤"}</span>,
        },
      ]);
    }
  }, []);

  /** 開始語音錄音 */
  const startRecording = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('錄音失敗:', error);
      setChatLog(prev => [
        ...prev,
        {
          type: "incoming",
          sender: "小熊",
          content: <span style={{ color: "#b00" }}>錄音失敗，請檢查麥克風權限</span>,
        },
      ]);
    }
  }, [sessionId]);

  /** 停止語音錄音 */
  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }, [mediaRecorder, isRecording]);

  /** 處理語音輸入 */
  const processVoiceInput = useCallback(async (audioBlob: Blob) => {
    if (!sessionId) return;
    
    setIsProcessing(true);
    
    try {
      // 建立 FormData 上傳音頻檔案
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('session_id', sessionId);
      formData.append('topic_prompt', topic?.name || '');
      
      // 調用語音處理 API
      const response = await fetch(api.scenarioVoiceTurn, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      const { transcript, reply_text, reply_audio, finished } = result.body || result;
      
      // 顯示用戶語音識別結果
      if (transcript) {
        setChatLog(prev => [...prev, { 
          type: "outgoing", 
          sender: "你", 
          content: <span>{transcript}</span> 
        }]);
      }
      
      // 顯示小熊回覆
      if (reply_text) {
        setChatLog(prev => [...prev, { 
          type: "incoming", 
          sender: "小熊", 
          content: <span>{reply_text}</span> 
        }]);
      }
      
      // 播放音頻回覆
      if (reply_audio) {
        await playAudio(reply_audio);
      }
      
      if (finished) {
        // 對話結束，回到主題選單
        setSessionId(null);
        setTopic(null);
        setShowTopicMenu(true);
        setChatLog(prev => [
          ...prev,
          { type: "incoming", sender: "小熊", content: <span>本回合結束囉！再選一個主題吧～</span> },
        ]);
      }
    } catch (error: any) {
      console.error('語音處理失敗:', error);
      setChatLog(prev => [
        ...prev,
        {
          type: "incoming",
          sender: "小熊",
          content: <span style={{ color: "#b00" }}>語音處理失敗：{error?.message || "未知錯誤"}</span>,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, topic]);

  /** 播放音頻 */
  const playAudio = useCallback(async (audioUrl: string) => {
    try {
      setIsPlaying(true);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        console.error('音頻播放失敗');
      };
      
      await audio.play();
    } catch (error) {
      console.error('音頻播放失敗:', error);
      setIsPlaying(false);
    }
  }, []);

  /** 語音按鈕點擊處理 */
  const handleVoiceClick = useCallback(() => {
    if (!sessionId) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [sessionId, isRecording, startRecording, stopRecording]);

  /** 回主題選單（清空 session） */
  const resetChat = useCallback(() => {
    setSessionId(null);
    setTopic(null);
    setIsRecording(false);
    setIsProcessing(false);
    setIsPlaying(false);
    setShowTopicMenu(true);
    setChatLog([
      { type: "incoming", sender: "小熊", content: <span>請選擇想聊的主題～</span> },
    ]);
  }, []);

  return (
    <div className="selection-bg">
      <header className="selection-header">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => navigate("/MonopolyPage")}
        >
          <img src={backIcon} alt="返回" />
        </button>
        <div className="header-left">
          <h1 className="game-header-title">情境對話</h1>
        </div>
      </header>

      <main className="main-content">
        <div className="character-area">
          <button className="character-button" onClick={resetChat}>
            <img src={bearImage} alt="小熊" className="character-image" />
            <p className="character-caption">點我回主題選單</p>
          </button>
          <button onClick={resetChat} className="reset-button">
            重新開始對話
          </button>
        </div>

        <div className="chat-area">
          {/* 對話列 */}
          <div className="chat-log line-like">
            {chatLog.map((m, i) => (
              <div key={i} className={`message-row ${m.type}`}>
                {m.type === "incoming" && <span className="sender-name">小熊</span>}
                <div className={`bubble ${m.type}`}>{m.content}</div>
              </div>
            ))}

            {/* 主題選單顯示在對話列下方（只在 showTopicMenu=true 時出現） */}
            {showTopicMenu && (
              <div className="topic-menu-inline">
                <TopicSelectionMenu onTopicClick={handleTopicClick} />
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* 語音控制區域 */}
          <div className="voice-control-area">
            <button
              onClick={handleVoiceClick}
              disabled={!sessionId || isProcessing}
              className="voice-button"
            >
              {isRecording ? '停止錄音' : '開始語音對話'}
            </button>
            {isProcessing && <span className="processing-text">處理中...</span>}
            {isPlaying && <span className="playing-text">播放中...</span>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home2;