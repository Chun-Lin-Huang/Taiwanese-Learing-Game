#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
台語語音對話 Web 應用程式 (本地版)
使用遠端 STT 和 Ollama 服務
"""

import os
import time
import tempfile
import subprocess
import re
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import uuid

# 載入 .env 檔案
from dotenv import load_dotenv
load_dotenv()
import requests
from urllib.parse import urlencode, quote
import glob

# 匯入 TTS 服務和格式轉換器
from remote_tts_service import RemoteTtsService
from romanization_converter import RomanizationConverter

# 遠端服務配置
REMOTE_STT_URL = os.getenv('REMOTE_STT_URL', 'http://163.13.202.125:5001')
REMOTE_OLLAMA_URL = os.getenv('REMOTE_OLLAMA_URL', 'http://163.13.202.125:5002')
# 本地 Ollama 配置（已停用，全部使用遠端）
LOCAL_OLLAMA_URL = os.getenv('LOCAL_OLLAMA_URL', 'http://localhost:11434')
LLM_MODEL = os.getenv('LLM_MODEL', 'gemma3:4b')
USE_LOCAL_OLLAMA = False  # 改為使用遠端 Ollama

# MongoDB 配置
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'taiwanese_learning')

app = Flask(__name__)
CORS(app)  # 啟用 CORS 支援

# 全域變數
CLEANUP_FILES = True  # 是否清理臨時檔案
remote_tts_service = None
romanization_converter = None
ffmpeg_path = None  # FFmpeg 路徑
mongo_client = None
db = None

def debug_print(message):
    """調試輸出函數"""
    print(f"[DEBUG] {message}")

def save_chat_history(session_id, user_id, chat_choose_id, title, user_text, ai_response):
    """保存對話紀錄到 MongoDB"""
    try:
        if not db:
            debug_print("資料庫連接未初始化")
            return False, False  # 返回 (成功狀態, 是否達到最大輪數)
            
        # 查找現有的對話紀錄
        chat_history = db.ChatHistory.find_one({"session_id": session_id})
        
        if chat_history:
            # 檢查是否已達到最大輪數
            current_turn = chat_history.get('turn', 0)
            max_turns = 5  # 設定最大輪數為5
            
            if current_turn >= max_turns:
                debug_print(f"對話已達到最大輪數 {max_turns}，標記為結束")
                # 標記對話為結束
                db.ChatHistory.update_one(
                    {"session_id": session_id},
                    {"$set": {"finished": True}}
                )
                return True, True  # 成功保存，但達到最大輪數
            
            # 更新現有紀錄
            new_turn = current_turn + 1
            is_finished = new_turn >= max_turns
            
            db.ChatHistory.update_one(
                {"session_id": session_id},
                {
                    "$push": {
                        "history": {
                            "$each": [
                                {"role": "user", "text": user_text, "ts": datetime.now()},
                                {"role": "assistant", "text": ai_response, "ts": datetime.now()}
                            ]
                        }
                    },
                    "$inc": {"turn": 1},
                    "$set": {"finished": is_finished}
                }
            )
            debug_print(f"更新對話紀錄: session_id={session_id}, turn={new_turn}, finished={is_finished}")
            
            if is_finished:
                debug_print(f"對話已達到最大輪數 {max_turns}，標記為結束")
            
            return True, is_finished
        else:
            # 創建新的對話紀錄
            new_chat = {
                "session_id": session_id,
                "userId": user_id,
                "chatChooseId": chat_choose_id,
                "title": title,
                "score": 0,
                "turn": 1,
                "finished": False,
                "history": [
                    {"role": "user", "text": user_text, "ts": datetime.now()},
                    {"role": "assistant", "text": ai_response, "ts": datetime.now()}
                ]
            }
            db.ChatHistory.insert_one(new_chat)
            debug_print(f"創建新對話紀錄: session_id={session_id}")
            return True, False
        
    except Exception as e:
        debug_print(f"保存對話紀錄失敗: {e}")
        return False, False


def performance_timer(func_name):
    """性能計時裝飾器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            print(f"⏱️  開始執行: {func_name}")
            
            try:
                result = func(*args, **kwargs)
                end_time = time.time()
                duration = end_time - start_time
                print(f"✅ {func_name} 完成 - 耗時: {duration:.3f}秒")
                return result
            except Exception as e:
                end_time = time.time()
                duration = end_time - start_time
                print(f"❌ {func_name} 失敗 - 耗時: {duration:.3f}秒 - 錯誤: {e}")
                raise
                
        return wrapper
    return decorator

def convert_webm_with_ffmpeg(webm_file):
    """使用 FFmpeg 將 webm 轉換為 wav"""
    global ffmpeg_path
    
    if not ffmpeg_path:
        debug_print("FFmpeg 不可用")
        return None
    
    try:
        debug_print(f"使用 FFmpeg 轉換: {webm_file}")
        
        # 檢查輸入檔案
        if not os.path.exists(webm_file):
            debug_print(f"輸入檔案不存在: {webm_file}")
            return None
            
        # 建立臨時檔案
        temp_wav = os.path.join(
            os.path.dirname(webm_file),
            f"temp_{int(time.time()*1000)}.wav"
        )
        
        # FFmpeg 命令
        cmd = [
            ffmpeg_path,
            '-y',  # 覆寫輸出檔案
            '-i', webm_file,  # 輸入
            '-acodec', 'pcm_s16le',  # 音訊編碼
            '-ar', '16000',  # 採樣率
            '-ac', '1',  # 單聲道
            '-hide_banner',  # 隱藏橫幅
            '-loglevel', 'error',  # 只顯示錯誤
            temp_wav  # 輸出
        ]
        
        debug_print(f"執行命令: {' '.join(cmd)}")
        
        # 執行轉換
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            if os.path.exists(temp_wav) and os.path.getsize(temp_wav) > 0:
                debug_print(f"FFmpeg 轉換成功: {temp_wav}")
                return temp_wav
            else:
                debug_print("轉換後的檔案無效")
                return None
        else:
            debug_print(f"FFmpeg 轉換失敗: {result.stderr}")
            return None
            
    except Exception as e:
        debug_print(f"FFmpeg 轉換出錯: {e}")
        return None

def cleanup_temp_files():
    """清理 static 和 uploads 目錄中的臨時音檔"""
    print("🧹 開始清理臨時音檔...")
    deleted_count = 0
    errors = 0
    
    # 定義要清理的資料夾和檔案類型
    folders_to_clean = ["static", "uploads"]
    file_extensions = ["*.wav", "*.webm"]
    
    for folder in folders_to_clean:
        if not os.path.isdir(folder):
            print(f"⚠️ 目錄不存在，跳過清理: {folder}")
            continue
            
        for ext in file_extensions:
            # 組合搜尋路徑
            search_path = os.path.join(folder, ext)
            # 尋找所有匹配的檔案
            files_to_delete = glob.glob(search_path)
            
            for f in files_to_delete:
                try:
                    os.remove(f)
                    deleted_count += 1
                except OSError as e:
                    print(f"❌ 刪除失敗: {f} - 錯誤: {e}")
                    errors += 1
                    
    print(f"✅ 清理完成: 共刪除 {deleted_count} 個檔案，發生 {errors} 個錯誤。")

def log_step_time(step_name, duration, details=""):
    """記錄步驟執行時間"""
    print(f"📊 【{step_name}】耗時: {duration:.3f}秒 {details}")

def transcribe_taiwanese_audio_remote(audio_file_path):
    """使用遠端 STT 服務進行台語語音辨識"""
    try:
        debug_print(f"使用遠端 STT 服務辨識: {audio_file_path}")
        
        if not os.path.exists(audio_file_path):
            debug_print("音檔不存在")
            return ""
        
        # 檢查檔案資訊
        file_size = os.path.getsize(audio_file_path)
        debug_print(f"音檔大小: {file_size} bytes")
        
        # 使用 librosa 檢查音訊長度
        try:
            import librosa
            audio_data, sr = librosa.load(audio_file_path, sr=16000, mono=True)
            duration = len(audio_data) / sr
            debug_print(f"音訊時長: {duration:.2f}秒 ({len(audio_data)} 樣本, {sr}Hz)")
            
            if duration < 0.5:
                debug_print("⚠️ 音訊太短（< 0.5秒），可能影響辨識效果")
            elif duration > 30:
                debug_print("⚠️ 音訊太長（> 30秒），可能影響辨識效果")
        except Exception as e:
            debug_print(f"無法分析音訊: {e}")
        
        # 準備上傳的檔案
        with open(audio_file_path, 'rb') as f:
            files = {'audio': (os.path.basename(audio_file_path), f, 'audio/wav')}
            
            debug_print(f"發送到: {REMOTE_STT_URL}/transcribe")
            
            # 發送到遠端 STT 服務
            response = requests.post(
                f"{REMOTE_STT_URL}/transcribe",
                files=files,
                timeout=60
            )
        
        debug_print(f"STT 回應狀態碼: {response.status_code}")
        if response.status_code != 200:
            debug_print(f"STT 回應內容: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                transcription = result.get('transcription', '')
                debug_print(f"遠端 STT 辨識成功: '{transcription}'")
                return transcription
            else:
                debug_print(f"遠端 STT 辨識失敗: {result.get('error', '未知錯誤')}")
                return ""
        else:
            debug_print(f"遠端 STT 服務錯誤: {response.status_code}")
            return ""
            
    except Exception as e:
        debug_print(f"遠端 STT 服務連線失敗: {e}")
        return ""

def clean_transcription_result(text):
    """清理辨識結果文字"""
    if not text:
        return text
        
    # 移除多餘的空格
    text = re.sub(r'\s+', ' ', text)
    
    # 移除特殊標記
    text = re.sub(r'<[^>]+>', '', text)
    
    # 修正常見錯誤
    text = text.replace('台語:', '')
    text = text.replace('台羅:', '')
    
    return text.strip()

# 意傳科技 API 設定
ITHUAN_API = {
    "標音服務": {
        "網域": "https://hokbu.ithuan.tw",
        "端點": "/tau",
        "方法": "POST",
        "內容類型": "application/x-www-form-urlencoded"
    }
}

# API使用限制
API_LIMITS = {
    "文字長度限制": 200   # 建議單次查詢不超過200字
}

@performance_timer("台語標音轉換")
def get_taiwanese_pronunciation(text):
    """調用意傳科技標音 API"""
    try:
        debug_print(f"獲取台語標音: '{text}'")
        
        if len(text) > API_LIMITS["文字長度限制"]:
            debug_print("文字過長，截斷處理")
            text = text[:API_LIMITS["文字長度限制"]]
        
        api_config = ITHUAN_API["標音服務"]
        url = f"{api_config['網域']}{api_config['端點']}"
        
        data = {'taibun': text.strip()}
        
        debug_print(f"API 請求: {url}")
        
        api_start = time.time()
        response = requests.post(
            url,
            data=data,
            headers={
                'Content-Type': api_config['內容類型'],
                'User-Agent': 'TaiwaneseVoiceChat/1.0'
            },
            timeout=15
        )
        api_time = time.time() - api_start
        log_step_time("　├─ 意傳標音API", api_time, f"狀態: {response.status_code}")
        
        debug_print(f"回應狀態: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            if 'kiatko' in result and result['kiatko']:
                romanization_parts = []
                for item in result['kiatko']:
                    if 'KIP' in item and item['KIP']:
                        romanization_parts.append(item['KIP'])
                
                if romanization_parts:
                    romanization = ' '.join(romanization_parts)
                    debug_print(f"羅馬拼音: {romanization}")
                    return romanization, result.get('分詞', text), result['kiatko']
            
            if '分詞' in result:
                segmented = result['分詞']
                debug_print(f"分詞結果: {segmented}")
                return segmented, segmented, []
        
        debug_print("API 返回異常")
        return text, text, []
        
    except Exception as e:
        debug_print(f"標音 API 失敗: {e}")
        return text, text, []

@performance_timer("LLM智能對話")
def chat_with_ollama_local(text):
    """
    使用本地 Ollama LLM 進行對話
    """
    try:
        if USE_LOCAL_OLLAMA:
            debug_print(f"使用本地 LLM 對話處理: '{text}'")
            
            api_start = time.time()
            
            # 發送到本地 Ollama API
            response = requests.post(
                f"{LOCAL_OLLAMA_URL}/api/generate",
                json={
                    'model': LLM_MODEL,
                    'prompt': f"請用繁體中文一句話簡單回應（不超過20字）：{text}",
                    'stream': False
                },
                timeout=30
            )
            
            api_time = time.time() - api_start
            log_step_time("　├─ 本地 Ollama API請求", api_time)
            
            if response.status_code == 200:
                result = response.json()
                if 'response' in result:
                    final_reply = result['response'].strip()
                    debug_print(f"本地 LLM 回應: '{final_reply}'")
                    return final_reply if final_reply else "好的！"
                else:
                    debug_print(f"本地 LLM 回應格式異常: {result}")
                    return "好的！"
            else:
                debug_print(f"本地 LLM API 失敗: {response.status_code}")
                return "好的！"
        else:
            # 備用：使用遠端服務
            return chat_with_ollama_remote(text)
            
    except Exception as e:
        debug_print(f"本地 LLM 對話失敗: {e}")
        return "好的！"

def chat_with_ollama_remote(text):
    """
    備用：使用遠端 Ollama LLM 進行對話
    """
    try:
        debug_print(f"使用遠端 LLM 對話處理: '{text}'")
        
        api_start = time.time()
        
        # 發送到遠端 Ollama 服務
        response = requests.post(
            f"{REMOTE_OLLAMA_URL}/chat",
            json={
                'text': text,
                'model': LLM_MODEL
            },
            timeout=30
        )
        
        api_time = time.time() - api_start
        log_step_time("　├─ 遠端 Ollama API請求", api_time)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                final_reply = result.get('ai_response', '好的！')
                debug_print(f"遠端 LLM 回應: '{final_reply}'")
                return final_reply
            else:
                debug_print(f"遠端 LLM 失敗: {result.get('error', '未知錯誤')}")
                return "好的！"
        else:
            debug_print(f"遠端 LLM API 失敗: {response.status_code}")
            return "好的！"
            
    except Exception as e:
        debug_print(f"遠端 LLM 對話失敗: {e}")
        return "好的！"

@app.route('/')
def index():
    """主頁面 - 返回服務狀態"""
    return jsonify({
        "status": "running",
        "service": "台語語音服務",
        "version": "1.0.0",
        "endpoints": {
            "process_audio": "/process_audio (POST)",
            "tts": "/tts (POST)",
            "health": "/health (GET)"
        }
    })

@app.route('/health')
def health():
    """健康檢查端點"""
    return jsonify({
        "status": "healthy",
        "timestamp": time.time()
    })

@app.route('/static/<path:filename>')
def serve_static(filename):
    """提供靜態檔案服務"""
    return send_file(f'static/{filename}')

@app.route('/flashcard')
def flashcard():
    """字母卡頁面"""
    return render_template('flashcard.html')

@app.route('/process_audio', methods=['POST'])
def process_audio():
    """處理語音檔案"""
    global remote_tts_service, romanization_converter
    
    # 總體計時開始
    total_start_time = time.time()
    print(f"🚀 開始處理語音請求 - {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 各步驟計時統計
    step_times = {}
    
    try:
        # 步驟0: 請求驗證
        step_start = time.time()
        if 'audio' not in request.files:
            return jsonify({'error': '沒有收到音檔'}), 400
            
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({'error': '音檔名稱為空'}), 400
        step_times['請求驗證'] = time.time() - step_start
        log_step_time("請求驗證", step_times['請求驗證'])
            
        # 步驟1: 音檔保存
        step_start = time.time()
        # 建立本地保存目錄
        os.makedirs("uploads", exist_ok=True)
        
        # 決定檔案副檔名
        content_type = audio_file.content_type or 'audio/webm'
        if 'webm' in content_type:
            suffix = '.webm'
        elif 'wav' in content_type:
            suffix = '.wav'
        elif 'mp3' in content_type:
            suffix = '.mp3'
        else:
            suffix = '.audio'
        
        # 保存音檔
        timestamp = int(time.time() * 1000)
        local_filename = f"uploads/recording_{timestamp}{suffix}"
        
        audio_file.seek(0)
        audio_data = audio_file.read()
        
        if len(audio_data) == 0:
            return jsonify({'error': '音檔數據為空'}), 400
        
        try:
            with open(local_filename, 'wb') as f:
                f.write(audio_data)
            debug_print(f"音檔保存成功: {local_filename}")
        except Exception as e:
            debug_print(f"音檔保存失敗: {e}")
            return jsonify({'error': '音檔保存失敗'}), 500
        
        if not os.path.exists(local_filename) or os.path.getsize(local_filename) == 0:
            return jsonify({'error': '保存的音檔無效'}), 400
        
        step_times['音檔保存'] = time.time() - step_start
        log_step_time("音檔保存", step_times['音檔保存'], f"檔案大小: {len(audio_data)} bytes")
        
        try:
            debug_print("開始台語語音對話處理")
            
            # 步驟2: 音檔格式轉換（如果需要）
            step_start = time.time()
            audio_path = local_filename
            if suffix != '.wav':
                converted_path = convert_webm_with_ffmpeg(local_filename)
                if converted_path:
                    audio_path = converted_path
                else:
                    return jsonify({'error': '音檔格式轉換失敗'}), 400
            step_times['格式轉換'] = time.time() - step_start
            log_step_time("音檔格式轉換", step_times['格式轉換'])
            
            # 步驟3: 台語語音辨識（使用遠端服務）
            step_start = time.time()
            recognized_text = transcribe_taiwanese_audio_remote(audio_path)
            step_times['語音辨識'] = time.time() - step_start
            log_step_time("台語語音辨識", step_times['語音辨識'], f"辨識結果: '{recognized_text}'")
            
            if not recognized_text:
                return jsonify({'error': '無法辨識台語語音內容'}), 400
            
            # 檢查是否需要跳過某些步驟（用於單字挑戰等）
            skip_llm = request.form.get('skip_llm', 'false').lower() == 'true'
            skip_tts = request.form.get('skip_tts', 'false').lower() == 'true'
            skip_db = request.form.get('skip_db', 'false').lower() == 'true'
            
            debug_print(f"跳過選項: LLM={skip_llm}, TTS={skip_tts}, DB={skip_db}")
            
            # 步驟4: LLM 對話（使用本地 Ollama）
            step_start = time.time()
            if skip_llm:
                ai_response = "跳過 LLM 對話"
                debug_print("跳過 LLM 對話處理")
            else:
                ai_response = chat_with_ollama_local(recognized_text)
            step_times['LLM對話'] = time.time() - step_start
            log_step_time("LLM智能對話", step_times['LLM對話'], f"AI回應: '{ai_response}'")
            
            # 保存對話紀錄到資料庫
            session_id = request.form.get('session_id', str(uuid.uuid4()))
            user_id = request.form.get('user_id', 'default_user')
            chat_choose_id = request.form.get('chat_choose_id', 'default_chat_choose')
            title = request.form.get('title', '台語語音對話')
            
            save_success = True
            is_max_turns = False
            if skip_db:
                debug_print("跳過資料庫保存")
            else:
                save_success, is_max_turns = save_chat_history(session_id, user_id, chat_choose_id, title, recognized_text, ai_response)
            
            # 如果達到最大輪數，修改 AI 回應
            if is_max_turns:
                ai_response = "對話已達到最大輪數（5輪），感謝您的參與！請重新選擇對話主題，我們可以開始新的對話！"
                debug_print("對話已達到最大輪數，修改 AI 回應")
            
            # 步驟5: 台語標音轉換
            step_start = time.time()
            romanization, segmented, kiatko_data = get_taiwanese_pronunciation(ai_response)
            step_times['標音轉換'] = time.time() - step_start
            log_step_time("台語標音轉換", step_times['標音轉換'], f"羅馬拼音: '{romanization}'")
            
            # 步驟6: 格式轉換（羅馬拼音轉數字調）
            step_start = time.time()
            if romanization_converter:
                numeric_tone_text = romanization_converter.convert_to_numeric_tone(romanization)
                debug_print(f"格式轉換: '{romanization}' -> '{numeric_tone_text}'")
            else:
                numeric_tone_text = romanization
                debug_print(f"跳過格式轉換: '{romanization}'")
            step_times['格式轉換'] = time.time() - step_start
            log_step_time("羅馬拼音格式轉換", step_times['格式轉換'], f"數字調格式: '{numeric_tone_text}'")
            
            # 步驟7: 文字轉語音（使用遠端 TTS 服務）
            step_start = time.time()
            audio_file_path = None
            if skip_tts:
                debug_print("跳過 TTS 語音合成")
            else:
                print(f"\n🔊 步驟6: 台語語音合成")
                if remote_tts_service:
                    print(f"使用遠端 TTS 服務 ({remote_tts_service.base_url})")
                    audio_file_path = remote_tts_service.generate_speech(numeric_tone_text)
                else:
                    print("⚠️ 遠端TTS服務未初始化，無法進行語音合成。")
            step_times['語音合成'] = time.time() - step_start
            log_step_time("台語語音合成", step_times['語音合成'], f"音檔: {audio_file_path if audio_file_path else '跳過'}")
            
            if audio_file_path:
                print(f"🔊 TTS 成功: {audio_file_path}")
            else:
                print("⚠️ TTS 失敗")
            
            # 計算總耗時
            total_time = time.time() - total_start_time
            
            # 步驟8: 返回結果
            print(f"\n✅ 台語語音對話處理完成")
            print(f"🎯 總處理時間: {total_time:.3f}秒")
            print("📊 各步驟耗時統計:")
            for step_name, duration in step_times.items():
                percentage = (duration / total_time) * 100
                print(f"   • {step_name}: {duration:.3f}秒 ({percentage:.1f}%)")
            
            result = {
                'success': True,
                'transcription': recognized_text,
                'ai_response': ai_response,
                'romanization': romanization,
                'numeric_tone_text': numeric_tone_text,
                'segmented': segmented,
                'kiatko_count': len(kiatko_data),
                'audio_url': f'http://localhost:5050/{audio_file_path}' if audio_file_path else None,
                'api_info': f"使用遠端 STT: {REMOTE_STT_URL}, 遠端 LLM: {REMOTE_OLLAMA_URL}",
                'chat_status': {
                    'session_id': session_id,
                    'is_finished': is_max_turns,
                    'max_turns_reached': is_max_turns
                },
                'performance_stats': {
                    'total_time': total_time,
                    'step_times': step_times,
                    'bottleneck': max(step_times, key=step_times.get) if step_times else None
                }
            }
            
            debug_print("台語語音對話處理完成")
            return jsonify(result)
            
        finally:
            # 清理臨時檔案
            try:
                if CLEANUP_FILES:
                    if os.path.exists(local_filename):
                        os.unlink(local_filename)
                        debug_print(f"清理本地檔案: {local_filename}")
                    # 清理轉換後的 WAV 檔案
                    if 'audio_path' in locals() and audio_path != local_filename and os.path.exists(audio_path):
                        os.unlink(audio_path)
                        debug_print(f"清理轉換檔案: {audio_path}")
            except Exception as e:
                debug_print(f"清理檔案失敗: {e}")
        
    except Exception as e:
        debug_print(f"處理錯誤: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/tts', methods=['POST'])
def tts():
    """台語文字轉語音 API"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'success': False, 'error': '請求缺少文字內容'}), 400

        text = data['text'].strip()
        if not text:
            return jsonify({'success': False, 'error': '文字內容不可為空'}), 400

        print(f"🔊 TTS 請求: '{text}'")

        # 步驟1: 台語標音轉換
        romanization, _, kiatko_data = get_taiwanese_pronunciation(text)
        if not romanization:
            return jsonify({'success': False, 'error': '無法取得羅馬拼音'}), 500

        # 步驟2: 格式轉換（羅馬拼音轉數字調）
        if romanization_converter:
            numeric_tone_text = romanization_converter.convert_to_numeric_tone(romanization)
        else:
            numeric_tone_text = romanization

        # 步驟3: 文字轉語音
        audio_file_path = None
        if remote_tts_service:
            audio_file_path = remote_tts_service.generate_speech(numeric_tone_text)
        else:
            print("⚠️ 遠端TTS服務未初始化，無法進行語音合成。")
            return jsonify({'success': False, 'error': 'TTS服務未初始化'}), 500

        if not audio_file_path:
            return jsonify({'success': False, 'error': '語音合成失敗'}), 500

        # 組合回傳結果
        result = {
            'success': True,
            'original_text': text,
            'romanization': romanization,
            'numeric_tone_text': numeric_tone_text,
            'audio_url': f'http://localhost:5050/{audio_file_path}'
        }
        return jsonify(result)

    except Exception as e:
        debug_print(f"TTS 處理失敗: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/generate_flashcard', methods=['POST'])
def generate_flashcard():
    """產生字母卡的後端 API"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'success': False, 'error': '請求缺少文字內容'}), 400

        text = data['text'].strip()
        if not text:
            return jsonify({'success': False, 'error': '文字內容不可為空'}), 400

        # 步驟1: 台語標音轉換
        romanization, _, kiatko_data = get_taiwanese_pronunciation(text)
        if not romanization:
            return jsonify({'success': False, 'error': '無法取得羅馬拼音'}), 500

        # 步驟2: 格式轉換（羅馬拼音轉數字調）
        if romanization_converter:
            numeric_tone_text = romanization_converter.convert_to_numeric_tone(romanization)
        else:
            numeric_tone_text = romanization

        # 步驟3: 文字轉語音
        audio_file_path = None
        if remote_tts_service:
            audio_file_path = remote_tts_service.generate_speech(numeric_tone_text)
        else:
            print("⚠️ 遠端TTS服務未初始化，無法進行語音合成。")

        # 組合回傳結果
        result = {
            'success': True,
            'original_text': text,
            'romanization': romanization,
            'numeric_tone_text': numeric_tone_text,
            'audio_url': f'http://localhost:5050/{audio_file_path}' if audio_file_path else None
        }
        return jsonify(result)

    except Exception as e:
        debug_print(f"產生字母卡失敗: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/test_api')
def test_api():
    """測試遠端服務連線"""
    try:
        test_text = "你好嗎"
        print(f"🧪 測試遠端服務連線: '{test_text}'")
        
        # 測試標音 API
        romanization, segmented, kiatko_data = get_taiwanese_pronunciation(test_text)
        print(f"🔤 測試標音結果: '{romanization}'")
        
        # 測試遠端 STT 服務
        try:
            stt_response = requests.get(f"{REMOTE_STT_URL}/health", timeout=5)
            stt_status = "正常" if stt_response.status_code == 200 else f"錯誤 {stt_response.status_code}"
        except:
            stt_status = "連線失敗"
        
        # 測試遠端 Ollama 服務
        try:
            ollama_response = requests.get(f"{REMOTE_OLLAMA_URL}/health", timeout=5)
            ollama_status = "正常" if ollama_response.status_code == 200 else f"錯誤 {ollama_response.status_code}"
        except:
            ollama_status = "連線失敗"
        
        result = {
            'test_text': test_text,
            'romanization': romanization,
            'segmented': segmented,
            'kiatko_count': len(kiatko_data),
            'remote_services': {
                'stt_service': f"{REMOTE_STT_URL} - {stt_status}",
                'ollama_service': f"{REMOTE_OLLAMA_URL} - {ollama_status}",
                'tts_service': remote_tts_service.base_url if remote_tts_service else "未配置"
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e), 'api_status': 'failed'})


if __name__ == '__main__':
    print("🎯 啟動台語語音對話 Web 應用程式 (遠端服務版)")
    print(f"🌐 使用遠端 STT 服務: {REMOTE_STT_URL}")
    print(f"🤖 使用遠端 Ollama 服務: {REMOTE_OLLAMA_URL}")
    print(f"📋 LLM 模型: {LLM_MODEL}")
    
    # 初始化 MongoDB 連接
    print("🔗 初始化 MongoDB 連接...")
    try:
        mongo_client = MongoClient(MONGODB_URI)
        db = mongo_client[DATABASE_NAME]
        # 測試連接
        mongo_client.admin.command('ping')
        print(f"✅ MongoDB 連接成功: {MONGODB_URI}/{DATABASE_NAME}")
    except Exception as e:
        print(f"❌ MongoDB 連接失敗: {e}")
        print("⚠️ 對話紀錄將無法保存到資料庫")
        mongo_client = None
        db = None
    
    # 初始化 FFmpeg 路徑
    ffmpeg_candidates = [
        "/opt/homebrew/bin/ffmpeg",  # macOS Homebrew 路徑
        "ffmpeg",  # 系統路徑
        "./ffmpeg_bin/ffmpeg.exe",  # Windows 備用
        "ffmpeg_bin/ffmpeg.exe",
        "ffmpeg.exe"
    ]
    
    for candidate in ffmpeg_candidates:
        if os.path.exists(candidate) or subprocess.run(['which', candidate], capture_output=True).returncode == 0:
            ffmpeg_path = candidate
            debug_print(f"FFmpeg 找到: {ffmpeg_path}")
            break
    else:
        debug_print("FFmpeg 未找到")
    
    # 在啟動時執行一次清理
    cleanup_temp_files()
    
    print("=" * 50)
    
    # 初始化TTS服務和格式轉換器
    print("初始化遠端TTS服務...")
    try:
        # 使用遠端主機 IP (163.13.202.125) 作為 TTS 服務器
        remote_tts_service = RemoteTtsService(remote_host='163.13.202.125', remote_port=5000)
        print(f"遠端TTS服務初始化成功 ({remote_tts_service.base_url})")
        
        # 暫時跳過連線測試，避免阻塞啟動
        print("⚠️ 跳過TTS連線測試，稍後在使用時進行測試")
            
    except Exception as e:
        print(f"❌ 遠端TTS服務初始化失敗: {e}")
        remote_tts_service = None
    
    print("初始化羅馬拼音格式轉換器...")
    try:
        romanization_converter = RomanizationConverter()
        print("羅馬拼音轉換器初始化成功")
    except Exception as e:
        print(f"❌ 羅馬拼音轉換器初始化失敗: {e}")
        romanization_converter = None
    
    print("\n" + "="*50)
    print("🚀 本地服務已準備就緒！請點擊以下連結開始使用：")
    print("   👉 http://127.0.0.1:5050")
    print("="*50 + "\n")

    app.run(host='0.0.0.0', port=5050, debug=True)