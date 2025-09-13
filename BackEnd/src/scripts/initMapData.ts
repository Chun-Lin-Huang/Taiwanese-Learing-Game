// BackEnd/src/scripts/initMapData.ts
import { MapBoardModel } from '../orm/schemas/mapBoardSchemas';
import { MapNodeModel } from '../orm/schemas/mapNodeSchemas';
import { MapEdgeModel } from '../orm/schemas/mapEdgeSchemas';
import { connect } from 'mongoose';
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

// 初始化地圖資料
async function initMapData() {
  try {
    // 連接到資料庫 - 使用與後端相同的配置
    const mongoUrl = `mongodb://${process.env.DBUSER}:${encodeURIComponent(process.env.DBPASSWORD!)}@${process.env.DBHOST}:${process.env.DBPORT}/${process.env.DBNAME}`;
    console.log('連接資料庫:', mongoUrl.replace(process.env.DBPASSWORD!, '***'));
    await connect(mongoUrl);
    console.log('已連接到資料庫');

    // 1. 使用現有的地圖板塊
    const boardId = '68c1d61f0b2c1d8e238edceb';
    let board = await MapBoardModel.findById(boardId);
    
    if (board) {
      console.log('使用現有的地圖板塊:', board._id);
    } else {
      console.error('找不到指定的地圖板塊:', boardId);
      return;
    }

    // 2. 創建節點資料
    const nodesData = [
      // 起始點
      { node_id: "S0", board_id: board._id.toString(), name: "START", type: "start", description: "遊戲起始點" },
      
      // 外圈節點 (1-36)
      { node_id: "01", board_id: board._id.toString(), name: "來學單字", type: "challenge", description: "單字學習挑戰", 
        challenge: { type: "vocabulary", title: "單字挑戰", content: "學習新的台語單字", reward: "抽取單字卡片" }},
      { node_id: "02", board_id: board._id.toString(), name: "文化路", type: "property", description: "文化地產" },
      { node_id: "03", board_id: board._id.toString(), name: "光明大道", type: "property", description: "光明地產" },
      { node_id: "04", board_id: board._id.toString(), name: "致用街", type: "property", description: "致用地產" },
      { node_id: "05", board_id: board._id.toString(), name: "凱旋大道", type: "property", description: "凱旋地產" },
      { node_id: "06", board_id: board._id.toString(), name: "挑戰", type: "challenge", description: "情境挑戰", 
        challenge: { type: "story", title: "情境挑戰", content: "完成故事情境挑戰", reward: "抽取情境卡片" }},
      { node_id: "07", board_id: board._id.toString(), name: "四維路", type: "property", description: "四維地產" },
      { node_id: "08", board_id: board._id.toString(), name: "機會卡", type: "chance", description: "機會卡", 
        chance: { type: "positive", title: "機會卡", content: "獲得意外獎勵", effect: "+150分" }},
      { node_id: "09", board_id: board._id.toString(), name: "加油站", type: "special", description: "支付100元", 
        challenge: { type: "action", title: "加油站", content: "支付100元過路費", reward: "-100分" }},
      
      // 底部 (10-18)
      { node_id: "10", board_id: board._id.toString(), name: "光復路", type: "property", description: "光復地產" },
      { node_id: "11", board_id: board._id.toString(), name: "勝利路", type: "property", description: "勝利地產" },
      { node_id: "12", board_id: board._id.toString(), name: "機會卡", type: "chance", description: "機會卡", 
        chance: { type: "positive", title: "機會卡", content: "獲得意外獎勵", effect: "+150分" }},
      { node_id: "13", board_id: board._id.toString(), name: "學園路", type: "property", description: "學園地產" },
      { node_id: "14", board_id: board._id.toString(), name: "火車站前街", type: "property", description: "火車站地產" },
      { node_id: "15", board_id: board._id.toString(), name: "來學單字", type: "challenge", description: "單字學習挑戰", 
        challenge: { type: "vocabulary", title: "單字挑戰", content: "學習新的台語單字", reward: "抽取單字卡片" }},
      { node_id: "16", board_id: board._id.toString(), name: "總站廣場", type: "property", description: "總站地產" },
      { node_id: "17", board_id: board._id.toString(), name: "和平路", type: "property", description: "和平地產" },
      { node_id: "18", board_id: board._id.toString(), name: "火車挑戰", type: "challenge", description: "完成挑戰可以搭火車", 
        challenge: { type: "train", title: "火車挑戰", content: "完成挑戰可以搭火車", reward: "免費移動" }},
      
      // 左側 (19-27)
      { node_id: "19", board_id: board._id.toString(), name: "書香街", type: "property", description: "書香地產" },
      { node_id: "20", board_id: board._id.toString(), name: "港口路", type: "property", description: "港口地產" },
      { node_id: "21", board_id: board._id.toString(), name: "中正街", type: "property", description: "中正地產" },
      { node_id: "22", board_id: board._id.toString(), name: "機會卡", type: "chance", description: "機會卡", 
        chance: { type: "neutral", title: "機會卡", content: "隨機事件", effect: "隨機獎勵/懲罰" }},
      { node_id: "23", board_id: board._id.toString(), name: "健康路", type: "property", description: "健康地產" },
      { node_id: "24", board_id: board._id.toString(), name: "海山街", type: "property", description: "海山地產" },
      { node_id: "25", board_id: board._id.toString(), name: "來學單字", type: "challenge", description: "單字學習挑戰", 
        challenge: { type: "vocabulary", title: "單字挑戰", content: "學習新的台語單字", reward: "抽取單字卡片" }},
      { node_id: "26", board_id: board._id.toString(), name: "二聖路", type: "property", description: "二聖地產" },
      { node_id: "27", board_id: board._id.toString(), name: "道路施工", type: "special", description: "道路施工，暫時停用", 
        challenge: { type: "action", title: "道路施工", content: "道路施工，停一回合", reward: "停一回合" }},
      
      // 頂部 (28-36)
      { node_id: "28", board_id: board._id.toString(), name: "椰林大道", type: "property", description: "椰林地產" },
      { node_id: "29", board_id: board._id.toString(), name: "六合街", type: "property", description: "六合地產" },
      { node_id: "30", board_id: board._id.toString(), name: "挑戰", type: "challenge", description: "情境挑戰", 
        challenge: { type: "story", title: "情境挑戰", content: "完成故事情境挑戰", reward: "+200分" }},
      { node_id: "31", board_id: board._id.toString(), name: "中山街", type: "property", description: "中山地產" },
      { node_id: "32", board_id: board._id.toString(), name: "八德路", type: "property", description: "八德地產" },
      { node_id: "33", board_id: board._id.toString(), name: "飛機場路", type: "property", description: "飛機場地產" },
      { node_id: "34", board_id: board._id.toString(), name: "機會卡", type: "chance", description: "機會卡", 
        chance: { type: "positive", title: "機會卡", content: "獲得意外獎勵", effect: "+150分" }},
      { node_id: "35", board_id: board._id.toString(), name: "成功街", type: "property", description: "成功地產" },
      { node_id: "36", board_id: board._id.toString(), name: "建國路", type: "property", description: "建國地產" },
      
      // 內圈捷徑 (37-42)
      { node_id: "37", board_id: board._id.toString(), name: "來學單字", type: "challenge", description: "捷徑單字挑戰", 
        challenge: { type: "vocabulary", title: "單字挑戰", content: "學習新的台語單字", reward: "抽取單字卡片" }},
      { node_id: "38", board_id: board._id.toString(), name: "建國路", type: "property", description: "建國地產" },
      { node_id: "39", board_id: board._id.toString(), name: "挑戰", type: "challenge", description: "捷徑挑戰", 
        challenge: { type: "action", title: "捷徑挑戰", content: "完成挑戰可以繼續", reward: "繼續前進" }},
      { node_id: "40", board_id: board._id.toString(), name: "中央商圈", type: "property", description: "中央地產" },
      { node_id: "41", board_id: board._id.toString(), name: "新生街", type: "property", description: "新生地產" },
      { node_id: "42", board_id: board._id.toString(), name: "幸福大道", type: "property", description: "幸福地產" }
    ];

    // 刪除現有節點
    await MapNodeModel.deleteMany({ board_id: board._id.toString() });
    console.log('已清除現有節點');

    // 創建新節點
    const nodes = await MapNodeModel.insertMany(nodesData);
    console.log(`創建了 ${nodes.length} 個節點`);

    // 3. 創建連接資料
    const edgesData = [
      // 外圈連接 (S0 -> 01 -> 02 -> ... -> 36 -> S0)
      { from: "S0", to: "01", board_id: board._id.toString(), type: "normal" },
      { from: "01", to: "02", board_id: board._id.toString(), type: "normal" },
      { from: "02", to: "03", board_id: board._id.toString(), type: "normal" },
      { from: "03", to: "04", board_id: board._id.toString(), type: "normal" },
      { from: "04", to: "05", board_id: board._id.toString(), type: "normal" },
      { from: "05", to: "06", board_id: board._id.toString(), type: "normal" },
      { from: "06", to: "07", board_id: board._id.toString(), type: "normal" },
      { from: "07", to: "08", board_id: board._id.toString(), type: "normal" },
      { from: "08", to: "09", board_id: board._id.toString(), type: "normal" },
      { from: "09", to: "10", board_id: board._id.toString(), type: "normal" },
      { from: "10", to: "11", board_id: board._id.toString(), type: "normal" },
      { from: "11", to: "12", board_id: board._id.toString(), type: "normal" },
      { from: "12", to: "13", board_id: board._id.toString(), type: "normal" },
      { from: "13", to: "14", board_id: board._id.toString(), type: "normal" },
      { from: "14", to: "15", board_id: board._id.toString(), type: "normal" },
      { from: "15", to: "16", board_id: board._id.toString(), type: "normal" },
      { from: "16", to: "17", board_id: board._id.toString(), type: "normal" },
      { from: "17", to: "18", board_id: board._id.toString(), type: "normal" },
      { from: "18", to: "19", board_id: board._id.toString(), type: "normal" },
      { from: "19", to: "20", board_id: board._id.toString(), type: "normal" },
      { from: "20", to: "21", board_id: board._id.toString(), type: "normal" },
      { from: "21", to: "22", board_id: board._id.toString(), type: "normal" },
      { from: "22", to: "23", board_id: board._id.toString(), type: "normal" },
      { from: "23", to: "24", board_id: board._id.toString(), type: "normal" },
      { from: "24", to: "25", board_id: board._id.toString(), type: "normal" },
      { from: "25", to: "26", board_id: board._id.toString(), type: "normal" },
      { from: "26", to: "27", board_id: board._id.toString(), type: "normal" },
      { from: "27", to: "28", board_id: board._id.toString(), type: "normal" },
      { from: "28", to: "29", board_id: board._id.toString(), type: "normal" },
      { from: "29", to: "30", board_id: board._id.toString(), type: "normal" },
      { from: "30", to: "31", board_id: board._id.toString(), type: "normal" },
      { from: "31", to: "32", board_id: board._id.toString(), type: "normal" },
      { from: "32", to: "33", board_id: board._id.toString(), type: "normal" },
      { from: "33", to: "34", board_id: board._id.toString(), type: "normal" },
      { from: "34", to: "35", board_id: board._id.toString(), type: "normal" },
      { from: "35", to: "36", board_id: board._id.toString(), type: "normal" },
      { from: "36", to: "S0", board_id: board._id.toString(), type: "normal" },
      
      // 捷徑連接 (33 -> 37)
      { from: "33", to: "37", board_id: board._id.toString(), type: "shortcut" },
      
      // 內圈連接 (37 -> 38 -> ... -> 42 -> S0)
      { from: "37", to: "38", board_id: board._id.toString(), type: "normal" },
      { from: "38", to: "39", board_id: board._id.toString(), type: "normal" },
      { from: "39", to: "40", board_id: board._id.toString(), type: "normal" },
      { from: "40", to: "41", board_id: board._id.toString(), type: "normal" },
      { from: "41", to: "42", board_id: board._id.toString(), type: "normal" },
      { from: "42", to: "S0", board_id: board._id.toString(), type: "normal" }
    ];

    // 刪除現有連接
    await MapEdgeModel.deleteMany({ board_id: board._id.toString() });
    console.log('已清除現有連接');

    // 創建新連接
    const edges = await MapEdgeModel.insertMany(edgesData);
    console.log(`創建了 ${edges.length} 個連接`);

    console.log('地圖資料初始化完成！');
    console.log('地圖板塊 ID:', board._id);
    
  } catch (error) {
    console.error('初始化地圖資料失敗:', error);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  initMapData().then(() => {
    console.log('腳本執行完成');
    process.exit(0);
  }).catch((error) => {
    console.error('腳本執行失敗:', error);
    process.exit(1);
  });
}

export { initMapData };
