// Modified from https://medium.com/@arm.ninoyan/fixed-react-18-useeffect-runs-twice-8480f0bd837f
import { useEffect, useRef } from 'react';

// Next.js uses process.env.NODE_ENV instead of import.meta.env.PROD
export const useLegacyEffect: typeof useEffect = process.env.NODE_ENV === 'production'
  ? useEffect
  : (effect, deps) => {
      const isMounted = useRef(false);
      useEffect(() => {
        if (isMounted.current) {
          return effect();
        }
        isMounted.current = true;
        return undefined;
      }, deps);
    };

export default useLegacyEffect;