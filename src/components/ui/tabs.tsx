import {useState, ReactNode} from 'react';

type TabsProps = {
    tabs: string[];
    children: ReactNode[];
};

const Tabs = ({tabs, children}: TabsProps) => {
    const [activeTab, setActiveTab] = useState(0);

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
