//情境對話選單
import React from 'react';

const topics = [
    { id: 'food', name: '美食' },
    { id: 'transport', name: '交通工具' },
    // 您可以在這裡繼續添加更多主題
];

interface TopicSelectionMenuProps {
    onTopicClick: (topicName: string) => void;
}

const TopicSelectionMenu: React.FC<TopicSelectionMenuProps> = ({ onTopicClick }) => {
    return (
        <div className="topic-selection-container">
            <h3 className="topic-selection-title">請選擇對話主題</h3>
            <ul className="topic-list">
                {topics.map(topic => (
                    <li
                        key={topic.id}
                        className="topic-item"
                        onClick={() => onTopicClick(topic.name)}
                    >
                        {topic.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TopicSelectionMenu;