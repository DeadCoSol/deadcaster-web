import { useState, useEffect } from 'react';

export function useDeadCoinPrice() {
    const [price, setPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch('https://price.jup.ag/v6/price?ids=DEADCO');
                const data = await response.json();
                const deadCoinPrice = data.data.DEADCO.price;
                setPrice(deadCoinPrice);
            } catch (err) {
                setError('Failed to fetch DeadCoin price');
            } finally {
                setLoading(false);
            }
        };

        fetchPrice();
    }, []);

    return { price, loading, error };
}
