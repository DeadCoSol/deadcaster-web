import { useState, useEffect, ReactNode } from 'react';

type TabsProps = {
    tabs: string[];
    children: ReactNode[];
    initialTab?: number; // Optional initial tab index
};

const Tabs = ({ tabs, children, initialTab = 0 }: TabsProps) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        setActiveTab(initialTab); // Set the initial tab from the prop when the component mounts
    }, [initialTab]);

    return (
        <div>
            <div className="flex justify-center mb-4">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`p-2 mx-2 ${activeTab === index ? 'border-b-2 border-blue-500' : ''}`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div>
                {children.map((child, index) => (
                    <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
                        {child}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tabs;
