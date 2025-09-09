#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
遠端 TTS 服務模組
連接到自訓練的 SuiSiann-HunLian TTS 系統
"""

import os
import time
import requests
import re
from urllib.parse import urlencode

# 載入 .env 檔案以確保環境變數可用
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # 如果沒安裝 python-dotenv，繼續執行（但可能無法讀取 .env）
    pass

class RemoteTtsService:
    """遠端 TTS 服務類別"""
    
    def __init__(self, remote_host=None, remote_port=5000):
        # 從環境變數讀取 TTS 伺服器 IP，如果沒有設定則使用預設值或傳入參數
        if remote_host is None:
            remote_host = os.getenv('TTS_SERVER_IP', '請設定您的遠端TTS伺服器IP')
        
        self.remote_host = remote_host
        self.remote_port = remote_port
        self.base_url = f"http://{remote_host}:{remote_port}"
        self.endpoint = "/bangtsam"
        
        # 根據性能配置設定超時時間
        try:
            from performance_config import get_current_config
            config = get_current_config()
            self.timeout = config["tts_timeout"]
            print(f"使用優化的TTS超時設定: {self.timeout}秒")
        except ImportError:
            self.timeout = 45  # 預設45秒，因為要等標音轉換
            print(f"使用預設TTS超時設定: {self.timeout}秒")
        except Exception:
            self.micro_split_s = 0.2

    def _normalize_for_tts(self, text: str) -> str:
        """對送入TTS的數字調字串做微調，避免已知的拉長問題"""
        try:
            s = text.strip()
            # 移除多餘空白
            s = re.sub(r"\s+", " ", s)
            if self.fix_long_final:
                # 將句尾的 te5 改為 te7（避開『題』被拉很長的狀況）
                s = re.sub(r"(?:(?<=\s)|^)te5(?:\s*$)", "te7", s)
            return s
        except Exception:
            return text

    # ===== ffmpeg helpers =====
    def _get_ffmpeg_path(self):
        here = os.path.dirname(os.path.abspath(__file__))
        # 支援兩種放置方式：
        # 1) 專案根目錄: <root>/ffmpeg_bin/ffmpeg.exe
        # 2) 單獨資料夾: <download_TTS>/ffmpeg_bin/ffmpeg.exe
        if os.name == 'nt':
            candidates = [
                os.path.normpath(os.path.join(here, '..', 'ffmpeg_bin', 'ffmpeg.exe')),
                os.path.normpath(os.path.join(here, 'ffmpeg_bin', 'ffmpeg.exe')),
            ]
            for path in candidates:
                if os.path.exists(path):
                    return path
        return 'ffmpeg'

    def _convert_to_wav(self, input_path, target_sample_rate=44100):
        try:
            ffmpeg = self._get_ffmpeg_path()
            base = os.path.splitext(os.path.basename(input_path))[0]
            out_dir = 'static'
            os.makedirs(out_dir, exist_ok=True)
            out_path = os.path.join(out_dir, f"{base}_conv.wav")
            cmd = [ffmpeg, '-y', '-i', input_path, '-ac', '1', '-ar', str(target_sample_rate), '-sample_fmt', 's16', out_path]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return out_path
        except Exception as e:
            print(f"轉換為 WAV 失敗: {e}")
            return None

    def _generate_silence_wav(self, duration_seconds):
        try:
            ffmpeg = self._get_ffmpeg_path()
            out_dir = 'static'
            os.makedirs(out_dir, exist_ok=True)
            silence_path = os.path.join(out_dir, f"silence_{duration_seconds}s_{int(time.time()*1000)}.wav")
            cmd = [ffmpeg, '-y', '-f', 'lavfi', '-i', f'anullsrc=r=44100:cl=mono', '-t', str(duration_seconds), '-ac', '1', '-ar', '44100', '-c:a', 'pcm_s16le', silence_path]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return silence_path
        except Exception as e:
            print(f"生成無聲音檔失敗: {e}")
            return None

    def _concat_wavs(self, paths, out_path):
        try:
            ffmpeg = self._get_ffmpeg_path()
            list_path = os.path.join('static', f"concat_{int(time.time()*1000)}.txt")
            with open(list_path, 'w', encoding='utf-8') as f:
                for p in paths:
                    if p:
                        f.write(f"file '{os.path.abspath(p).replace('\\\\','/')}'\n")
            cmd = [ffmpeg, '-y', '-f', 'concat', '-safe', '0', '-i', list_path, '-ac', '1', '-ar', '44100', '-c:a', 'pcm_s16le', out_path]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                os.remove(list_path)
            except:
                pass
            return os.path.exists(out_path) and os.path.getsize(out_path) > 0
        except Exception as e:
            print(f"合併 WAV 失敗: {e}")
            return False

    # ===== mitigation: micro split for problematic finals =====
    def _needs_micro_split(self, text: str) -> bool:
        if not self.enable_micro_split:
            return False
        toks = text.strip().split()
        if not toks:
            return False
        last = toks[-1]
        m = re.fullmatch(r'([A-Za-z\-]+)(\d)', last)
        if not m:
            return False
        base, tone = m.group(1).lower(), m.group(2)
        if base == 'te' and tone in ('5', '7') and len(toks) <= 4:
            return True
        return False

    def generate_speech_mitigated(self, text):
        """對特定尾音（如 te5/te7）做微分段，避免長音。"""
        try:
            text = self._normalize_for_tts(text)
            if not self._needs_micro_split(text):
                return self.generate_speech(text)

            toks = text.strip().split()
            prefix = ' '.join(toks[:-1]) if len(toks) > 1 else ''
            last = toks[-1]
            print(f"啟用微分段合成: prefix='{prefix}', last='{last}', silence={self.micro_split_s}s")

            parts = []
            if prefix:
                p_audio = self.generate_speech(prefix)
                parts.append(p_audio)
            l_audio = self.generate_speech(last)
            parts.append(l_audio)

            # 全轉 WAV 並插入無聲
            wavs = []
            for p in parts:
                if p and os.path.exists(p):
                    wavs.append(self._convert_to_wav(p) or p)
            if not wavs:
                return None
            seq = []
            for i, w in enumerate(wavs):
                seq.append(w)
                if i < len(wavs) - 1 and self.micro_split_s > 0:
                    sp = self._generate_silence_wav(self.micro_split_s)
                    if sp:
                        seq.append(sp)
            out_path = os.path.join('static', f"mitigated_{int(time.time())}.wav")
            ok = self._concat_wavs(seq, out_path)
            return out_path if ok else (wavs[0] if wavs else None)
        except Exception as e:
            print(f"微分段合成失敗，改為一般合成: {e}")
            return self.generate_speech(text)
        
    def generate_speech(self, text):
        """
        使用遠端TTS服務生成語音
        
        Args:
            text (str): 要合成的文字（數字調格式，如 "tak10-ke7 tsə2-hue1"）
            
        Returns:
            str: 生成的音檔路徑，如果失敗則返回 None
        """
        import time
        
        total_start = time.time()
        try:
            # 微調避免長音問題
            text = self._normalize_for_tts(text)
            print(f"遠端TTS開始: '{text}'")
            
            # 組合API URL和參數
            params_start = time.time()
            params = {"taibun": text}
            full_url = f"{self.base_url}{self.endpoint}"
            params_time = time.time() - params_start
            
            print(f"　├─ 參數準備耗時: {params_time:.3f}秒")
            print(f"　├─ 請求URL: {full_url}")
            print(f"　├─ 參數: {params}")
            
            # 發送請求到遠端TTS服務
            request_start = time.time()
            response = requests.get(
                full_url, 
                params=params, 
                timeout=self.timeout,
                headers={
                    'User-Agent': 'TaiwaneseVoiceChat/1.0',
                    'Accept': 'audio/wav, audio/*, */*',
                    'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
                }
            )
            request_time = time.time() - request_start
            print(f"　├─ API請求耗時: {request_time:.3f}秒")
            
            print(f"　├─ 回應狀態碼: {response.status_code}")
            print(f"　├─ 回應大小: {len(response.content)} bytes")
            
            # 顯示回應標頭資訊，可能包含版本或其他資訊
            print("　├─ 回應標頭資訊:")
            for key, value in response.headers.items():
                print(f"　│   {key}: {value}")
            
            process_start = time.time()
            if response.status_code == 200:
                # 檢查回應是否為音檔格式
                content_type = response.headers.get('content-type', '').lower()
                is_audio = (
                    'audio' in content_type or 
                    len(response.content) > 1000 or 
                    response.content.startswith(b'RIFF') or 
                    response.content.startswith(b'ID3') or 
                    response.content.startswith(b'\xff\xfb')
                )
                
                if is_audio:
                    # 儲存音檔
                    save_start = time.time()
                    audio_file = self._save_audio_file(response.content, text)
                    save_time = time.time() - save_start
                    
                    if audio_file:
                        process_time = time.time() - process_start
                        total_time = time.time() - total_start
                        print(f"　├─ 音檔儲存耗時: {save_time:.3f}秒")
                        print(f"　├─ 處理總耗時: {process_time:.3f}秒")
                        print(f"遠端TTS成功，總耗時: {total_time:.3f}秒，音檔: {audio_file}")
                        return audio_file
                else:
                    total_time = time.time() - total_start
                    print(f"遠端TTS回應不是音檔格式，總耗時: {total_time:.3f}秒")
                    # 嘗試顯示錯誤訊息
                    try:
                        error_text = response.content.decode('utf-8', errors='ignore')[:200]
                        print(f"　├─ 錯誤內容: {error_text}")
                    except:
                        pass
            else:
                total_time = time.time() - total_start
                print(f"遠端TTS請求失敗，狀態碼: {response.status_code}，總耗時: {total_time:.3f}秒")
                
        except requests.exceptions.RequestException as e:
            total_time = time.time() - total_start
            print(f"遠端TTS連線錯誤: {e}，總耗時: {total_time:.3f}秒")
        except Exception as e:
            total_time = time.time() - total_start
            print(f"遠端TTS未知錯誤: {e}，總耗時: {total_time:.3f}秒")
            
        return None
    
    def test_with_params(self, text, additional_params=None):
        """
        使用額外參數測試TTS服務
        
        Args:
            text (str): 要合成的文字
            additional_params (dict): 額外的參數（如版本、語音模型等）
            
        Returns:
            str: 生成的音檔路徑，如果失敗則返回 None
        """
        try:
            print(f"🧪 測試TTS參數: '{text}'")
            
            # 基本參數
            params = {"taibun": text}
            
            # 加入額外參數
            if additional_params:
                params.update(additional_params)
                print(f"額外參數: {additional_params}")
            
            full_url = f"{self.base_url}{self.endpoint}"
            
            print(f"請求URL: {full_url}")
            print(f"完整參數: {params}")
            
            # 發送請求
            response = requests.get(
                full_url, 
                params=params, 
                timeout=self.timeout,
                headers={
                    'User-Agent': 'TaiwaneseVoiceChat/1.0',
                    'Accept': 'audio/wav, audio/*, */*',
                    'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
                }
            )
            
            print(f"回應狀態碼: {response.status_code}")
            print(f"回應大小: {len(response.content)} bytes")
            
            # 顯示回應標頭資訊
            print("📋 回應標頭資訊:")
            for key, value in response.headers.items():
                print(f"   {key}: {value}")
            
            if response.status_code == 200:
                # 檢查回應是否為音檔格式
                content_type = response.headers.get('content-type', '').lower()
                is_audio = (
                    'audio' in content_type or 
                    len(response.content) > 1000 or 
                    response.content.startswith(b'RIFF') or 
                    response.content.startswith(b'ID3') or 
                    response.content.startswith(b'\xff\xfb')
                )
                
                if is_audio:
                    # 儲存音檔，檔名包含參數資訊
                    param_info = "_".join([f"{k}={v}" for k, v in (additional_params or {}).items()])
                    filename_suffix = f"_{param_info}" if param_info else ""
                    
                    audio_file = self._save_audio_file_with_suffix(response.content, text, filename_suffix)
                    if audio_file:
                        print(f"測試成功，音檔儲存至: {audio_file}")
                        return audio_file
                else:
                    print("回應不是音檔格式")
                    try:
                        error_text = response.content.decode('utf-8', errors='ignore')[:200]
                        print(f"錯誤內容: {error_text}")
                    except:
                        pass
            else:
                print(f"請求失敗，狀態碼: {response.status_code}")
                
        except Exception as e:
            print(f"測試錯誤: {e}")
            
        return None
    
    def _save_audio_file(self, content, text_info=""):
        """
        儲存音檔到本地
        
        Args:
            content (bytes): 音檔內容
            text_info (str): 用於檔名的文字資訊
            
        Returns:
            str: 儲存的檔案路徑，如果失敗則返回 None
        """
        try:
            # 確保 static 目錄存在
            os.makedirs("static", exist_ok=True)
            
            # 生成安全的檔名
            timestamp = int(time.time())
            safe_text = re.sub(r'[<>:"/\\|?*,]', '_', text_info.replace(' ', '_'))[:20]
            filename = f"static/remote_tts_{safe_text}_{timestamp}.wav"
            
            # 寫入檔案
            with open(filename, 'wb') as f:
                f.write(content)
                
            print(f"音檔已儲存: {filename}")
            return filename
            
        except Exception as e:
            print(f"儲存音檔失敗: {e}")
            return None
    
    def _save_audio_file_with_suffix(self, content, text_info="", suffix=""):
        """
        儲存音檔到本地（帶有後綴）
        
        Args:
            content (bytes): 音檔內容
            text_info (str): 用於檔名的文字資訊
            suffix (str): 檔名後綴
            
        Returns:
            str: 儲存的檔案路徑，如果失敗則返回 None
        """
        try:
            # 確保 static 目錄存在
            os.makedirs("static", exist_ok=True)
            
            # 生成安全的檔名
            timestamp = int(time.time())
            safe_text = re.sub(r'[<>:"/\\|?*,]', '_', text_info.replace(' ', '_'))[:20]
            safe_suffix = re.sub(r'[<>:"/\\|?*,]', '_', suffix)
            filename = f"static/remote_tts_{safe_text}{safe_suffix}_{timestamp}.wav"
            
            # 寫入檔案
            with open(filename, 'wb') as f:
                f.write(content)
                
            print(f"音檔已儲存: {filename}")
            return filename
            
        except Exception as e:
            print(f"儲存音檔失敗: {e}")
            return None
    
    def test_connection(self):
        """
        測試與遠端TTS服務的連線
        
        Returns:
            bool: 連線成功返回 True，否則返回 False
        """
        try:
            # 使用簡單的測試文字
            test_text = "li2 ho2"  # "你好"
            result = self.generate_speech(test_text)
            return result is not None
        except Exception as e:
            print(f"連線測試失敗: {e}")
            return False 