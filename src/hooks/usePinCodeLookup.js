import { useEffect, useState } from 'react';
import pinData from '../utils/pinCodeData.json';

/** Simulated India Post lookup against a static dataset. */
export default function usePinCodeLookup(pin) {
  const [result, setResult] = useState({
    city: '', state: '', postOffice: '', isLoading: false, error: null,
  });

  useEffect(() => {
    if (!/^\d{6}$/.test(pin || '')) {
      setResult({
        city: '', state: '', postOffice: '', isLoading: false, error: null,
      });
      return undefined;
    }
    setResult((r) => ({ ...r, isLoading: true, error: null }));
    const t = setTimeout(() => {
      const hit = pinData[pin];
      setResult(hit
        ? { ...hit, isLoading: false, error: null }
        : {
          city: '', state: '', postOffice: '', isLoading: false, error: 'We could not find this PIN code. Check the digits or enter your city and state manually',
        });
    }, 400);
    return () => clearTimeout(t);
  }, [pin]);

  return result;
}
