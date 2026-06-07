import Stack from './Stack';
import alisha1 from './assets/images/alisha1.jpg';
import alisha2 from './assets/images/alisha2.jpg';
import alisha3 from './assets/images/alisha3.jpg';
import alisha4 from './assets/images/alisha4.jpg';
import alisha5 from './assets/images/alisha5.jpg';
import alisha6 from './assets/images/alisha6.jpg';

export default function Cards() {
  const images = [
    alisha6,
    alisha5,
    alisha4,
    alisha3,
    alisha2,
    alisha1,
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