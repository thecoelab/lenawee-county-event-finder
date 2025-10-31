
import React from 'react';
import { Event } from '../types';
import EventCard from './EventCard';

interface EventListProps {
    events: Event[];
}

const EventList: React.FC<EventListProps> = ({ events }) => {
    if (events.length === 0) {
        return (
            <div className="text-center py-16 bg-dark-card rounded-lg border border-dark-border">
                <h3 className="text-xl font-semibold text-dark-text-primary">No Events Found</h3>
                <p className="text-dark-text-secondary mt-2">Try adjusting your search filters to find more events.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
                <EventCard key={`${event.name}-${index}`} event={event} />
            ))}
        </div>
    );
};

export default EventList;
