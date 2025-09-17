// Moedict API 服務
import { VOICE_SERVICE_URL } from '../config/apiConfig';
export interface MoedictResponse {
  t: string; // 詞條
  h: Array<{
    T?: string; // 台語音讀 (實際欄位名)
    p?: string; // 拼音 (備用)
    s?: string; // 同義詞
    d?: Array<{
      e?: string[]; // 例句
      f: string; // 釋義
      type?: string; // 詞性
    }>;
  }>;
}

// 搜尋結果介面
export interface SearchResult {
  word: string;
  pronunciation: string;
  definition: string;
  examples: string[];
  audioSrc?: string;
}

// 台語語音服務
export class TaiwaneseTTSService {
  private baseUrl = VOICE_SERVICE_URL;

  /**
   * 使用台語TTS服務生成語音
   * @param text 要轉換的文字
   * @returns 音檔 URL
   */
  async generateTaiwaneseAudio(text: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: 'taiwanese'
        }),
      });

      if (!response.ok) {
        console.warn('台語TTS服務不可用，使用備用方案');
        return null;
      }

      const result = await response.json();
      return result.audio_url || null;
    } catch (error) {
      console.error('台語TTS服務錯誤:', error);
      return null;
    }
  }

  /**
   * 播放台語語音
   * @param text 要播放的文字
   * @returns Promise<boolean> 是否成功播放
   */
  async playTaiwaneseAudio(text: string): Promise<boolean> {
    try {
      // 先嘗試使用台語TTS服務
      const audioUrl = await this.generateTaiwaneseAudio(text);
      
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        await audio.play();
        return true;
      }

      // 備用方案：使用瀏覽器原生語音合成
      return this.playWithBrowserTTS(text);
    } catch (error) {
      console.error('播放台語語音失敗:', error);
      // 最後備用方案
      return this.playWithBrowserTTS(text);
    }
  }

  /**
   * 使用瀏覽器原生TTS播放台語
   * @param text 要播放的文字
   * @returns Promise<boolean> 是否成功播放
   */
  private async playWithBrowserTTS(text: string): Promise<boolean> {
    if (!('speechSynthesis' in window)) {
      console.warn('此瀏覽器不支援語音合成功能');
      return false;
    }

    try {
      // 停止當前播放
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.7; // 稍微慢一點，更清楚
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // 等待語音載入完成
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        await new Promise(resolve => {
          speechSynthesis.onvoiceschanged = resolve;
          setTimeout(resolve, 1000); // 最多等待1秒
        });
      }
      
      // 重新獲取語音列表
      const updatedVoices = speechSynthesis.getVoices();
      const chineseVoice = updatedVoices.find(voice => 
        voice.lang.includes('zh') || voice.lang.includes('TW') || voice.lang.includes('CN')
      );
      
      if (chineseVoice) {
        utterance.voice = chineseVoice;
        console.log('使用語音:', chineseVoice.name, chineseVoice.lang);
      } else {
        console.log('未找到中文語音，使用預設語音');
      }
      
      // 添加事件監聽器
      utterance.onstart = () => console.log('開始播放台語語音');
      utterance.onend = () => console.log('台語語音播放結束');
      utterance.onerror = (event) => console.error('台語語音播放錯誤:', event.error);
      
      speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('瀏覽器TTS播放失敗:', error);
      return false;
    }
  }
}

// 音檔生成服務
export class AudioService {
  private taiwaneseTTS = new TaiwaneseTTSService();

  /**
   * 使用瀏覽器原生 Web Speech API 播放語音
   * @param text 要轉換的文字
   * @param language 語言代碼
   */
  speakText(text: string, language: string = 'zh-TW'): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // 嘗試找到中文語音
      const voices = speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice => 
        voice.lang.includes('zh') || voice.lang.includes('TW') || voice.lang.includes('CN')
      );
      
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }
      
      speechSynthesis.speak(utterance);
    } else {
      console.warn('此瀏覽器不支援語音合成功能');
    }
  }
  
  /**
   * 播放台語語音（優先使用台語TTS服務）
   * @param text 要播放的文字
   * @returns Promise<boolean> 是否成功播放
   */
  async playTaiwaneseAudio(text: string): Promise<boolean> {
    return await this.taiwaneseTTS.playTaiwaneseAudio(text);
  }
  
  /**
   * 生成台語音檔 URL (使用 Google TTS - 修正格式)
   * @param text 要轉換的文字
   * @returns 音檔 URL
   */
  generateGoogleTTSUrl(text: string): string {
    const encodedText = encodeURIComponent(text);
    return `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-TW&client=tw-ob&q=${encodedText}`;
  }
  
  /**
   * 生成台語音檔 URL (使用 Microsoft Edge TTS)
   * @param text 要轉換的文字
   * @returns 音檔 URL
   */
  generateEdgeTTSUrl(text: string): string {
    const encodedText = encodeURIComponent(text);
    return `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB7E3D22C7F6C8F2A&text=${encodedText}&language=zh-TW`;
  }
  
  /**
   * 生成台語音檔 URL (使用 Google TTS - 修正版)
   * @param text 要轉換的文字
   * @returns 音檔 URL
   */
  generateGoogleTTSUrlFixed(text: string): string {
    const encodedText = encodeURIComponent(text);
    return `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-TW&client=tw-ob&q=${encodedText}`;
  }
  
  /**
   * 生成台語音檔 URL (使用多種 TTS 服務)
   * @param text 要轉換的文字
   * @returns 音檔 URL
   */
  generateAudioUrl(text: string): string {
    // 使用 Google TTS 修正版作為主要方案
    return this.generateGoogleTTSUrlFixed(text);
  }
}

export class MoedictService {
  private baseUrl = 'https://www.moedict.tw';
  private audioService = new AudioService();
  
  /**
   * 查詢台語辭典
   * @param word 查詢詞彙
   * @returns 台語辭典資料
   */
  async searchTaiwanese(word: string): Promise<MoedictResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/t/${encodeURIComponent(word)}.json`);
      if (!response.ok) {
        console.warn(`台語辭典查詢失敗: ${word}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('台語辭典查詢錯誤:', error);
      return null;
    }
  }
  
  /**
   * 查詢華語辭典
   * @param word 查詢詞彙
   * @returns 華語辭典資料
   */
  async searchChinese(word: string): Promise<MoedictResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/a/${encodeURIComponent(word)}.json`);
      if (!response.ok) {
        console.warn(`華語辭典查詢失敗: ${word}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('華語辭典查詢錯誤:', error);
      return null;
    }
  }
  
  /**
   * 統一查詢（支援多語言）
   * @param word 查詢詞彙
   * @returns 統一查詢結果
   */
  async searchUnified(word: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/uni/${encodeURIComponent(word)}`);
      if (!response.ok) {
        console.warn(`統一查詢失敗: ${word}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('統一查詢錯誤:', error);
      return null;
    }
  }
  
  /**
   * 搜尋台語辭典並格式化結果
   * @param word 查詢詞彙
   * @returns 格式化的搜尋結果
   */
  async searchForDictionary(word: string): Promise<SearchResult | null> {
    try {
      const data = await this.searchTaiwanese(word);
      if (!data) return null;
      
      // 清理文字中的標音符號
      const cleanText = (text: string) => {
        return text
          .replace(/`/g, '') // 移除重音符號
          .replace(/~/g, '') // 移除波浪符號
          .replace(/，/g, '，') // 保持逗號
          .replace(/。/g, '。') // 保持句號
          .replace(/；/g, '；') // 保持分號
          .trim();
      };
      
      // 提取音讀 (優先使用 T 欄位，備用 p 欄位)
      const pronunciation = cleanText(data.h?.[0]?.T || data.h?.[0]?.p || '');
      
      // 提取釋義
      const definitions = data.h?.flatMap(item => 
        item.d?.map(def => cleanText(def.f)) || []
      ) || [];
      
      // 提取例句
      const examples = data.h?.flatMap(item => 
        item.d?.flatMap(def => (def.e || []).map(example => cleanText(example))) || []
      ) || [];
      
      // 生成音檔 URL (使用 ResponsiveVoice)
      const audioSrc = this.audioService.generateAudioUrl(data.t);
      
      return {
        word: cleanText(data.t),
        pronunciation,
        definition: definitions.join('；'),
        examples: examples.slice(0, 3), // 最多顯示3個例句
        audioSrc
      };
    } catch (error) {
      console.error('搜尋台語辭典失敗:', error);
      return null;
    }
  }
  
  /**
   * 批量查詢多個詞彙
   * @param words 詞彙陣列
   * @param language 語言類型 ('t' | 'a' | 'uni')
   * @returns 查詢結果陣列
   */
  async batchSearch(words: string[], language: 't' | 'a' | 'uni' = 't'): Promise<Array<{word: string, data: MoedictResponse | null}>> {
    const results = await Promise.all(
      words.map(async (word) => {
        let data: MoedictResponse | null = null;
        
        switch (language) {
          case 't':
            data = await this.searchTaiwanese(word);
            break;
          case 'a':
            data = await this.searchChinese(word);
            break;
          case 'uni':
            data = await this.searchUnified(word);
            break;
        }
        
        return { word, data };
      })
    );
    
    return results;
  }
}

// 導出單例
export const moedictService = new MoedictService();
export const audioService = new AudioService();
export const taiwaneseTTS = new TaiwaneseTTSService();
