// API 配置檔案
// 根據環境自動選擇正確的API基礎URL

const getApiBaseUrl = (): string => {
  // 優先檢查是否在 gai-bot.com 域名下（無論 HTTP 或 HTTPS）
  if (window.location.hostname === 'gai-bot.com' || window.location.hostname === 'www.gai-bot.com') {
    return 'https://gai-bot.com';  // 統一使用 HTTPS，nginx會代理到後端
  }
  
  // 檢查是否在服務器IP環境
  if (window.location.hostname === '163.13.202.125') {
    // 如果是 HTTPS 訪問，使用相對路徑避免 Mixed Content
    if (window.location.protocol === 'https:') {
      return '';  // 使用相對路徑，由 nginx 代理
    }
    return 'http://163.13.202.125:2083';
  }
  
  // 本地開發環境 - 檢查是否在 localhost 或 127.0.0.1
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:2083';
  }
  
  // 預設使用相對路徑（適用於任何通過 nginx 代理的環境）
  return '';
};

const getVoiceServiceUrl = (): string => {
  // 優先檢查是否在 gai-bot.com 域名下（無論 HTTP 或 HTTPS）
  if (window.location.hostname === 'gai-bot.com' || window.location.hostname === 'www.gai-bot.com') {
    return 'https://gai-bot.com/voice-service';  // 統一使用 HTTPS，nginx會代理到語音服務
  }
  
  // 檢查是否在服務器IP環境
  if (window.location.hostname === '163.13.202.125') {
    // 如果是 HTTPS 訪問，使用相對路徑避免 Mixed Content
    if (window.location.protocol === 'https:') {
      return '/voice-service';  // 使用相對路徑，由 nginx 代理
    }
    return 'http://163.13.202.125:5050';
  }
  
  // 本地開發環境 - 檢查是否在 localhost 或 127.0.0.1
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5050';
  }
  
  // 預設使用相對路徑（適用於任何通過 nginx 代理的環境）
  return '/voice-service';
};

export const API_BASE_URL = getApiBaseUrl();
export const VOICE_SERVICE_URL = getVoiceServiceUrl();

console.log('API配置:', {
  hostname: window.location.hostname,
  protocol: window.location.protocol,
  apiBaseUrl: API_BASE_URL,
  voiceServiceUrl: VOICE_SERVICE_URL
});
