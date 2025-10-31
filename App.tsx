import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Event, GroundingSource } from './types';
import { fetchEventsFromGemini } from './services/geminiService';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import EventList from './components/EventList';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import SourceList from './components/SourceList';

const CACHE_KEY = 'lenawee_events_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const App: React.FC = () => {
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [sources, setSources] = useState<GroundingSource[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const fetchEvents = useCallback(async (force: boolean = false) => {
        if (!force) {
          setIsLoading(true);
        }
        setError(null);
        try {
            const { events: fetchedEvents, sources: fetchedSources } = await fetchEventsFromGemini();
            fetchedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setAllEvents(fetchedEvents);
            setSources(fetchedSources);
            
            // Save to cache
            const cacheData = {
                events: fetchedEvents,
                sources: fetchedSources,
                timestamp: new Date().getTime(),
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

        } catch (err) {
            setError('Failed to fetch events. The model may be busy. Please try refreshing.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Effect for initial load and scheduled refresh
    useEffect(() => {
        const loadInitialData = () => {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const { events, sources, timestamp } = JSON.parse(cachedData);
                const isCacheStale = (new Date().getTime() - timestamp) > CACHE_DURATION;
                
                setAllEvents(events);
                setSources(sources);
                setIsLoading(false);

                if (isCacheStale) {
                    // Fetch in background if cache is stale
                    fetchEvents();
                }
            } else {
                // Fetch if no cache exists
                fetchEvents();
            }
        };
        
        loadInitialData();

        // Set up hourly refresh
        const intervalId = setInterval(() => {
            fetchEvents(true); // a background refresh
        }, CACHE_DURATION);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
        
    }, [fetchEvents]);


    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  event.location.venue.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDate = (!startDate || event.date >= startDate) && 
                                (!endDate || event.date <= endDate);
            
            return matchesSearch && matchesDate;
        });
    }, [allEvents, searchTerm, startDate, endDate]);

    return (
        <div className="min-h-screen bg-dark-bg text-dark-text-primary font-sans">
            <Header onRefresh={() => fetchEvents(true)} isLoading={isLoading}/>
            <main className="container mx-auto px-4 py-8">
                <FilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                />

                {isLoading && <LoadingSpinner />}
                {error && <ErrorMessage message={error} />}
                
                {!isLoading && !error && (
                    <>
                        <EventList events={filteredEvents} />
                        <SourceList sources={sources} />
                    </>
                )}
            </main>
        </div>
    );
};

export default App;
