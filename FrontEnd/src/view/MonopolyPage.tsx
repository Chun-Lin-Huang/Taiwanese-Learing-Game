import { useNavigate } from 'react-router-dom';
import '../style/MonopolyPage.css';
import "../App.css";
import backIcon from "../assets/back.svg";

const cards = [
  { title: "台語\n單字卡", path: "/ThemeSelection2" },
  { title: "情境\n對話", path: "/Home2" },
  { title: "超級\n大富翁", path: "/SuperMonopoly" },
];

export default function MonopolyPage() {
  const navigate = useNavigate();

  return (
    <div className="selection-bg">
      <header className="selection-header">
        <button
          className="back-button"
          onClick={() => navigate("/Learn")}
        >
          <img src={backIcon} alt="返回" />
        </button>
        <p className="monopoly-title">大富翁</p>
      </header>

      <main className="monopoly-main">
        <div className="monopoly-cards">
          {cards.map((card, idx) => (
            <div key={idx} className="monopoly-card-wrapper">
              <button
                className="monopoly-card"
                onClick={() => card.path && navigate(card.path)}
              >
                <div className="monopoly-card-title">
                  {card.title.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}