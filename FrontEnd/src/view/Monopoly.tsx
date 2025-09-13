import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import '../style/Monopoly.css';
import "../App.css";
import BackIcon from "../assets/Back.svg";
import { AudioManager, AudioType } from '../config/audioConfig';
import AudioControls from '../components/AudioControls';
import '../style/AudioControls.css';
import { MapApiService, type MapBoard } from '../services/mapApi';

interface PlayerRecord {
  id: number;
  timestamp: Date;
  location: string;
  locationName: string;
  action: string;
  details?: string;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  avatarImage?: string;
  round: number;
  status: string;
  location: string; // 位置字符串 (如 "S0", "A1", "B2")
  locationName: string; // 位置名稱
  record: string; // 保留用於顯示最新記錄
  records: PlayerRecord[]; // 詳細記錄數組
  isCurrentPlayer: boolean;
  score: number; // 玩家分數
  diceSum: number; // 骰子點數加總
  userName?: string; // 使用者名稱（從資料庫查詢得到）
  currency: number; // 玩家貨幣
}

interface Property {
  id: number;
  name: string;
  type: 'property' | 'challenge' | 'chance' | 'start' | 'go' | 'special' | 'shortcut' | 'reward' | 'vocabulary';
  price?: number;
  rent?: number;
  description: string;
  color?: string;
  owner?: number; // 擁有者ID
  challenge?: {
    type: 'vocabulary' | 'culture' | 'story' | 'action' | 'train';
    title: string;
    content: string;
    reward: string;
  };
  chance?: {
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    content: string;
    effect: string;
  };
  shortcut?: {
    target: number; // 跳轉到的位置
    description: string;
  };
}

interface GameAction {
  id: string;
  timestamp: Date;
  playerId: number;
  playerName: string;
  actionType: 'dice_roll' | 'move' | 'challenge' | 'bankruptcy' | 'shortcut' | 'victory';
  description: string;
  details?: any;
}

interface GameHistory {
  gameId: string;
  startTime: Date;
  endTime?: Date;
  actions: GameAction[];
  players: Player[];
}

const Monopoly: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 地圖資料狀態
    const [mapBoard, setMapBoard] = useState<MapBoard | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    
    // 音效管理器
    const audioManager = AudioManager.getInstance();
    const [showGameOver, setShowGameOver] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);
    const [showGameHistory, setShowGameHistory] = useState(false);
    const [showLocationDetail, setShowLocationDetail] = useState(false);
    const [currentLocationDetail, setCurrentLocationDetail] = useState<Property | null>(null);
  const [currentRound] = useState(1);
  const [playersInCurrentRound] = useState<number[]>([]);
  const [playersPassedStart, setPlayersPassedStart] = useState<{[playerId: number]: number}>({});
  const [showPassedStartCelebration, setShowPassedStartCelebration] = useState(false);
  const [passedStartMessage, setPassedStartMessage] = useState('');
    const [showCouponPanel, setShowCouponPanel] = useState(false);
    const [couponType, setCouponType] = useState<'property' | 'gas_station' | 'road_construction'>('property');
  const [showChallengePanel, setShowChallengePanel] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [selectedChallengeType] = useState<string | null>(null);
  const [challengeQuestion, setChallengeQuestion] = useState<string>('');
  const [playerAnswer, setPlayerAnswer] = useState<string>('');
  const [challengeResult, setChallengeResult] = useState<'success' | 'failure' | null>(null);
  
  // 優惠券挑戰獨立狀態
  const [showCouponChallengePanel, setShowCouponChallengePanel] = useState(false);
  const [selectedCouponChallengeType, setSelectedCouponChallengeType] = useState<string | null>(null);
  const [couponChallengeQuestion, setCouponChallengeQuestion] = useState<string>('');
  const [couponPlayerAnswer, setCouponPlayerAnswer] = useState<string>('');
  const [couponChallengeResult, setCouponChallengeResult] = useState<'success' | 'failure' | null>(null);
  
  const [showWordCard, setShowWordCard] = useState(false);
  const [currentWordCard, setCurrentWordCard] = useState<any>(null);
  const [isDrawingCard, setIsDrawingCard] = useState(false);
  
  // STT 相關狀態
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [wordCardSTTResult, setWordCardSTTResult] = useState<string>('');
  const [wordCardChallengeResult, setWordCardChallengeResult] = useState<'success' | 'failure' | null>(null);
  
  // 情境對話相關狀態
  const [scenarioSessionId, setScenarioSessionId] = useState<string | null>(null);
  const [scenarioMessages, setScenarioMessages] = useState<Array<{type: 'incoming' | 'outgoing', sender: string, content: string}>>([]);
  const [scenarioPlayerInput, setScenarioPlayerInput] = useState<string>('');
  const [scenarioIsProcessing, setScenarioIsProcessing] = useState(false);
  const [scenarioTopics, setScenarioTopics] = useState<Array<{_id: string, name: string}>>([]);
  
  // 一般挑戰對話相關狀態
  const [challengeSessionId] = useState<string | null>(null);
  const [challengeMessages, setChallengeMessages] = useState<Array<{type: 'incoming' | 'outgoing', sender: string, content: string}>>([]);
  const [challengeIsProcessing] = useState(false);
  
  // 17挑戰成功後的特殊移動規則
  const [o17ChallengeSuccessPlayers, setO17ChallengeSuccessPlayers] = useState<{[playerId: number]: boolean}>({});
  
  // 路徑選擇相關狀態
  const [showPathSelection, setShowPathSelection] = useState(false);
  const [pathOptions, setPathOptions] = useState<{
    normal: {new_position: string, position_info: any, path: string[]},
    alternative: {new_position: string, path: string[]}
  } | null>(null);
  
  
  // 遊戲主題狀態
  const [gameTheme, setGameTheme] = useState<string>('traffic'); // 默認使用交通主題
  const [showThemeSelection, setShowThemeSelection] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [availableThemes, setAvailableThemes] = useState<Array<{id: string, name: string, key: string}>>([]);
  const [themesLoaded, setThemesLoaded] = useState(false);
  
  // 火車挑戰狀態 - 改為按玩家記錄
  const [playerShortcutPrivileges, setPlayerShortcutPrivileges] = useState<{[playerId: number]: {canUseShortcut: boolean, nextMoveToShortcut: boolean}}>({});
  
  // 暫停狀態
  const [playerSkipped, setPlayerSkipped] = useState<boolean>(false);
  // 道路施工專用暫停狀態
  const [roadConstructionSkip, setRoadConstructionSkip] = useState<{[playerId: number]: boolean}>({});
  // 暫停提示視窗狀態
  const [showSkipAlert, setShowSkipAlert] = useState(false);
  const [skipAlertMessage, setSkipAlertMessage] = useState('');
  // 移除未使用的 playerGameStarted 狀態（現在由 API 處理）

  // 遊戲歷程狀態
  const [gameHistory, setGameHistory] = useState<GameHistory>({
    gameId: `game_${Date.now()}`,
    startTime: new Date(),
    actions: [],
    players: []
  });
  
  // 遊戲是否已在資料庫中創建
  const [isGameCreatedInDB, setIsGameCreatedInDB] = useState(false);

  // 載入情境主題
  useEffect(() => {
    const loadScenarioTopics = async () => {
      try {
        const response = await fetch('http://127.0.0.1:2083/api/v1/chat-choose/list');
        const result = await response.json();
        if (result.code === 200 && result.body) {
          setScenarioTopics(result.body);
        }
      } catch (error) {
        console.error('載入情境主題失敗:', error);
      }
    };
    
    loadScenarioTopics();
  }, []);

  // 初始化主題資料
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:2083/api/v1/vocab-categories/list');
        const result = await response.json();
        
        if (result.code === 200 && result.body) {
          // 只顯示指定的主題：交通工具和職業與社會角色
          const targetThemes = result.body.filter((theme: any) => 
            theme.name === '交通工具' || theme.name === '職業與社會角色'
          );
          
          const formattedThemes = targetThemes.map((theme: any) => ({
            id: theme._id,
            name: theme.name,
            key: theme.name === '交通工具' ? 'traffic' : 'occupation'
          }));
          
          setAvailableThemes(formattedThemes);
          setThemesLoaded(true);
          console.log('主題載入成功:', formattedThemes);
        } else {
          console.error('主題載入失敗:', result.message);
          setThemesLoaded(true);
        }
      } catch (error) {
        console.error('載入主題失敗:', error);
        setThemesLoaded(true);
      }
    };

    loadThemes();
  }, []);

  // 初始化地圖資料
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // 使用遠程資料庫中的地圖 ID
        const boardId = '68c1d61f0b2c1d8e238edceb';
        
        // 獲取地圖完整資訊
        const mapInfo = await MapApiService.getMapInfo(boardId);
        
        if (mapInfo.code === 200 && mapInfo.body) {
          setMapBoard(mapInfo.body.board);
          setIsMapLoaded(true);
          console.log('地圖資料載入成功:', mapInfo.body);
        } else {
          console.error('地圖資料載入失敗:', mapInfo.message);
          // 如果 API 失敗，使用預設資料
          setIsMapLoaded(true);
        }
      } catch (error) {
        console.error('初始化地圖失敗:', error);
        // 如果 API 失敗，使用預設資料
        setIsMapLoaded(true);
      }
    };

    initializeMap();
  }, []);

  // 初始化玩家數據的函數
  const initializePlayers = (playerNames: string[]): Player[] => {
    const avatars = ['🐻', '🐯', '🐘', '🐱'];
    const avatarImages = [
      '/src/assets/小熊頭.png',
      '/src/assets/小貓.png', 
      '/src/assets/老虎.png',
      '/src/assets/大象.png'
    ];
    
    return playerNames.map((name, index) => ({
      id: index + 1,
      name: name,
      avatar: avatars[index] || '🎮',
      avatarImage: avatarImages[index] || '/src/assets/default.png',
      round: 0,
      status: '正常',
      location: 'S0', // 從起始點開始
      locationName: 'S0',
      record: '準備開始',
      records: [{
        id: 1,
        timestamp: new Date(),
        location: 'S0',
        locationName: 'S0',
        action: '遊戲開始',
        details: '準備開始遊戲'
      }],
      isCurrentPlayer: index === 0, // 第一個玩家是當前玩家
      score: 0,
      diceSum: 0,
      currency: 1000, // 初始貨幣
    }));
  };

  // 從location state獲取玩家數據，如果沒有則使用默認值
  const playerNames = location.state?.players || ['彌豆子', '小貓咪', '老虎王', '大象哥'];
  
  // 玩家狀態 - 動態管理
  const [players, setPlayers] = useState<Player[]>(() => initializePlayers(playerNames));

  const currentPlayer = players.find(player => player.isCurrentPlayer);
  const diceValues = [3, 5, 1, 6, 2, 4]; // 隨機骰子值

  // 添加玩家記錄的函數
  const addPlayerRecord = (playerId: number, location: string, locationName: string, action: string, details?: string) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id === playerId) {
          const newRecord: PlayerRecord = {
            id: player.records.length + 1,
            timestamp: new Date(),
            location,
            locationName,
            action,
            details
          };
          return {
            ...player,
            records: [...player.records, newRecord],
            record: `${action} - ${locationName}` // 更新最新記錄顯示
          };
        }
        return player;
      })
    );
  };

  // 記錄遊戲動作的函數
  const recordGameAction = async (
    playerId: number, 
    playerName: string, 
    actionType: GameAction['actionType'], 
    description: string, 
    details?: any
  ) => {
    const newAction: GameAction = {
      id: `action_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      playerId,
      playerName,
      actionType,
      description,
      details
    };

    // 更新前端狀態
    setGameHistory(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));

    // 如果遊戲還沒有在資料庫中創建，先創建遊戲
    if (!isGameCreatedInDB) {
      try {
        const gameData = {
          gameId: gameHistory.gameId,
          gameName: gameTheme || '大富翁遊戲',
          boardId: mapBoard?._id || '',
          players: players.map(p => ({
            id: p.id,
            name: p.name,
            userName: p.userName
          }))
        };

        const response = await fetch('http://127.0.0.1:2083/api/v1/game-history/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gameData),
        });

        if (response.ok) {
          setIsGameCreatedInDB(true);
          console.log('遊戲記錄已創建到資料庫');
        } else {
          console.error('創建遊戲記錄失敗:', await response.text());
        }
      } catch (error) {
        console.error('創建遊戲記錄時發生錯誤:', error);
      }
    }

    // 保存動作到資料庫
    if (isGameCreatedInDB) {
      try {
        const actionData = {
          actionType: newAction.actionType,
          playerId: newAction.playerId,
          playerName: newAction.playerName,
          description: newAction.description,
          details: newAction.details,
          timestamp: newAction.timestamp.toISOString()
        };

        const response = await fetch(`http://127.0.0.1:2083/api/v1/game-history/${gameHistory.gameId}/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(actionData),
        });

        if (!response.ok) {
          console.error('保存遊戲動作失敗:', await response.text());
        }
      } catch (error) {
        console.error('保存遊戲動作時發生錯誤:', error);
      }
    }
  };

  // 結束遊戲並保存到資料庫
  const endGameInDatabase = async (winner?: { playerId: number; playerName: string; reason: string }) => {
    if (!isGameCreatedInDB) return;

    try {
      const finalPlayers = players.map(p => ({
        id: p.id,
        finalScore: p.currency,
        finalRound: p.round
      }));

      const response = await fetch(`http://127.0.0.1:2083/api/v1/game-history/${gameHistory.gameId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winner,
          finalPlayers
        }),
      });

      if (response.ok) {
        console.log('遊戲結束記錄已保存到資料庫');
      } else {
        console.error('保存遊戲結束記錄失敗:', await response.text());
      }
    } catch (error) {
      console.error('保存遊戲結束記錄時發生錯誤:', error);
    }
  };

  // 處理路徑選擇
  const handlePathSelection = (selectedPath: 'normal' | 'alternative') => {
    if (!pathOptions) return;
    
    const selectedOption = selectedPath === 'normal' ? pathOptions.normal : pathOptions.alternative;
    const currentPlayer = players.find(p => p.isCurrentPlayer);
    if (!currentPlayer) return;
    
    console.log('玩家選擇路徑:', selectedPath, selectedOption);
    console.log('selectedOption 結構:', {
      normal: pathOptions.normal,
      alternative: pathOptions.alternative,
      selectedOption
    });

    // 播放骰子音效
    audioManager.play(AudioType.THEME_SELECTION, 0.2);

    // 記錄移動動作
      recordGameAction(
        currentPlayer.id,
        currentPlayer.name,
      'move',
      `${currentPlayer.name} 選擇${selectedPath === 'normal' ? '正常' : 'D5'}路徑移動到 ${selectedOption.new_position}`,
      {
        path: selectedPath,
        newPosition: selectedOption.new_position,
        details: `選擇${selectedPath === 'normal' ? '正常' : 'D5'}路徑，移動到${selectedOption.new_position}`
      }
    );
    
    // 更新玩家位置
      setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id === currentPlayer.id) {
          return {
                ...player,
            locationName: selectedOption.new_position,
            location: selectedOption.new_position,
            record: `${selectedOption.new_position} - 路徑選擇移動完成`
          };
        }
        return player;
      })
    );
    
    // 如果選擇了D5路徑，清除17挑戰成功記錄
    if (selectedPath === 'alternative') {
      console.log('玩家選擇D5路徑，清除17挑戰成功記錄');
      setO17ChallengeSuccessPlayers(prev => {
        const newState = { ...prev };
        delete newState[currentPlayer.id];
        return newState;
      });
    }
    
    // 獲取位置信息並處理後續事件
    console.log('準備獲取位置信息:', selectedOption.new_position);
    fetchPositionInfo(selectedOption.new_position);
    
    // 清除路徑選擇狀態
    setShowPathSelection(false);
    setPathOptions(null);
  };

  // 獲取位置信息並處理事件
  const fetchPositionInfo = async (positionId: string) => {
    try {
      console.log('fetchPositionInfo 被調用，positionId:', positionId, 'boardId:', mapBoard?._id);
      if (!mapBoard?._id) {
        console.error('沒有地圖ID，無法獲取位置信息');
        return;
      }
      const positionResult = await MapApiService.getNodeById(positionId, mapBoard._id);
      console.log('位置信息獲取結果:', positionResult);
      if (positionResult.code === 200 && positionResult.body) {
        const position_info = positionResult.body;
        
        // 處理位置事件
        handleLocationEvent(position_info);
      }
    } catch (error) {
      console.error('獲取位置信息失敗:', error);
    }
  };

  // 處理骰子點擊 - 玩家實體擲骰子後點擊對應數字
  const handleDiceClick = async (value: number) => {
    if (!currentPlayer || !mapBoard) return;

    try {
      // 使用 API 計算移動
      const moveRequest = {
        board_id: mapBoard._id,
        player_id: currentPlayer.id.toString(),
        current_position: currentPlayer.locationName,
        dice_value: value,
        // 檢查是否有17挑戰成功記錄
        o17_challenge_success: o17ChallengeSuccessPlayers[currentPlayer.id] || false
      };
      
      console.log('當前玩家位置:', currentPlayer.locationName, '類型:', typeof currentPlayer.locationName);
      
      console.log('移動請求:', moveRequest);

      const moveResult = await MapApiService.calculateMove(moveRequest);
      
      console.log('移動結果:', moveResult);
      
      if (moveResult.code === 200 && moveResult.body) {
        const { new_position, position_info, passed_start, alternative_path } = moveResult.body;

        // 如果有alternative_path，顯示路徑選擇
        if (alternative_path) {
          console.log('有D5路徑選項，顯示路徑選擇');
          setPathOptions({
            normal: {
              new_position,
              position_info,
              path: [currentPlayer.locationName, new_position]
            },
            alternative: alternative_path
          });
          setShowPathSelection(true);
          return; // 等待玩家選擇路徑
        }

    // 播放骰子音效
        audioManager.play(AudioType.THEME_SELECTION, 0.2);

    // 記錄擲骰子動作
        recordGameAction(
          currentPlayer.id,
          currentPlayer.name,
      'dice_roll',
      `${currentPlayer.name} 擲出 ${value} 點`,
          { diceValue: value, location: currentPlayer.locationName }
        );

        // 更新玩家位置
      setPlayers(prevPlayers => 
          prevPlayers.map(player => {
            if (player.id === currentPlayer.id) {
              const updatedPlayer = {
                ...player,
                locationName: new_position,
                location: position_info.node_id, // 使用節點ID作為位置
                record: `${position_info.name} - 移動完成`
              };
              console.log(`${player.name} 位置更新:`, {
                從: player.locationName,
                到: updatedPlayer.locationName,
                位置ID: updatedPlayer.location
              });
              return updatedPlayer;
            }
            return player;
          })
        );

        // 檢查是否經過起點，並更新經過次數和回合數
        if (passed_start) {
          const currentPlayerId = currentPlayer.id;
          setPlayersPassedStart(prev => {
            const newCount = (prev[currentPlayerId] || 0) + 1;
            console.log(`${currentPlayer.name} 經過起點，第 ${newCount} 次`);
            
            // 顯示經過起點慶祝視窗
            setPassedStartMessage(`${currentPlayer.name} 經過起點！第 ${newCount} 次`);
            setShowPassedStartCelebration(true);
            
            // 3秒後自動關閉慶祝視窗
            setTimeout(() => {
              setShowPassedStartCelebration(false);
            }, 3000);
            
            // 檢查是否獲勝（經過起點3次）
            if (newCount >= 3) {
              setWinner(currentPlayer);
      recordGameAction(
        currentPlayer.id,
        currentPlayer.name,
                'victory',
                `${currentPlayer.name} 經過起點3次，獲得勝利！`,
                { winner: true, passedStartCount: newCount }
              );
              
            setTimeout(async () => {
                setShowGameOver(true);
                // 結束遊戲並保存到資料庫
                await endGameInDatabase({
                  playerId: currentPlayer.id,
                  playerName: currentPlayer.name,
                  reason: '經過起點3次'
                });
              }, 1000);
          }
          
            return {
          ...prev,
              [currentPlayerId]: newCount
            };
          });
          
          // 更新玩家回合數
          setPlayers(prev => prev.map(player => {
            if (player.id === currentPlayerId) {
              return {
                ...player,
                round: player.round + 1
              };
            }
            return player;
          }));
        }

        // 記錄移動動作
      recordGameAction(
        currentPlayer.id,
        currentPlayer.name,
        'move',
          `${currentPlayer.name} 移動到：${position_info.name}`,
          { 
            from: currentPlayer.locationName, 
            to: new_position, 
            propertyType: position_info.type,
            property: position_info
          }
      );

      // 添加玩家記錄
      addPlayerRecord(
        currentPlayer.id,
        position_info.node_id, 
        position_info.name, 
        '移動到', 
        `擲出${value}點，移動到${position_info.name}`
      );

        // 根據格子類型處理後續事件
        handleLocationEvent(position_info);
        
          } else {
        console.error('移動計算失敗:', moveResult.message);
        // 如果 API 失敗，可以回退到原來的邏輯或顯示錯誤訊息
      }
    } catch (error) {
      console.error('處理移動失敗:', error);
      // 如果 API 失敗，可以回退到原來的邏輯或顯示錯誤訊息
    }
  };

  // 處理位置事件的函數
  const handleLocationEvent = (positionInfo: any) => {
    if (!positionInfo) return;

    console.log('處理位置事件:', {
      node_id: positionInfo.node_id,
      name: positionInfo.name,
      type: positionInfo.type,
      challenge_type: positionInfo.challenge?.type
    });

      // 根據格子類型顯示不同的視窗
    if (positionInfo.type === 'property') {
        // 地產格子顯示優惠券視窗
        setCouponType('property');
        setShowCouponPanel(true);
    } else if (positionInfo.name === '加油站') {
        // 加油站顯示優惠券視窗
        setCouponType('gas_station');
        setShowCouponPanel(true);
    } else if (positionInfo.type === 'stop') {
        // stop 類型格子直接暫停一回合，不顯示優惠券
        const currentPlayer = players.find(p => p.isCurrentPlayer);
        if (currentPlayer) {
          setRoadConstructionSkip(prev => ({
            ...prev,
            [currentPlayer.id]: true
          }));
          
          recordGameAction(
            currentPlayer.id,
            currentPlayer.name,
            'move',
            `${currentPlayer.name} 在${positionInfo.name}暫停一回合`,
            { location: currentPlayer.location, skipped: true, positionType: 'stop' }
          );
          
          // 顯示暫停提示
          setSkipAlertMessage(`${currentPlayer.name} 在${positionInfo.name}暫停一回合`);
          setShowSkipAlert(true);
          
          // 直接切換到下一位玩家
          setTimeout(() => {
            setShowSkipAlert(false);
            switchToNextPlayer();
          }, 2000);
        }
    } else if (positionInfo.type === 'challenge' || positionInfo.type === 'vocabulary') {
        // 檢查是否為"來學單字"格子
      if (positionInfo.challenge?.type === 'vocabulary' || positionInfo.type === 'vocabulary') {
          // 來學單字格子觸發單字卡片
          setIsDrawingCard(true);
          
          // 抽卡片動畫效果
        setTimeout(async () => {
          try {
            // 根據遊戲主題獲取對應的分類 ID
            const categoryId = gameTheme === 'traffic' 
              ? '6894ec12e4c25617b65cd248' // 交通工具分類 ID
              : gameTheme === 'occupation' 
              ? '6894ec12e4c25617b65cd25c' // 職業與社會角色分類 ID
              : '6894ec12e4c25617b65cd248'; // 預設使用交通工具
            
            // 使用原本的 API 獲取單字卡片
            const response = await fetch(`http://127.0.0.1:2083/api/v1/vocab-cards/by-category/${categoryId}`);
            const result = await response.json();
            
            if (result.code === 200 && result.body && result.body.length > 0) {
              const randomIndex = Math.floor(Math.random() * result.body.length);
              const selectedCard = result.body[randomIndex];
              
              console.log('從 API 獲取的單字卡片:', selectedCard);
              
              // 獲取對應的圖片
              try {
                const imageResponse = await fetch(`http://127.0.0.1:2083/api/v1/vocabulary-pictures/by-card/${selectedCard._id}`);
                const imageResult = await imageResponse.json();
                
                if (imageResult.code === 200 && imageResult.body) {
                  selectedCard.image = imageResult.body.imageUrl;
                  console.log('獲取圖片成功:', imageResult.body.imageUrl);
                } else {
                  console.log('該單字卡片沒有對應的圖片');
                  selectedCard.image = null;
                }
              } catch (imageError) {
                console.error('獲取圖片失敗:', imageError);
                selectedCard.image = null;
              }
              
            setCurrentWordCard(selectedCard);
            setIsDrawingCard(false);
            setShowWordCard(true);
            
            // 記錄遊戲動作
            const currentPlayer = players.find(p => p.isCurrentPlayer);
            if (currentPlayer) {
              recordGameAction(
                currentPlayer.id,
                currentPlayer.name,
                'challenge',
                  `來學單字卡片: ${selectedCard.han}`,
                  { cardId: selectedCard._id, category: selectedCard.categoryId, theme: gameTheme }
                );
              }
            } else {
              console.error('沒有可用的單字卡片！', result);
              setIsDrawingCard(false);
            }
          } catch (error) {
            console.error('獲取單字卡片失敗:', error);
            setIsDrawingCard(false);
            }
          }, 2000); // 2秒抽卡片動畫
      } else if (positionInfo.challenge?.type === 'train') {
        // 火車挑戰格子
        setCurrentChallenge(positionInfo.challenge);
          setShowChallengePanel(true);
        } else {
          // 其他挑戰格子顯示挑戰側邊面板
        setCurrentChallenge(positionInfo.challenge);
          setShowChallengePanel(true);
        }
      } else {
        // 其他格子顯示位置詳情
        setCurrentLocationDetail(positionInfo);
        setShowLocationDetail(true);
        
        // 只有非機會格、非獎勵格、非起點格才自動切換到下一個玩家
        if (positionInfo.type !== 'chance' && positionInfo.type !== 'reward' && positionInfo.type !== 'start') {
          // 自動切換到下一個玩家
          setTimeout(() => {
            switchToNextPlayer();
          }, 1000); // 1秒後自動切換
      }
    }
  };

  // 切換到下一玩家
  const switchToNextPlayer = () => {
    setPlayers(prevPlayers => {
      const currentIndex = prevPlayers.findIndex(p => p.isCurrentPlayer);
      const currentPlayer = prevPlayers[currentIndex];
      let nextIndex = (currentIndex + 1) % prevPlayers.length;
      
      console.log('輪換玩家:', {
        currentPlayer: currentPlayer?.name,
        nextPlayer: prevPlayers[nextIndex]?.name,
        currentIndex,
        nextIndex,
        playerSkipped,
        roadConstructionSkip,
        currentRound,
        playersInCurrentRound
      });
      
      // 如果當前玩家被暫停，跳過一次
      if (playerSkipped) {
        setPlayerSkipped(false); // 重置暫停狀態
        return prevPlayers.map((player, index) => ({
          ...player,
          isCurrentPlayer: index === nextIndex
        }));
      }
      
      // 檢查下一個玩家是否有道路施工暫停狀態
      const nextPlayer = prevPlayers[nextIndex];
      if (nextPlayer && roadConstructionSkip[nextPlayer.id]) {
        // 顯示暫停提示視窗
        setSkipAlertMessage(`${nextPlayer.name} 因道路施工暫停一回合，換下一位玩家`);
        setShowSkipAlert(true);
        
        // 記錄跳過動作
        recordGameAction(
          nextPlayer.id,
          nextPlayer.name,
          'move',
          `${nextPlayer.name} 因道路施工暫停，本次輪到被跳過`,
          { skipped: true, roadConstructionSkip: true }
        );
        
        // 跳過這個玩家，到下下一個
        nextIndex = (nextIndex + 1) % prevPlayers.length;
        
        // 清除該玩家的道路施工暫停狀態
        setRoadConstructionSkip(prev => {
          const newState = { ...prev };
          delete newState[nextPlayer.id];
          return newState;
        });
      }
      
      // 簡化輪換邏輯：直接切換到下一個玩家，不管理複雜的回合數
      console.log('直接切換到下一個玩家');
      return prevPlayers.map((player, index) => ({
        ...player,
        isCurrentPlayer: index === nextIndex
      }));
    });
  };

  // 更新玩家狀態
  const updatePlayerStatus = (playerId: number, updates: Partial<Player>) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId 
          ? { ...player, ...updates }
          : player
      )
    );
  };

  // 處理破產
  const handleBankruptcy = async () => {
    if (currentPlayer) {
      // 播放遊戲結束音效
      audioManager.play(AudioType.VIEW_SCORE, 0.7);
      recordGameAction(
        currentPlayer.id,
        currentPlayer.name,
        'bankruptcy',
        `${currentPlayer.name} 選擇破產`,
        { location: currentPlayer.location, round: currentPlayer.round }
      );
      
      // 更新玩家狀態為破產
      updatePlayerStatus(currentPlayer.id, {
        status: '破產',
        record: '遊戲結束 - 破產'
      });
      
      // 切換到下一玩家
      switchToNextPlayer();
    }
    // 破產時不設置獲勝者，直接顯示遊戲結束
    setWinner(null);
    setShowGameOver(true);
    
    // 結束遊戲並保存到資料庫（無獲勝者）
    await endGameInDatabase();
  };


  // 處理挑戰完成
  const handleChallengeComplete = (challengeType: string, reward: string) => {
    if (!currentPlayer) return;
    
    recordGameAction(
      currentPlayer.id,
      currentPlayer.name,
      'challenge',
      `${currentPlayer.name} 完成 ${challengeType} 挑戰`,
      { challengeType, reward }
    );
    
    updatePlayerStatus(currentPlayer.id, {
      record: `${challengeType} 挑戰完成 - ${reward}`
    });
  };

  // 處理挑戰主題選擇 - 直接使用情境挑戰邏輯
  const handleChallengeTypeSelect = async () => {
    if (!gameTheme) return;
    
    // 播放開始挑戰音效
    audioManager.play(AudioType.START_CHALLENGE, 0.6);
    
    // 直接使用情境挑戰的變數，設置為 'scenario'
    setSelectedCouponChallengeType('scenario');
    setChallengeResult(null);
    setPlayerAnswer('');
    
    // 直接調用情境挑戰的啟動函數
    await handleStartChallengeScenario();
  };

  // 啟動挑戰情境對話（直接使用情境挑戰邏輯）
  const handleStartChallengeScenario = async () => {
    try {
      console.log('啟動挑戰情境對話，遊戲主題:', gameTheme);
      
      // 獲取情境主題列表
      const response = await fetch('http://127.0.0.1:2083/api/v1/chat-choose/list');
      const result = await response.json();
      
      if (result.code === 200 && result.body) {
        // 根據遊戲主題選擇對應的情境主題
        let selectedTopic = null;
        
        if (gameTheme === 'traffic') {
          selectedTopic = result.body.find((topic: any) => topic.name === '交通工具');
        } else if (gameTheme === 'occupation') {
          selectedTopic = result.body.find((topic: any) => topic.name === '職業與社會角色');
        }
        
        if (selectedTopic) {
          console.log('選擇的挑戰情境主題:', selectedTopic.name, '遊戲主題:', gameTheme);
          
          const userId = localStorage.getItem('userId') || 'default_user';
          
          // 開始挑戰情境對話（使用情境挑戰的邏輯）
          const response = await fetch('http://127.0.0.1:2083/api/v1/scenario/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatChooseId: selectedTopic._id,
              userId: userId
            })
          });
          
          const startResult = await response.json();
          
          if (startResult.code === 200 && startResult.body) {
            console.log('設置 scenarioSessionId:', startResult.body.session_id);
            
            // 直接使用情境挑戰的變數
            setScenarioSessionId(startResult.body.session_id);
            setScenarioMessages([{
              type: 'incoming',
              sender: '小熊',
              content: startResult.body.npc_text || '歡迎來到挑戰！讓我們開始對話吧！'
            }]);
            
            console.log('挑戰情境對話啟動成功:', startResult.body);
            console.log('狀態設置完成，scenarioSessionId 應該為:', startResult.body.session_id);
          } else {
            console.error('啟動挑戰情境對話失敗:', startResult);
          }
        } else {
          console.error('找不到對應的挑戰情境主題');
        }
      } else {
        console.error('獲取挑戰情境主題失敗:', result);
      }
    } catch (error) {
      console.error('啟動挑戰情境對話錯誤:', error);
    }
  };

  // 處理玩家答案提交
  const handleAnswerSubmit = () => {
    if (!selectedChallengeType || !playerAnswer.trim()) return;
    
    let isCorrect = false;
    
    // 使用 currentWordCard 來判斷答案（API獲取的單字卡）
    if (currentWordCard) {
      isCorrect = playerAnswer === currentWordCard.ch || playerAnswer === currentWordCard.han;
      console.log(`挑戰答案判斷 (API單字卡): "${playerAnswer}" vs 中文"${currentWordCard.ch}" 或 台語"${currentWordCard.han}" = ${isCorrect ? '正確' : '錯誤'}`);
    } else {
      console.warn('沒有可用的單字卡片來判斷答案');
      isCorrect = false;
    }
    
    if (isCorrect !== undefined) {
      
      setChallengeResult(isCorrect ? 'success' : 'failure');
      
      // 播放挑戰結果音效
      if (isCorrect) {
        audioManager.play(AudioType.CORRECT_ANSWER, 0.6);
      } else {
        audioManager.play(AudioType.WRONG_ANSWER, 0.6);
      }
      
      // 檢查是否為火車挑戰
      if (currentChallenge?.type === 'train') {
        const currentPlayer = players.find(p => p.isCurrentPlayer);
        if (currentPlayer) {
          setPlayerShortcutPrivileges(prev => ({
            ...prev,
            [currentPlayer.id]: {
              canUseShortcut: isCorrect,
              nextMoveToShortcut: isCorrect // 如果挑戰成功，設置下一次移動到捷徑
            }
          }));
        }
        
        // 記錄火車挑戰結果
        if (currentPlayer) {
          recordGameAction(
            currentPlayer.id,
            currentPlayer.name,
            'challenge',
            `火車挑戰${isCorrect ? '成功' : '失敗'}: ${challengeQuestion} - ${isCorrect ? '下一次移動將在捷徑路線(36-41)' : '本次不能使用捷徑'}`,
            { 
              answer: playerAnswer, 
              correct: isCorrect, 
              challengeType: 'train', 
              nextMoveToShortcut: isCorrect,
              location: currentPlayer.locationName,
              timestamp: new Date().toISOString()
            }
          );
          
          // 添加玩家記錄
          addPlayerRecord(
            currentPlayer.id, 
            currentPlayer.location, 
            currentPlayer.locationName, 
            '火車挑戰', 
            `挑戰-${isCorrect ? '成功' : '失敗'}`
          );
        }
        
      } else {
        // 一般挑戰記錄
        const currentPlayer = players.find(p => p.isCurrentPlayer);
        if (currentPlayer) {
          recordGameAction(
            currentPlayer.id,
            currentPlayer.name,
            'challenge',
            `挑戰${isCorrect ? '成功' : '失敗'}: ${challengeQuestion}`,
            { 
              answer: playerAnswer, 
              correct: isCorrect, 
              challengeType: 'general',
              location: currentPlayer.locationName,
              timestamp: new Date().toISOString()
            }
          );
          
          // 添加玩家記錄
          addPlayerRecord(
            currentPlayer.id, 
            currentPlayer.location, 
            currentPlayer.locationName, 
            '情境挑戰', 
            `${isCorrect ? '成功' : '失敗'} - ${challengeQuestion.substring(0, 20)}...`
          );
        }
      }
    }
  };

  // STT 相關函數
  const startRecording = useCallback(async () => {
    console.log('startRecording 被調用，currentWordCard:', currentWordCard);
    console.log('selectedCouponChallengeType:', selectedCouponChallengeType);
    console.log('scenarioSessionId:', scenarioSessionId);
    console.log('selectedChallengeType:', selectedChallengeType);
    console.log('challengeSessionId:', challengeSessionId);
    console.log('showChallengePanel:', showChallengePanel);
    console.log('currentChallenge:', currentChallenge);
    
    // 檢查是否在情境對話模式
    const isScenarioMode = selectedCouponChallengeType === 'scenario' && scenarioSessionId;
    // 檢查是否在挑戰對話模式
    const isChallengeMode = selectedChallengeType && challengeSessionId;
    // 額外檢查：如果在挑戰面板且顯示對話
    const isInChallengeDialog = showChallengePanel && challengeSessionId;
    
    console.log('isScenarioMode:', isScenarioMode, 'isChallengeMode:', isChallengeMode, 'isInChallengeDialog:', isInChallengeDialog);
    
    if (!isScenarioMode && !currentWordCard && !isChallengeMode && !isInChallengeDialog) {
      console.error('開始錄音時沒有當前單字卡片且不在情境對話模式或挑戰對話模式');
      console.error('詳細狀態:', {
        isScenarioMode,
        currentWordCard: !!currentWordCard,
        isChallengeMode,
        isInChallengeDialog,
        selectedChallengeType,
        challengeSessionId,
        showChallengePanel
      });
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        console.log('錄音資料可用:', event.data.size, 'bytes');
        console.log('錄音時 currentWordCard:', currentWordCard);
        if (event.data.size > 0) {
          processVoiceInput(event.data);
        }
      };
      
      recorder.onstop = () => {
        console.log('錄音停止');
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      console.log('開始錄音');
    } catch (error) {
      console.error('無法開始錄音:', error);
      alert('無法訪問麥克風，請檢查權限設定');
    }
  }, [currentWordCard, selectedCouponChallengeType, scenarioSessionId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      console.log('停止錄音');
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  }, [mediaRecorder, isRecording]);

  const processVoiceInput = useCallback(async (audioBlob: Blob) => {
    console.log('processVoiceInput 被調用');
    
    setIsProcessing(true);
    
    try {
      // 檢查是否在情境挑戰模式
      if (selectedCouponChallengeType === 'scenario' && scenarioSessionId) {
        console.log('情境對話模式：處理語音輸入');
        
        // 使用情境對話的語音服務（參考 Home.tsx 的邏輯）
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('session_id', scenarioSessionId);
        formData.append('user_id', localStorage.getItem('userId') || 'default_user');
        formData.append('chat_choose_id', 'default_chat_choose'); // 使用預設值
        formData.append('title', '台語語音對話');
        
        console.log('發送情境對話 STT 請求到:', 'http://localhost:5050/process_audio');
        
        const response = await fetch('http://localhost:5050/process_audio', {
          method: 'POST',
          body: formData,
        });
        
        console.log('情境對話 STT 響應狀態:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('情境對話 STT 服務錯誤響應:', errorText);
          throw new Error(`情境對話語音服務錯誤: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('情境對話 STT 響應結果:', result);
        
        if (result.success) {
          // 一次性添加用戶語音辨識結果和AI回應
          setScenarioMessages(prev => {
            const newMessages = [...prev];
            
            // 添加用戶的語音辨識結果
            if (result.transcription) {
              console.log('用戶語音辨識結果:', result.transcription);
              newMessages.push({ 
                type: 'outgoing' as const, 
                sender: '你', 
                content: result.transcription 
              });
            }
            
            // 添加AI回應
            if (result.ai_response) {
              console.log('AI 回應:', result.ai_response);
              newMessages.push({ 
                type: 'incoming' as const, 
                sender: '小熊', 
                content: result.ai_response 
              });
            }
            
            // 在更新消息後計算對話次數
            const conversationCount = newMessages.length;
            console.log('語音輸入後的消息數量:', conversationCount);
            
            return newMessages;
          });
          
          // 播放 TTS 音頻
          if (result.ai_response && result.audio_url) {
            console.log('播放 TTS 音頻:', result.audio_url);
            const audio = new Audio(result.audio_url);
            audio.play().catch(error => {
              console.error('TTS 音頻播放失敗:', error);
            });
          }
          
          // 使用現有的 scenario API 保存對話記錄
          if (result.transcription) {
            try {
              const turnResult = await fetch('http://127.0.0.1:2083/api/v1/scenario/turn_text', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  session_id: scenarioSessionId,
                  text: result.transcription
                })
              });
              
              const turnResponse = await turnResult.json();
              console.log('情境對話回合結果:', turnResponse);
              console.log('回合詳細資訊:', { 
                finished: turnResponse?.body?.finished, 
                turn: turnResponse?.body?.turn, 
                score: turnResponse?.body?.score 
              });
              
              // 注意：這裡我們已經在 setScenarioMessages 中正確計算了對話次數
              // 我們需要等待狀態更新後再檢查成功條件
              // 使用 setTimeout 確保狀態已更新
              setTimeout(() => {
                setScenarioMessages(currentMessages => {
                  const conversationCount = currentMessages.length;
                  const isSuccess = conversationCount >= 3;
                  
                  console.log('情境挑戰結果判斷 (語音輸入):', { 
                    conversationCount, 
                    turn: turnResponse.body.turn || 0, 
                    score: turnResponse.body.score || 0, 
                    isSuccess,
                    messages: currentMessages.length
                  });
                  
                  if (isSuccess) {
                    setCouponChallengeResult('success');
                    console.log('🎉 情境挑戰成功！');
                    
                    // 檢查是否在17位置挑戰成功
                    const currentPlayer = players.find(p => p.isCurrentPlayer);
                    if (currentPlayer && currentPlayer.locationName === '17') {
                      console.log('17挑戰成功！設置該玩家可以往D5移動');
                      setO17ChallengeSuccessPlayers(prev => ({
                        ...prev,
                        [currentPlayer.id]: true
                      }));
                    }
                    
                    // 記錄遊戲動作（只有成功時才記錄）
                    if (currentPlayer) {
                      recordGameAction(
                        currentPlayer.id,
                        currentPlayer.name,
                        'challenge',
                        `${currentPlayer.name} 情境挑戰: 成功`,
                        { 
                          challengeType: 'scenario',
                          conversationCount: conversationCount,
                          location: currentPlayer.locationName,
                          timestamp: new Date().toISOString(),
                          correct: true
                        }
                      );
                    }
                  }
                  // 如果對話次數還沒達到3次，不設置失敗結果，讓玩家繼續對話
                  
                  return currentMessages; // 不修改消息，只是檢查成功條件
                });
              }, 100); // 等待 100ms 確保狀態已更新
            } catch (error) {
              console.error('保存對話記錄失敗:', error);
            }
          }
        } else {
          console.error('情境對話語音辨識失敗，響應:', result);
        }
        
      } else if (currentWordCard) {
        // 單字挑戰模式（保持原有邏輯）
        console.log('單字挑戰模式：處理語音輸入');
        console.log('目標單字 (中文翻譯):', currentWordCard.ch);
        console.log('目標單字 (台語漢字):', currentWordCard.han);
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('session_id', 'word_card_challenge');
        formData.append('user_id', localStorage.getItem('userId') || 'default_user');
        formData.append('chat_choose_id', 'word_card_challenge');
        formData.append('title', '台語單字挑戰');
        formData.append('skip_llm', 'true');
        formData.append('skip_tts', 'true');
        formData.append('skip_db', 'true');
        
        const response = await fetch('http://localhost:5050/process_audio', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success && result.transcription) {
          const transcription = result.transcription.trim();
          setWordCardSTTResult(transcription);
          
          const isCorrect = transcription === currentWordCard.ch || transcription === currentWordCard.han;
          setWordCardChallengeResult(isCorrect ? 'success' : 'failure');
          
          console.log(`單字挑戰結果: "${transcription}" vs 中文翻譯"${currentWordCard.ch}" 或 台語漢字"${currentWordCard.han}" = ${isCorrect ? '成功' : '失敗'}`);
          
          // 記錄單字挑戰結果到資料庫
          const currentPlayer = players.find(p => p.isCurrentPlayer);
          if (currentPlayer) {
            recordGameAction(
              currentPlayer.id,
              currentPlayer.name,
              'challenge',
              `單字挑戰${isCorrect ? '成功' : '失敗'}: ${currentWordCard.han} (${currentWordCard.ch})`,
              {
                challengeType: 'vocabulary',
                word: currentWordCard.han,
                meaning: currentWordCard.ch,
                answer: transcription,
                correct: isCorrect,
                location: currentPlayer.locationName,
                timestamp: new Date().toISOString()
              }
            );
          }
        }
      } else if (selectedChallengeType && challengeSessionId) {
        // 挑戰對話模式 - 直接使用情境挑戰的語音處理邏輯
        console.log('挑戰對話模式：處理語音輸入');
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('session_id', challengeSessionId);
        formData.append('user_id', localStorage.getItem('userId') || 'default_user');
        formData.append('chat_choose_id', 'challenge_scenario');
        formData.append('title', '台語挑戰對話');
        
        console.log('發送挑戰對話 STT 請求到:', 'http://localhost:5050/process_audio');
        
        const response = await fetch('http://localhost:5050/process_audio', {
          method: 'POST',
          body: formData,
        });
        
        console.log('挑戰對話 STT 響應狀態:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('挑戰對話 STT 服務錯誤響應:', errorText);
          throw new Error(`挑戰對話語音服務錯誤: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('挑戰對話 STT 響應結果:', result);
        
        if (result.success) {
          // 顯示台語辨識結果（用戶的語音內容）
          if (result.transcription) {
            console.log('用戶語音辨識結果:', result.transcription);
            setChallengeMessages(prev => [...prev, { 
              type: 'outgoing' as const, 
              sender: '你', 
              content: result.transcription 
            }]);
          }
          
          // 顯示台語AI回應
          if (result.ai_response) {
            console.log('AI 回應:', result.ai_response);
            setChallengeMessages(prev => [...prev, { 
              type: 'incoming' as const, 
              sender: '小熊', 
              content: result.ai_response 
            }]);
            
            // 播放 TTS 音頻
            if (result.audio_url) {
              console.log('播放 TTS 音頻:', result.audio_url);
              const audio = new Audio(result.audio_url);
              audio.play().catch(error => {
                console.error('TTS 音頻播放失敗:', error);
              });
            }
          }
          
          // 使用現有的 scenario API 保存對話記錄
          if (result.transcription) {
            try {
              const turnResult = await fetch('http://127.0.0.1:2083/api/v1/scenario/turn_text', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  session_id: challengeSessionId,
                  text: result.transcription
                })
              });
              
              const turnResponse = await turnResult.json();
              console.log('挑戰對話回合結果:', turnResponse);
              
              // 前端判斷成功條件：對話3次就算成功
              setTimeout(() => {
                setChallengeMessages(currentMessages => {
                  const conversationCount = currentMessages.length;
                  const isSuccess = conversationCount >= 3;
                  
                  console.log('挑戰對話結果判斷:', { 
                    conversationCount, 
                    isSuccess,
                    messages: currentMessages.length
                  });
                  
                  if (isSuccess) {
                    setChallengeResult('success');
                    console.log('🎉 挑戰對話成功！');
                    
                    // 檢查是否在17位置挑戰成功
                    const currentPlayer = players.find(p => p.isCurrentPlayer);
                    if (currentPlayer && currentPlayer.locationName === '17') {
                      console.log('17挑戰成功！設置該玩家可以往D5移動');
                      setO17ChallengeSuccessPlayers(prev => ({
                        ...prev,
                        [currentPlayer.id]: true
                      }));
                    }
                  }
                  // 如果對話次數還沒達到3次，讓玩家繼續對話
                  
                  return currentMessages;
                });
              }, 100);
              
            } catch (error) {
              console.error('保存挑戰對話記錄失敗:', error);
            }
          }
        } else {
          console.error('挑戰對話語音辨識失敗，響應:', result);
        }
      } else {
        console.error('沒有當前單字卡片或情境會話');
      }
    } catch (error) {
      console.error('語音處理錯誤:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentWordCard, selectedCouponChallengeType, scenarioSessionId, scenarioMessages]);

  // 重置挑戰狀態
  const resetChallenge = () => {
    const wasTrainChallenge = currentChallenge?.type === 'train' || currentChallenge?.type === 'transport';
    const currentPlayer = players.find(p => p.isCurrentPlayer);
    
    // 記錄挑戰結果（如果有結果的話）
    if (currentPlayer) {
      if (challengeResult) {
        const challengeTypeName = wasTrainChallenge ? '火車挑戰' : 
                                 currentChallenge?.type === 'vocabulary' ? '單字挑戰' : 
                                 currentChallenge?.type === 'story' ? '情境挑戰' : '挑戰';
        
        recordGameAction(
          currentPlayer.id,
          currentPlayer.name,
          'challenge',
          `${challengeTypeName}${challengeResult === 'success' ? '成功' : '失敗'}`,
          {
            challengeType: wasTrainChallenge ? 'train' : currentChallenge?.type || 'general',
            correct: challengeResult === 'success',
            location: currentPlayer.locationName,
            timestamp: new Date().toISOString()
          }
        );
      } else if (couponChallengeResult) {
        // 記錄優惠券挑戰結果
        const challengeTypeName = currentChallenge?.type === 'transport' ? '火車挑戰' : '情境挑戰';
        
        recordGameAction(
          currentPlayer.id,
          currentPlayer.name,
          'challenge',
          `${challengeTypeName}${couponChallengeResult === 'success' ? '成功' : '失敗'}`,
          {
            challengeType: 'coupon',
            correct: couponChallengeResult === 'success',
            location: currentPlayer.locationName,
            timestamp: new Date().toISOString()
          }
        );
      }
    }
    
    setSelectedCouponChallengeType(null);
    setChallengeQuestion('');
    setPlayerAnswer('');
    setChallengeResult(null);
    setCouponChallengeResult(null); // 重置情境挑戰結果
    setShowChallengePanel(false);
    setCurrentChallenge(null);
    
    // 重置情境挑戰相關狀態
    setScenarioSessionId(null);
    setScenarioMessages([]);
    setScenarioIsProcessing(false);
    
    // 注意：不重置 playerShortcutPrivileges，因為這些是挑戰結果，按玩家記錄
    
    // 如果是火車挑戰，完成後自動切換到下一位玩家
    if (wasTrainChallenge) {
      switchToNextPlayer();
    } else if (currentPlayer && currentPlayer.locationName === '17' && challengeResult === 'success') {
      // 17 挑戰成功後移動到 D5
      console.log('17 挑戰成功，移動到 D5');
      
      // 更新玩家位置到 D5
      const updatedPlayers = players.map(player => {
        if (player.id === currentPlayer.id) {
          return {
            ...player,
            location: 'D5', // 使用D5作為位置
            locationName: 'D5'
          };
        }
        return player;
      });
      
      setPlayers(updatedPlayers);
      
      // 記錄移動
      recordGameAction(
        currentPlayer.id,
        currentPlayer.name,
        'move',
        `${currentPlayer.name} 17挑戰成功，移動到 D5`,
        { 
          from: '17', 
          to: 'D5', 
          reason: 'challenge_success',
          challengeType: 'culture'
        }
      );
      
      // 更新玩家狀態
      updatePlayerStatus(currentPlayer.id, {
        locationName: 'D5',
        record: `17挑戰成功，移動到D5`
      });
      
      // 挑戰完成後切換到下一位玩家
      switchToNextPlayer();
    } else {
      // 其他挑戰完成後直接切換玩家
      switchToNextPlayer();
    }
  };

  // 處理優惠券挑戰主題選擇 - 改為情境對話
  const handleCouponChallengeTypeSelect = async () => {
    setSelectedCouponChallengeType('scenario');
    setCouponChallengeResult(null);
    setScenarioMessages([]);
    setScenarioPlayerInput('');
    setScenarioSessionId(null);
    
    // 自動開始情境對話
    await handleStartScenarioChallenge();
  };

  // 開始情境對話挑戰
  const handleStartScenarioChallenge = async () => {
    try {
      // 根據當前遊戲主題選擇對應的情境主題
      if (scenarioTopics.length === 0) {
        console.error('沒有可用的情境主題');
        return;
      }
      
      // 根據遊戲主題過濾情境主題
      let filteredTopics = scenarioTopics;
      if (gameTheme === 'traffic') {
        // 交通工具主題：選擇「交通工具」情境
        filteredTopics = scenarioTopics.filter(topic => 
          topic.name === '交通工具'
        );
      } else if (gameTheme === 'occupation') {
        // 職業主題：選擇「職業與社會角色」情境
        filteredTopics = scenarioTopics.filter(topic => 
          topic.name === '職業與社會角色'
        );
      }
      
      // 如果沒有找到對應主題，則使用隨機主題
      if (filteredTopics.length === 0) {
        filteredTopics = scenarioTopics;
      }
      
      const selectedTopic = filteredTopics[Math.floor(Math.random() * filteredTopics.length)];
      console.log('選擇的情境主題:', selectedTopic.name, '遊戲主題:', gameTheme);
      
      const userId = localStorage.getItem('userId') || 'default_user';
      
      // 開始情境對話
      const response = await fetch('http://127.0.0.1:2083/api/v1/scenario/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatChooseId: selectedTopic._id,
          userId: userId
        })
      });
      
      const result = await response.json();
      
      if (result.code === 200 && result.body) {
        setScenarioSessionId(result.body.session_id);
        setScenarioMessages([
          { type: 'incoming', sender: '小熊', content: result.body.npc_text }
        ]);
      } else {
        console.error('情境對話啟動失敗:', result.message);
      }
    } catch (error) {
      console.error('情境對話啟動錯誤:', error);
    }
  };

  // 處理情境對話提交 (未使用)
  const _handleScenarioSubmit = async () => {
    if (!scenarioSessionId || !scenarioPlayerInput.trim() || scenarioIsProcessing) {
      return;
    }
    
    const userInput = scenarioPlayerInput.trim();
    setScenarioPlayerInput('');
    setScenarioIsProcessing(true);
    
    // 添加用戶訊息
    setScenarioMessages(prev => {
      const newMessages = [...prev, { type: 'outgoing' as const, sender: '你', content: userInput }];
      console.log('添加用戶消息後的消息數量:', newMessages.length);
      console.log('用戶輸入:', userInput);
      return newMessages;
    });
    
    try {
      // 發送情境對話回合
      const response = await fetch('http://127.0.0.1:2083/api/v1/scenario/turn_text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: scenarioSessionId,
          text: userInput
        })
      });
      
      const result = await response.json();
      
      if (result.code === 200 && result.body) {
        // 添加 NPC 回應
        setScenarioMessages(prev => {
          const newMessages = [...prev, { 
            type: 'incoming' as const, 
            sender: '小熊', 
            content: result.body.npc_text 
          }];
          
          // 在更新消息後計算對話次數
          const conversationCount = newMessages.length;
          
          // 成功條件：對話次數達到3次（簡單判斷）
          const isSuccess = conversationCount >= 3;
          console.log('情境挑戰結果判斷:', { 
            conversationCount, 
            turn: result.body.turn || 0, 
            score: result.body.score || 0, 
            isSuccess,
            messages: newMessages.length,
            previousLength: prev.length,
            newMessageAdded: result.body.npc_text
          });
          
          // 詳細調試：顯示所有消息內容
          console.log('所有對話消息:', newMessages.map((msg, index) => ({
            index,
            type: msg.type,
            sender: msg.sender,
            content: msg.content
          })));
          
          if (isSuccess) {
            setCouponChallengeResult('success');
            console.log('🎉 情境挑戰成功！');
          }
          
          return newMessages;
        });
      } else {
        console.error('情境對話回合失敗:', result.message);
        setScenarioMessages(prev => [...prev, { 
          type: 'incoming', 
          sender: '系統', 
          content: '對話處理失敗，請重試' 
        }]);
      }
    } catch (error) {
      console.error('情境對話提交錯誤:', error);
      setScenarioMessages(prev => [...prev, { 
        type: 'incoming', 
        sender: '系統', 
        content: '網路錯誤，請重試' 
      }]);
    } finally {
      setScenarioIsProcessing(false);
    }
  };

  // 處理優惠券挑戰答案提交 (未使用 - 已廢棄)

  // 重置優惠券挑戰狀態
  const resetCouponChallenge = () => {
    const currentPlayer = players.find(p => p.isCurrentPlayer);
    
    // 記錄優惠券挑戰結果（如果有結果的話）
    if (currentPlayer && couponChallengeResult) {
      const challengeTypeName = couponType === 'gas_station' ? '加油站挑戰' : 
                               couponType === 'road_construction' ? '道路施工挑戰' : 
                               couponType === 'property' ? '房地產挑戰' : '優惠券挑戰';
      
      recordGameAction(
        currentPlayer.id,
        currentPlayer.name,
        'challenge',
        `${challengeTypeName}${couponChallengeResult === 'success' ? '成功' : '失敗'}`,
        {
          challengeType: 'coupon',
          couponType: couponType,
          correct: couponChallengeResult === 'success',
          location: currentPlayer.locationName,
          timestamp: new Date().toISOString()
        }
      );
    }
    
    setSelectedCouponChallengeType(null);
    setCouponChallengeQuestion('');
    setCouponPlayerAnswer('');
    setCouponChallengeResult(null);
    setShowCouponChallengePanel(false);
    
    if (currentPlayer) {
      // 加油站挑戰完成後暫停一次
      if (couponType === 'gas_station') {
        setPlayerSkipped(true);
        recordGameAction(
          currentPlayer.id,
          currentPlayer.name,
          'move',
          `${currentPlayer.name} 完成加油站挑戰，暫停一次`,
          { location: currentPlayer.location, skipped: true, couponType }
        );
      }
      // 道路施工挑戰完成後不需要額外設置暫停（已在挑戰結果中處理）
    }
    
    // 優惠券挑戰完成後自動切換到下一位玩家
    switchToNextPlayer();
  };

  // 處理台語大單挑 - 直接使用遊戲主題
  const handleWordChallenge = () => {
    setShowCouponPanel(false);
    setIsDrawingCard(true);
    
    // 抽卡片動畫效果
    setTimeout(async () => {
      try {
        // 根據遊戲主題獲取對應的分類 ID
        const categoryId = gameTheme === 'traffic' 
          ? '6894ec12e4c25617b65cd248' // 交通工具分類 ID
          : gameTheme === 'occupation' 
          ? '6894ec12e4c25617b65cd25c' // 職業與社會角色分類 ID
          : '6894ec12e4c25617b65cd248'; // 預設使用交通工具
        
        // 使用原本的 API 獲取單字卡片
        const response = await fetch(`http://127.0.0.1:2083/api/v1/vocab-cards/by-category/${categoryId}`);
        const result = await response.json();
        
        if (result.code === 200 && result.body && result.body.length > 0) {
          const randomIndex = Math.floor(Math.random() * result.body.length);
          const selectedCard = result.body[randomIndex];
          
          // 獲取對應的圖片
          try {
            const imageResponse = await fetch(`http://127.0.0.1:2083/api/v1/vocabulary-pictures/by-card/${selectedCard._id}`);
            const imageResult = await imageResponse.json();
            
            if (imageResult.code === 200 && imageResult.body) {
              selectedCard.image = imageResult.body.imageUrl;
              console.log('獲取圖片成功:', imageResult.body.imageUrl);
            } else {
              console.log('該單字卡片沒有對應的圖片');
              selectedCard.image = null;
            }
          } catch (imageError) {
            console.error('獲取圖片失敗:', imageError);
            selectedCard.image = null;
          }
          
      console.log('設置新的單字卡片:', selectedCard);
      setCurrentWordCard(selectedCard);
      setIsDrawingCard(false);
      setShowWordCard(true);
      
      // 記錄遊戲動作
      const currentPlayer = players.find(p => p.isCurrentPlayer);
      if (currentPlayer) {
        recordGameAction(
          currentPlayer.id,
          currentPlayer.name,
          'challenge',
              `抽取單字卡片: ${selectedCard.han}`,
              { cardId: selectedCard._id, category: selectedCard.categoryId, theme: gameTheme }
            );
          }
        } else {
          console.error('沒有可用的單字卡片！', result);
          setIsDrawingCard(false);
        }
      } catch (error) {
        console.error('獲取單字卡片失敗:', error);
        setIsDrawingCard(false);
      }
    }, 2000); // 2秒抽卡片動畫
  };

  // 關閉單字卡片
  const closeWordCard = () => {
    console.log('closeWordCard 被調用');
    setShowWordCard(false);
    setCurrentWordCard(null);
    // 重置 STT 相關狀態
    setWordCardSTTResult('');
    setWordCardChallengeResult(null);
    setIsRecording(false);
    setIsProcessing(false);
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    console.log('準備調用 switchToNextPlayer');
    switchToNextPlayer();
  };


  // 如果地圖還沒載入，顯示載入畫面
  if (!isMapLoaded) {
    return (
      <div className="monopoly-container">
        <div className="loading-overlay">
          <div className="loading-content">
            <h2>載入遊戲地圖中...</h2>
            <div className="loading-spinner"></div>
            <p>正在從伺服器獲取地圖資料</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="monopoly-container">
      {/* 主題選擇覆蓋層 */}
      {showThemeSelection && (
        <div className="theme-selection-overlay">
          <div className="theme-selection-panel">
            <h2 className="theme-selection-title">選擇遊戲主題</h2>
            
            <div className="theme-options">
              {!themesLoaded ? (
                <div className="loading-themes">載入主題中...</div>
              ) : (
                availableThemes.map((theme) => (
              <button 
                    key={theme.id}
                    className={`theme-option-btn ${selectedTheme === theme.key ? 'selected' : ''}`}
                onClick={() => {
                      setSelectedTheme(theme.key);
                  audioManager.play(AudioType.THEME_SELECTION, 0.3);
                }}
              >
                    <img 
                      src={theme.key === 'traffic' ? "../src/assets/誰是交通王.png" : "../src/assets/植物百寶袋.png"} 
                      alt={theme.name} 
                    />
                    <span>{theme.key === 'traffic' ? '誰是交通王' : '職涯大冒險'}</span>
              </button>
                ))
              )}
            </div>
            
            <button 
              className="start-game-button"
              onClick={() => {
                if (selectedTheme) {
                  setGameTheme(selectedTheme);
                  setShowThemeSelection(false);
                  audioManager.play(AudioType.GAME_START, 0.5);
                }
              }}
              disabled={!selectedTheme}
            >
              開始遊戲
            </button>
          </div>
        </div>
      )}

      {/* 路徑選擇覆蓋層 */}
      {showPathSelection && pathOptions && (
        <div className="path-selection-overlay">
          <div className="path-selection-panel">
            <h2 className="path-selection-title">選擇移動路徑</h2>
            <p className="path-selection-subtitle">17挑戰成功！你可以選擇移動路徑：</p>
            
            <div className="path-options">
              <button 
                className="path-option-btn normal-path"
                onClick={() => handlePathSelection('normal')}
              >
                <div className="path-info">
                  <h3>正常路徑</h3>
                  <p>移動到：{pathOptions.normal.position_info?.name || pathOptions.normal.new_position}</p>
                </div>
              </button>
              
              <button 
                className="path-option-btn d5-path"
                onClick={() => handlePathSelection('alternative')}
              >
                <div className="path-info">
                  <h3>D5路徑 🎯</h3>
                  <p>移動到：{pathOptions.alternative.new_position}</p>
                  <span className="special-path-badge">特殊路徑</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 頂部導航欄 */}
      <div className="top-bar">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => {
            audioManager.play(AudioType.THEME_SELECTION, 0.3);
            navigate("/Learn");
          }}
        >
          <img src={BackIcon} alt="返回" />
        </button>
        <div className="game-title">
          <span className="controller-icon">🎮</span>
          <span className="title-text">
            遊戲中 - {currentPlayer ? `${currentPlayer.name} 的回合` : '等待中'}
          </span>
        </div>
        <div className="room-info">
          {/* 音效控制組件 */}
          <AudioControls />
          <button 
            className="history-button"
            onClick={() => {
              audioManager.play(AudioType.THEME_SELECTION, 0.3);
              setShowGameHistory(true);
            }}
            title="查看遊戲歷程"
          >
            📊 歷程
          </button>
          <button 
            className="switch-player-button"
            onClick={() => {
              audioManager.play(AudioType.THEME_SELECTION, 0.3);
              switchToNextPlayer();
            }}
            title="手動切換玩家"
          >
            🔄 換人
          </button>
          <span className="room-label">房號：</span>
          <div className="room-number">1234</div>
        </div>
      </div>

      {/* 玩家頭像槽位 */}
      <div className="player-slots">
        {players.map((player) => (
          <div
            key={player.id}
            className={`player-slot ${player.isCurrentPlayer ? 'current-player' : ''}`}
          >
            <div className="player-avatar">
              {player.avatarImage ? (
                <img
                  src={player.avatarImage}
                  alt={player.name}
                  className="player-avatar-img"
                />
              ) : (
                <span>{player.avatar}</span>
              )}
            </div>
            <div className="player-label">玩家{player.id}</div>
          </div>
        ))}
      </div>

      {/* 玩家資訊面板和挑戰面板 */}
      {currentPlayer && (
        <div className="player-info-container">
          <div className="player-info-panel">
            <div className="player-header">
              <div className="player-avatar-large">
                {currentPlayer.avatarImage ? (
                  <img
                    src={currentPlayer.avatarImage}
                    alt={currentPlayer.name}
                    className="player-avatar-large-img"
                  />
                ) : (
                  <span>{currentPlayer.avatar}</span>
                )}
              </div>
              <div className="player-name">玩家{currentPlayer.id}:{currentPlayer.name}</div>
            </div>

            <div className="player-details">
              <div className="detail-row">
                <span className="detail-label">經過起點:</span>
                <div className="detail-value">
                  {playersPassedStart[currentPlayer.id] || 0} / 3
                </div>
              </div>
              <div className="detail-row">
                <span className="detail-label">狀態:</span>
                <div className="detail-value">
                  {roadConstructionSkip[currentPlayer.id] ? '暫停一回合' : currentPlayer.status}
                </div>
              </div>
              <div className="detail-row">
                <span className="detail-label">位置:</span>
                <div className="detail-value">{currentPlayer.locationName}</div>
              </div>
              <div className="detail-row">
                <span className="detail-label">捷徑:</span>
                <div className="detail-value">
                  {((currentPlayer.locationName >= '37' && currentPlayer.locationName <= '42') || 
                    (currentPlayer.locationName >= 'D0' && currentPlayer.locationName <= 'D5') || 
                    playerShortcutPrivileges[currentPlayer.id]?.nextMoveToShortcut) ? '是' : '否'}
                </div>
              </div>
             
            </div>

            <div className="player-record">
              <span className="record-label">紀錄:</span>
              <div className="record-list">
                {currentPlayer.records.slice(-3).reverse().map((record) => (
                  <div key={record.id} className="record-item">
                    <div className="record-content">
                      {record.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="player-actions">
             
              <button 
                className="bankruptcy-button"
                onClick={handleBankruptcy}
              >
                破產
              </button>
            </div>
          </div>

          {/* 挑戰卡側邊面板 */}
          {showChallengePanel && currentChallenge && (
            <div className="challenge-panel-side">
              <div className="challenge-header">
                <h2 className="challenge-title">
                  {currentChallenge?.type === 'train' || currentChallenge?.type === 'transport' ? '火車挑戰' : 
                   currentChallenge?.type === 'vocabulary' ? '單字挑戰' : 
                   currentChallenge?.type === 'story' ? '情境挑戰' : 
                   currentChallenge?.type === 'action' ? '動作挑戰' : 
                   '挑戰'}
                </h2>
             
              </div>
              <div className="challenge-content">
                <div className="challenge-question">
                  {!selectedCouponChallengeType ? (
                    <div className="question-bubble">
                      正在準備挑戰...
                    </div>
                  ) : selectedCouponChallengeType === 'scenario' ? (
                    scenarioMessages.length > 0 ? (
                      <div className="scenario-messages-container">
                        {scenarioMessages.map((msg, index) => (
                          <div key={index} className={`scenario-message-bubble ${msg.type}`}>
                            <span className="message-content">{msg.content}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                      <div className="question-bubble">
                        正在準備挑戰對話...
                      </div>
                    )
                  ) : (
                    // 傳統單字挑戰模式
                    <div className="question-bubble">
                      {challengeQuestion}
                    </div>
                  )}
                  
                  {couponChallengeResult && (
                    <>
                      <div className={`response-bubble ${couponChallengeResult}`}>
                        {couponChallengeResult === 'success' ? '🎉 挑戰成功！' : '❌ 挑戰失敗！'}
                      </div>
                      {/* 火車挑戰特殊獎勵信息 */}
                      {currentChallenge?.type === 'train' || currentChallenge?.type === 'transport' ? (
                        <div className={`reward-bubble ${couponChallengeResult}`}>
                          {couponChallengeResult === 'success' ? '🚂 火車挑戰成功！下次按骰子將在捷徑路線移動！' : '🚂 火車挑戰失敗！本次不能使用捷徑'}
                        </div>
                      ) : (
                        <div className={`reward-bubble ${couponChallengeResult}`}>
                          {couponChallengeResult === 'success' ? '🎁 請抽取一張獎勵卡' : '⚠️ 請抽取一張懲罰卡'}
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="challenge-buttons">
                  {!selectedCouponChallengeType ? (
                    <div className="challenge-actions">
                      <button 
                        className="challenge-complete-btn" 
                        onClick={handleChallengeTypeSelect}
                      >
                        開始挑戰
                      </button>
                    </div>
                  ) : (
                    <div className="challenge-actions">
                      {couponChallengeResult && (
                        <button className="challenge-complete-btn" onClick={() => {
                          audioManager.play(AudioType.THEME_SELECTION, 0.3);
                          resetChallenge();
                        }}>
                          完成挑戰
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {selectedCouponChallengeType && !couponChallengeResult && (
                  selectedCouponChallengeType === 'scenario' ? (
                    // 挑戰對話模式 - 使用情境挑戰的麥克風樣式
                  <div className="voice-input">
                      <div 
                        className="microphone-icon"
                        onClick={() => {
                          if (isRecording) {
                            stopRecording();
                          } else {
                            startRecording();
                          }
                        }}
                        style={{ 
                          cursor: 'pointer',
                          opacity: isProcessing ? 0.5 : 1,
                          backgroundColor: isRecording ? '#ff6b6b' : '#D2B48C'
                        }}
                      >
                        <img 
                          src="/src/assets/麥克風.png" 
                          alt="麥克風" 
                      />
                    </div>
                    </div>
                  ) : (
                    // 傳統單字挑戰模式
                    <div className="word-challenge-voice-mode">
                      {/* 語音輸入提示 */}
                      <div className="voice-input-hint">
                        <div className="question-bubble">
                          請點擊麥克風，用台語說出答案！
                        </div>
                      </div>
                      
                      {/* 語音辨識結果顯示 */}
                      {playerAnswer && (
                        <div className="voice-recognition-result">
                          <div className="question-bubble">
                            你說的台語：{playerAnswer}
                    </div>
                  </div>
                )}
                      
                      {/* 麥克風按鈕 */}
                      <div className="microphone-icon" onClick={isRecording ? stopRecording : startRecording}>
                        <img 
                          src="/src/assets/麥克風.png" 
                          alt="麥克風" 
                          style={{
                            backgroundColor: isRecording ? '#ff6b6b' : '#D2B48C',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            padding: '8px'
                          }}
                        />
              </div>
                      
                      {/* 完成按鈕 - 只有語音辨識結果後才能點擊 */}
                      {playerAnswer && (
                        <button 
                          className="challenge-complete-btn" 
                          onClick={handleAnswerSubmit}
                          style={{ marginTop: '10px' }}
                        >
                          確認答案
                        </button>
                      )}
            </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 優惠券挑戰面板 */}
      {showCouponChallengePanel && (
        <div className="challenge-panel-side">
          <div className="challenge-header">
            <h2 className="challenge-title">情境挑戰</h2>
          </div>
          <div className="challenge-content">
            <div className="challenge-question">
              {!selectedCouponChallengeType ? (
                <div className="question-bubble">
                  正在準備挑戰...
                </div>
              ) : selectedCouponChallengeType === 'scenario' ? (
                scenarioMessages.length > 0 ? (
                  <div className="scenario-messages-container">
                    {scenarioMessages.map((msg, index) => (
                      <div key={index} className={`scenario-message-bubble ${msg.type}`}>
                        <span className="message-content">{msg.content}</span>
                      </div>
                    ))}
                </div>
                ) : (
                  <div className="question-bubble">
                    正在準備情境對話...
                  </div>
                )
              ) : (
                <div className="question-bubble">
                  {couponChallengeQuestion}
                </div>
              )}
              
              {couponChallengeResult && (
                <>
                  <div className={`response-bubble ${couponChallengeResult}`}>
                    {couponChallengeResult === 'success' ? '🎉 挑戰成功！' : '❌ 挑戰失敗！'}
                  </div>
                  <div className={`reward-bubble ${couponChallengeResult}`}>
                    {couponType === 'road_construction' ? (
                      couponChallengeResult === 'success' ? '✅ 免於暫停一回合' : '⏸️ 暫停一回合'
                    ) : couponType === 'gas_station' ? (
                      couponChallengeResult === 'success' ? '⛽ 免費加油一次' : '💰 挑戰失敗請支付一百元'
                    ) : (
                      couponChallengeResult === 'success' ? '🏠 房地產減免100元' : '💰 挑戰失敗請付原價'
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div className="challenge-buttons">
              {!selectedCouponChallengeType ? (
                <div className="challenge-actions">
                  <button 
                    className="challenge-complete-btn" 
                    onClick={handleCouponChallengeTypeSelect}
                  >
                    開始挑戰
                  </button>
                </div>
              ) : (
                <div className="challenge-actions">
                  {couponChallengeResult && (
                        <button className="challenge-complete-btn" onClick={() => {
                          audioManager.play(AudioType.THEME_SELECTION, 0.3);
                          resetCouponChallenge();
                        }}>
                          完成挑戰
                        </button>
                  )}
                </div>
              )}
            </div>
            
            {selectedCouponChallengeType && !couponChallengeResult && (
              <div className="voice-input">
                <div 
                  className="microphone-icon"
                  onClick={() => {
                    if (isRecording) {
                      stopRecording();
                    } else {
                      startRecording();
                    }
                  }}
                  style={{ 
                    cursor: 'pointer',
                    opacity: isProcessing ? 0.5 : 1,
                    backgroundColor: isRecording ? '#ff6b6b' : '#D2B48C'
                  }}
                >
                  <img src="/src/assets/麥克風.png" alt="麥克風" />
                  {isRecording && <div className="recording-indicator">🔴</div>}
                  {isProcessing && <div className="processing-indicator">⏳</div>}
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* 抽卡片動畫 */}
      {isDrawingCard && (
        <div className="card-drawing-overlay">
          <div className="card-drawing-animation">
            <div className="drawing-cards">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="floating-card" style={{
                  animationDelay: `${index * 0.1}s`,
                  left: `${20 + index * 10}%`,
                  top: `${30 + (index % 2) * 20}%`
                }}>
                  <div className="card-back">🎴</div>
                </div>
              ))}
            </div>
            <div className="drawing-text">正在抽取卡片...</div>
          </div>
        </div>
      )}

      {/* 單字卡片顯示 */}
      {showWordCard && currentWordCard && (
        <div className="word-card-overlay">
          <div className="word-card">
            <div className="word-card-content">
              <div className="word-title">{currentWordCard.han}</div>
              <div className="word-pinyin">{currentWordCard.tl}</div>
              <div className="word-meaning">{currentWordCard.ch}</div>
              
              <div className="word-illustration">
                {currentWordCard.image ? (
                <img 
                  src={currentWordCard.image} 
                    alt={currentWordCard.han}
                  className="word-image"
                  onError={(e) => {
                    // 如果圖片載入失敗，顯示佔位符
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'flex';
                    }
                  }}
                />
                ) : null}
                <div className="illustration-placeholder" style={{display: currentWordCard.image ? 'none' : 'flex'}}>
                  <div className="illustration-text">🎨 {currentWordCard.han}</div>
                </div>
              </div>
              
              <div className="word-microphone">
                <div 
                  className="microphone-icon-large"
                  onClick={() => {
                    if (isRecording) {
                      stopRecording();
                    } else {
                      startRecording();
                    }
                  }}
                  style={{ 
                    cursor: 'pointer',
                    opacity: isProcessing ? 0.5 : 1,
                    backgroundColor: isRecording ? '#ff6b6b' : '#8B4513'
                  }}
                >
                  <img src="/src/assets/麥克風.png" alt="麥克風" />
                  {isRecording && <div className="recording-indicator">🔴</div>}
                  {isProcessing && <div className="processing-indicator">⏳</div>}
                </div>
              </div>
              
              {/* 顯示辨識結果 - 移到麥克風下方 */}
              {wordCardSTTResult && (
                <div className="stt-result">
                  <div className="stt-label">辨識結果:</div>
                  <div className="stt-text">{wordCardSTTResult}</div>
                </div>
              )}
              
              {/* 顯示挑戰結果 */}
              {wordCardChallengeResult && (
                <div className={`challenge-result ${wordCardChallengeResult}`}>
                  {wordCardChallengeResult === 'success' ? '挑戰成功！' : '挑戰失敗！'}
                </div>
              )}
              
              {/* 提示文字 */}
              {!wordCardSTTResult && (
                <div className="completion-hint">
                  請先點擊麥克風並說出單字
                </div>
              )}
              
              <button 
                className="close-card-button" 
                disabled={!wordCardSTTResult}
                onClick={() => {
                audioManager.play(AudioType.THEME_SELECTION, 0.3);
                closeWordCard();
                }}
                style={{
                  opacity: !wordCardSTTResult ? 0.5 : 1,
                  cursor: !wordCardSTTResult ? 'not-allowed' : 'pointer'
                }}
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 骰子區域 */}
      <div className="dice-area">
        <div className="dice-container">
          {diceValues.map((value, index) => (
            <button 
              key={index} 
              className="dice-button"
              onClick={() => handleDiceClick(value)}
              title={`擲出 ${value} 點`}
            >
              <div className="dice-face">
                {Array.from({ length: value }, (_, i) => (
                  <div key={i} className="dice-dot"></div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 遊戲結束覆蓋層 */}
      {showGameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2 className="game-over-title">
              {winner ? `${winner.name} 獲勝！` : '遊戲結束'}
            </h2>
            {winner && (
              <p className="winner-message">
                {winner.name} 經過起點3次，恭喜獲勝！🎉
              </p>
            )}
            <button 
              className="close-button"
              onClick={() => {
                audioManager.play(AudioType.THEME_SELECTION, 0.3);
                setShowGameOver(false);
                navigate('/Scoresummary', { 
                  state: { 
                    players: players,
                    gameId: gameHistory.gameId,
                    gameHistory: gameHistory
                  } 
                });
              }}
            >
              成績總結
            </button>
          </div>
        </div>
      )}

      {/* 位置詳情覆蓋層 */}
      {showLocationDetail && currentLocationDetail && (
        <div className="location-detail-overlay">
          <div className="location-detail-content">
            <div className="location-header">
              <h2 className="location-title">{currentLocationDetail.name}</h2>
              <div className="header-right">
                <button 
                  className="close-button"
                  onClick={() => {
                    audioManager.play(AudioType.THEME_SELECTION, 0.3);
                    setShowLocationDetail(false);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="location-info">
              <div className="location-type">{currentLocationDetail.type}</div>
              <div className="location-description">{currentLocationDetail.description}</div>
              
              {/* 跳過按鈕 - 所有格子都有 */}
              <button 
                className="skip-button"
                onClick={() => {
                  audioManager.play(AudioType.THEME_SELECTION, 0.3);
                  setShowLocationDetail(false);
                  
                  // 直接切換到下一個玩家（機會格不會自動切換，所以這裡只需要正常切換）
                  switchToNextPlayer();
                }}
              >
                跳過 (換下一位玩家)
              </button>
              
              
              {currentLocationDetail.challenge && (
                <div className="challenge-details">
                  <div className="challenge-type">{currentLocationDetail.challenge.type}</div>
                  <div className="challenge-title">{currentLocationDetail.challenge.title}</div>
                  <div className="challenge-content">{currentLocationDetail.challenge.content}</div>
                  <div className="challenge-reward">{currentLocationDetail.challenge.reward}</div>
                  <button 
                    className="complete-challenge-button"
                    onClick={() => {
                      audioManager.play(AudioType.THEME_SELECTION, 0.3);
                      if (currentLocationDetail.challenge) {
                        handleChallengeComplete(currentLocationDetail.challenge.type, currentLocationDetail.challenge.reward);
                        setShowLocationDetail(false);
                        // 自動切換到下一玩家
                        setTimeout(() => {
                          switchToNextPlayer();
                        }, 500);
                      }
                    }}
                  >
                    完成挑戰
                  </button>
                </div>
              )}
              
              {(currentLocationDetail.chance || currentLocationDetail.type === 'reward') && (
                <div className="chance-details">
                  <div className="chance-type">{currentLocationDetail.chance?.type || currentLocationDetail.type}</div>
                  <div className="chance-title">機會卡</div>
                  <div className="chance-content">請抽取一張實體機會卡</div>
                </div>
              )}
              
              {currentLocationDetail.shortcut && (
                <div className="shortcut-details">
                  <div className="shortcut-description">{currentLocationDetail.shortcut.description}</div>
                  <button 
                    className="use-shortcut-button"
                    onClick={() => {
                      audioManager.play(AudioType.THEME_SELECTION, 0.3);
                      setShowLocationDetail(false);
                      // 立即切換到下一玩家
                      switchToNextPlayer();
                    }}
                  >
                    使用捷徑
                  </button>
                </div>
              )}
              
              {/* 對於沒有特定操作的格子（START、GO、特殊格子等）顯示完成按鈕 */}
              {currentLocationDetail.type === 'start' || 
               currentLocationDetail.type === 'go' || 
               currentLocationDetail.type === 'special' && !currentLocationDetail.challenge && !currentLocationDetail.chance && !currentLocationDetail.shortcut ? (
                <div className="completion-details">
                  <div className="completion-message">
                    {currentLocationDetail.type === 'start' ? '歡迎來到起始點！' :
                     currentLocationDetail.type === 'go' ? '通過起點，獲得獎勵！' :
                     '特殊格子效果'}
                  </div>
                  <button 
                    className="complete-button"
                    onClick={() => {
                      audioManager.play(AudioType.THEME_SELECTION, 0.3);
                      setShowLocationDetail(false);
                      // 立即切換到下一玩家
                      switchToNextPlayer();
                    }}
                  >
                    完成
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 優惠券視窗 */}
      {showCouponPanel && (
        <div className="coupon-overlay">
          <div className="coupon-panel">
            <div className="coupon-header">
              <h2 className="coupon-title">優惠券</h2>
              <button 
                className="close-button"
                onClick={() => {
                  audioManager.play(AudioType.THEME_SELECTION, 0.3);
                  setShowCouponPanel(false);
                }}
              >
                ✕
              </button>
            </div>
            <div className="coupon-buttons">
              {/* 地產格子顯示三個選項 */}
              {couponType === 'property' && (
                <>
                  <button 
                    className="coupon-button taiwanese-challenge"
                    onClick={() => {
                      audioManager.play(AudioType.THEME_SELECTION, 0.3);
                      handleWordChallenge();
                    }}
                  >
                    台語大單挑
                  </button>
                  <button 
                    className="coupon-button scenario-challenge"
                    onClick={() => {
                      audioManager.play(AudioType.THEME_SELECTION, 0.3);
                      setShowCouponPanel(false);
                      setShowCouponChallengePanel(true);
                    }}
                  >
                    情境挑戰
                  </button>
                  <button 
                    className="coupon-button no-coupon"
                    onClick={() => {
                      audioManager.play(AudioType.THEME_SELECTION, 0.3);
                      setShowCouponPanel(false);
                      switchToNextPlayer();
                    }}
                  >
                    不使用優惠
                  </button>
                </>
              )}
              
              {/* 加油站顯示三個選項 */}
              {couponType === 'gas_station' && (
                <>
                  <button 
                    className="coupon-button taiwanese-challenge"
                    onClick={() => {
                      audioManager.play(AudioType.THEME_SELECTION, 0.3);
                      handleWordChallenge();
                    }}
                  >
                    台語大單挑
                  </button>
                  <button 
                    className="coupon-button scenario-challenge"
                    onClick={() => {
                      audioManager.play(AudioType.THEME_SELECTION, 0.3);
                      setShowCouponPanel(false);
                      setShowCouponChallengePanel(true);
                    }}
                  >
                    情境挑戰
                  </button>
                  <button 
                    className="coupon-button no-coupon"
                    onClick={() => {
                      audioManager.play(AudioType.THEME_SELECTION, 0.3);
                      setShowCouponPanel(false);
                      const currentPlayer = players.find(p => p.isCurrentPlayer);
                      if (currentPlayer) {
                        // 加油站使用原有的暫停邏輯
                        setPlayerSkipped(true);
                        recordGameAction(
                          currentPlayer.id,
                          currentPlayer.name,
                          'move',
                          `${currentPlayer.name} 選擇不使用優惠，暫停一次`,
                          { location: currentPlayer.location, skipped: true, couponType }
                        );
                      }
                      switchToNextPlayer();
                    }}
                  >
                    不使用優惠
                  </button>
                </>
              )}
              
              {/* 道路施工顯示兩個選項 */}
              {couponType === 'road_construction' && (
                <>
                  <button 
                    className="coupon-button scenario-challenge"
                    onClick={() => {
                      audioManager.play(AudioType.THEME_SELECTION, 0.3);
                      setShowCouponPanel(false);
                      setShowCouponChallengePanel(true);
                    }}
                  >
                    情境挑戰
                  </button>
                  <button 
                    className="coupon-button no-coupon"
                    onClick={() => {
                      audioManager.play(AudioType.THEME_SELECTION, 0.3);
                      setShowCouponPanel(false);
                      const currentPlayer = players.find(p => p.isCurrentPlayer);
                      if (currentPlayer) {
                        // 道路施工專用暫停邏輯
                          setRoadConstructionSkip(prev => ({
                            ...prev,
                            [currentPlayer.id]: true
                          }));
                          recordGameAction(
                            currentPlayer.id,
                            currentPlayer.name,
                            'move',
                            `${currentPlayer.name} 在道路施工選擇不使用優惠券，下一次輪到時暫停一回合`,
                            { location: currentPlayer.location, skipped: true, couponType, roadConstructionSkip: true }
                          );
                      }
                      switchToNextPlayer();
                    }}
                  >
                    不使用優惠
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 暫停提示視窗 */}
      {showSkipAlert && (
        <div className="skip-alert-overlay">
          <div className="skip-alert-content">
            <div className="skip-icon">⏸️</div>
            <h2 className="skip-title">暫停提示</h2>
            <p className="skip-message">{skipAlertMessage}</p>
            <button className="skip-close-button" onClick={() => {
              audioManager.play(AudioType.THEME_SELECTION, 0.3);
              setShowSkipAlert(false);
            }}>
              了解
            </button>
          </div>
        </div>
      )}

      {/* 經過起點慶祝覆蓋層 */}
      {showPassedStartCelebration && (
        <div className="round-complete-overlay">
          <div className="round-complete-content">
            <div className="celebration-icon">🎉</div>
            <h2 className="celebration-title">經過起點！</h2>
            <p className="celebration-message">{passedStartMessage}</p>
            <p className="celebration-title">獎勵500元</p>
            <div className="celebration-effects">
              <div className="confetti"></div>
              <div className="confetti"></div>
              <div className="confetti"></div>
            </div>
          </div>
        </div>
      )}

      {/* 遊戲歷程覆蓋層 */}
      {showGameHistory && (
        <div className="game-history-overlay">
          <div className="game-history-content">
            <div className="history-header">
              <h2 className="history-title">遊戲歷程</h2>
              <button 
                className="close-button"
                onClick={() => {
                  audioManager.play(AudioType.THEME_SELECTION, 0.3);
                  setShowGameHistory(false);
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="history-stats">
              <div className="stat-item">
                <span className="stat-label">遊戲時間：</span>
                <span className="stat-value">
                  {Math.floor((Date.now() - gameHistory.startTime.getTime()) / 60000)} 分鐘
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">總動作數：</span>
                <span className="stat-value">{gameHistory.actions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">參與玩家：</span>
                <span className="stat-value">{players.length}</span>
              </div>
            </div>

            <div className="history-actions">
              <h3 className="actions-title">動作記錄</h3>
              <div className="actions-list">
                {gameHistory.actions.length === 0 ? (
                  <div className="no-actions">尚無動作記錄</div>
                ) : (
                  gameHistory.actions.map((action) => (
                    <div key={action.id} className="action-item">
                      <div className="action-time">
                        {action.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="action-content">
                        <div className="action-player">{action.playerName}</div>
                        <div className="action-description">{action.description}</div>
                        <div className="action-type">{action.actionType}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Monopoly;