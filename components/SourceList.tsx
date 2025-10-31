
import React from 'react';
import { GroundingSource } from '../types';

interface SourceListProps {
    sources: GroundingSource[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
    const webSources = sources.filter(s => s.web && s.web.uri && s.web.title);

    if (webSources.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 pt-6 border-t border-dark-border">
            <h3 className="text-lg font-semibold text-dark-text-secondary mb-4">
                Information sourced from:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                {webSources.map((source, index) => (
                    <li key={index} className="truncate">
                        <a 
                            href={source.web!.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-brand-accent hover:underline"
                            title={source.web!.title}
                        >
                            {source.web!.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SourceList;
