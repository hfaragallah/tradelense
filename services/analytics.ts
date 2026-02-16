import ReactGA from "react-ga4";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initGA = () => {
    if (MEASUREMENT_ID && MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
        ReactGA.initialize(MEASUREMENT_ID);
        console.log('Google Analytics Initialized');
    } else {
        console.warn('Google Analytics Measurement ID is missing or invalid.');
    }
};

export const logPageView = (path: string) => {
    if (MEASUREMENT_ID && MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
        ReactGA.send({ hitType: "pageview", page: path });
    }
};

export const logEvent = (category: string, action: string, label?: string) => {
    if (MEASUREMENT_ID && MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
        ReactGA.event({
            category,
            action,
            label,
        });
    }
};
