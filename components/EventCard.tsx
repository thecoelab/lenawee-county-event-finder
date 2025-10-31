import React from 'react';
import { Event } from '../types';
import MapPinIcon from './icons/MapPinIcon';
import CalendarIcon from './icons/CalendarIcon';
import UsersIcon from './icons/UsersIcon';

interface EventCardProps {
    event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const { name, description, date, time, location, isKidFriendly, sourceUrl } = event;

    // Fix: Corrected typo from 'toLocaleDateFormat' to 'toLocaleDateString'.
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;

    return (
        <div className="bg-dark-card rounded-lg shadow-lg overflow-hidden border border-dark-border flex flex-col h-full transform hover:-translate-y-1 transition-transform duration-300">
            <div className="p-6 flex-grow">
                <div className="flex justify-end items-start h-6">
                    {isKidFriendly && (
                         <div className="flex items-center text-green-400" title="Kid Friendly">
                             <UsersIcon className="h-5 w-5"/>
                             <span className="text-xs font-semibold ml-1">Family</span>
                         </div>
                    )}
                </div>
                <h3 className="text-xl font-bold text-dark-text-primary mt-2 mb-2">{name}</h3>
                <p className="text-dark-text-secondary text-sm flex-grow">{description}</p>
            </div>
            <div className="p-6 bg-gray-900/50 border-t border-dark-border">
                <div className="flex items-center text-dark-text-secondary text-sm mb-3">
                    <CalendarIcon className="h-5 w-5 mr-3 text-brand-accent"/>
                    <span>{formattedDate} at {time}</span>
                </div>
                <div className="flex items-center text-dark-text-secondary text-sm">
                    <MapPinIcon className="h-5 w-5 mr-3 text-brand-accent"/>
                    <span>{location.venue}</span>
                </div>
            </div>
             <div className="p-4 bg-dark-card flex items-center justify-between border-t border-dark-border space-x-4">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-accent hover:underline">
                    View on Map
                </a>
                {sourceUrl && (
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-accent hover:underline">
                        More Information
                    </a>
                )}
            </div>
        </div>
    );
};

export default EventCard;