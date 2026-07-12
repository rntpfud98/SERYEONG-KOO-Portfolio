import React, { useState, useEffect } from 'react';
import { get } from 'idb-keyval';

type IDBImageProps = React.ComponentProps<'img'> & { src?: string };

export default function IDBImage({ src, ...props }: IDBImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    
    if (src && src.startsWith('idb://')) {
      const key = src.replace('idb://', '');
      get(key).then((data) => {
        if (isMounted && data) {
          setImgSrc(data as string);
        }
      }).catch(err => {
        console.error("Failed to load image from IndexedDB", err);
      });
    } else {
      setImgSrc(src);
    }
    
    return () => {
      isMounted = false;
    };
  }, [src]);

  return <img src={imgSrc || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="} {...props} />;
}
