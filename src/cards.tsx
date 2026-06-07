import Stack from './Stack';

export default function Cards() {
  const images = [
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format',
    'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format',
    'https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format',
    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format'
  ];

  return (
    <div style={{ width: 300, height: 400 }}>
      <Stack
        randomRotation={false}
        sensitivity={200}
        sendToBackOnClick={true}
        cards={images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`card-${i + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ))}
        autoplay={false}
        autoplayDelay={3000}
        pauseOnHover={false}
      />
    </div>
  );
}