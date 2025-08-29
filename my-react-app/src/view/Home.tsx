import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home.css";
import "../App.css";
import "../style/GameSelection.css";
import bearImage from "../assets/bear.png";
import backIcon from '../assets/Back.svg';
import TopicSelectionMenu from '../view/TopicSelectionMenu.tsx'; 

const Home: React.FC = () => {
    const navigate = useNavigate();

    // 定義主題名稱的型別
    type TopicName = '美食' | '交通工具'; // 若有更多主題請補充

    // 定義主題與情境對話的對應關係
    const situationalDialogues: Record<TopicName, string[]> = {
        '美食': [
            '今天天氣真好，你最想吃什麼？',
            '聽說有一家新的餐廳很不錯，你想去吃看看嗎？',
            '你在家最喜歡自己動手做什麼料理？',
        ],
        '交通工具': [
            '你今天怎麼來的？坐公車還是捷運？',
            '如果可以發明一種交通工具，你希望是什麼樣的？',
            '上次開車出門，在路上遇到什麼有趣的事嗎？',
        ],
        // 您可以在這裡添加更多主題與對話陣列
    };

    // 處理主題點擊事件
    const handleTopicClick = (topicName: TopicName) => {
        const bearDialogueArray = situationalDialogues[topicName];
        let bearDialogue = `好的，我們來聊聊${topicName}吧！`; // 預設回覆

        if (bearDialogueArray && bearDialogueArray.length > 0) {
            // 隨機選擇一個對話
            const randomIndex = Math.floor(Math.random() * bearDialogueArray.length);
            bearDialogue = bearDialogueArray[randomIndex];
        }

        // 創建新的聊天記錄陣列
        const updatedChatLog = [
            { 
                type: 'outgoing', // 使用者發出的訊息
                sender: '你', // 或 '使用者'，根據你的需求
                content: <span>{topicName}</span>,
            },
            { 
                type: 'incoming', // 小熊的回覆訊息
                sender: '小熊',
                content: <span>{bearDialogue}</span>,
            },
        ];
        
        // 更新聊天記錄狀態
        setChatLog(updatedChatLog);
    };

    // 初始狀態的改變
    const initialMessageContent = <TopicSelectionMenu onTopicClick={handleTopicClick} />;
    
    // 建立一個函數來重置聊天記錄
    const resetChat = () => {
        setChatLog([
            { type: 'incoming', sender: '小熊', content: initialMessageContent },
        ]);
    };

    const [chatLog, setChatLog] = useState([
        { type: 'incoming', sender: '小熊', content: initialMessageContent },
    ]);
    
    return (
        <div className="selection-bg">
            <header className="selection-header">
                <button
                    type="button"
                    className="back-button"
                    aria-label="返回"
                    onClick={() => navigate("/Learn")}
                >
                    <img src={backIcon} alt="返回" />
                </button>
                <div className="header-left">
                    <h1 className="game-header-title">情境對話</h1>
                </div>
            </header>
            <main className="main-content">
                <div className="character-area">
                    <button className="character-button">
                        <img src={bearImage} alt="小熊" className="character-image" />
                        <p className="character-caption">點選小熊開始聊天</p>
                    </button>
                    {/* 新增的重設按鈕 */}
                    <button onClick={resetChat} className="reset-button">
                        重新開始對話
                    </button>
                </div>
                <div className="chat-area">
                    <div className="chat-log">
                        {chatLog.map((message, index) => (
                            <div
                                key={index}
                                className={`message-group ${message.type}`}
                                // 如果您希望訊息能夠自動排列，建議移除這裡的 style 屬性，並使用 CSS 的 Flexbox 或 Grid 來佈局
                                style={{ position: 'relative', top: `${index * 50}px` }}
                            >
                                {message.type === 'incoming' && (
                                    <span className="sender-name">{message.sender}</span>
                                )}
                                <div className={`message-bubble ${message.type === 'incoming' ? 'bubble-style-1' : 'bubble-style-2'}`}>
                                    {message.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;