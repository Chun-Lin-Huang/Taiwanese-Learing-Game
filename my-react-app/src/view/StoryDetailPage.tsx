import React from 'react';
import '../style/StoryDetailPage.css';
import backIcon from '../assets/back.svg';
import storyImage from '../assets/detail.png';
import volumeIcon from '../assets/volume.png';

const StoryDetailPage: React.FC<{ story: any, onBack: () => void }> = ({ story, onBack }) => {
  return (
    <>
      <header className="story-header">
        <div className="header-container">
          <a href="#" className="back-button" aria-label="Go back" onClick={onBack}>
            <img src={backIcon} alt="Back arrow icon" />
          </a>
          <h1 className="story-title">《月娘花開的暗暝》</h1>
        </div>
      </header>
      <main>
        <div className="story-image-container">
          <img
            className="story-image"
            src={storyImage}
            alt="Illustration of a smiling moon and flowers at night"
          />
        </div>
        <div className="story-body">
          <button className="audio-button" aria-label="Play story audio">
            <img
              src={volumeIcon}
              alt="Volume up icon"
            />
          </button>
          <p className="story-paragraph">
            很久很久以前，有一個小村莊，村莊邊有一間柴房，裡面住著一位老人家，人稱阿月嬤。阿月嬤每天坐在窗邊，望著天頂的月娘，嘴內念念有詞，村仔內的人攏講，她是在等一個已經無可能返來的人。
            <br /><br />
            五十年前，阿月嬤是村內有名的水某仔，名叫月娘。月娘彼時青春水噹噹，唱歌好聽、心地又善良。她愛上了一個種田的青年阿添，兩人相知相惜，在月光下定下終身。毋過，戰爭來了，阿添被徵調去當兵，講是三個月就會返來，月娘信著，就每天坐在窗前等，等啊等，等過春天、夏天、秋天、冬天，一年又一年，阮村的屋頂換新了、稻田收割再種，但阿添一直無影。鄰居勸她放下，她只是笑笑講：「我知影伊會返來，咱月娘花會開的暗暝，就會是伊返來的時陣。」
            <br /><br />
            她種了一排月娘花，白色細細的花朵，每年攏照時開，像是她的希望攏不曾變。終於，有一工，暗暝天特別光，月娘花開甲滿滿，風吹過有一陣陣香。
            <br /><br />
            有人講，看著一個穿舊軍裝的男子，腳步輕輕行入村口。阿月嬤彼工猶坐在窗邊，忽然，笑甲流目屎。「添哥，你返來啦⋯⋯」無人知影那人真有無來，也有人講阿月嬤是老到迷惘去。但村裡的人攏知影，月娘嬤守著一段情，守著月娘花開的暗暝，也守著自己心內那份真心。
            <br /><br />
            從此以後，村內若有細漢問：「月娘花為什麼每年攏會開？」老人會笑笑講：「因為有一個人，一直等，一直相信，有情人會再見面。」
          </p>
        </div>
      </main>
    </>
  );
};

export default StoryDetailPage;