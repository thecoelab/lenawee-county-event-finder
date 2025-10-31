export interface Event {
    name: string;
    description: string;
    date: string; // ISO 8601 format e.g. "2024-07-20"
    time: string; // e.g. "7:00 PM"
    location: {
        venue: string;
        address: string;
    };
    isKidFriendly: boolean;
    sourceUrl?: string; // Renamed from websiteUrl, points to the source of the event info
}

export interface GroundingSource {
    web?: {
        uri?: string;
        title?: string;
    };
}
