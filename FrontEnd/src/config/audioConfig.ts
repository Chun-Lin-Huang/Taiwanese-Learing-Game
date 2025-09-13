// 音效配置
export const AUDIO_CONFIG = {
    // 遊戲音效
    GAME_START: '/src/assets/遊戲開始介面音效.wav',
    THEME_SELECTION: '/src/assets/主題選擇按鈕聲.mp3',
    START_CHALLENGE: '/src/assets/開始挑戰.mp3',
    CORRECT_ANSWER: '/src/assets/正確音效.wav',
    WRONG_ANSWER: '/src/assets/錯誤音效.wav',
    VIEW_SCORE: '/src/assets/查看分數音效2.wav',
    
    // 音效設置
    DEFAULT_VOLUME: 0.5,
    BUTTON_VOLUME: 0.3,
    NOTIFICATION_VOLUME: 0.6,
  };
  
  // 音效類型枚舉
  export enum AudioType {
    GAME_START = 'GAME_START',
    THEME_SELECTION = 'THEME_SELECTION',
    START_CHALLENGE = 'START_CHALLENGE',
    CORRECT_ANSWER = 'CORRECT_ANSWER',
    WRONG_ANSWER = 'WRONG_ANSWER',
    VIEW_SCORE = 'VIEW_SCORE',
  }
  
  // 音效管理器
  export class AudioManager {
    private static instance: AudioManager;
    private audioElements: {[key: string]: HTMLAudioElement} = {};
    private volume: number = AUDIO_CONFIG.DEFAULT_VOLUME;
    private isEnabled: boolean = true;
  
    static getInstance(): AudioManager {
      if (!AudioManager.instance) {
        AudioManager.instance = new AudioManager();
      }
      return AudioManager.instance;
    }
  
    // 播放音效
    play(audioType: AudioType, volume?: number): void {
      if (!this.isEnabled) return;
  
      const audioPath = AUDIO_CONFIG[audioType];
      if (!audioPath) return;
  
      try {
        let audio = this.audioElements[audioPath];
        
        if (!audio) {
          audio = new Audio(audioPath);
          audio.preload = 'auto';
          this.audioElements[audioPath] = audio;
        }
  
        audio.volume = volume || this.volume;
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.error('播放音效失敗:', error);
        });
      } catch (error) {
        console.error('音效播放錯誤:', error);
      }
    }
  
    // 停止音效
    stop(audioType: AudioType): void {
      const audioPath = AUDIO_CONFIG[audioType];
      const audio = this.audioElements[audioPath];
      
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  
    // 停止所有音效
    stopAll(): void {
      Object.values(this.audioElements).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  
    // 設置音量
    setVolume(volume: number): void {
      this.volume = Math.max(0, Math.min(1, volume));
      Object.values(this.audioElements).forEach(audio => {
        audio.volume = this.volume;
      });
    }
  
    // 啟用/禁用音效
    setEnabled(enabled: boolean): void {
      this.isEnabled = enabled;
      if (!enabled) {
        this.stopAll();
      }
    }
  
    // 獲取當前音量
    getVolume(): number {
      return this.volume;
    }
  
    // 檢查是否啟用
    isAudioEnabled(): boolean {
      return this.isEnabled;
    }
  }