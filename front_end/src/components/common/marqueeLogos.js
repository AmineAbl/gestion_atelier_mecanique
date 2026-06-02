/**
 * Brand logos served from public/brand-logos (synced from src/.../assets).
 * Static URLs work in dev & prod and avoid SVGR namespace errors.
 */
const PUBLIC_URL = process.env.PUBLIC_URL || '';

const LOGO_FILES = [
  'audi-svgrepo-com.svg',
  'bmw-svgrepo-com.svg',
  'chevrolet-svgrepo-com.svg',
  'dacia-svgrepo-com.svg',
  'fiat-svgrepo-com.svg',
  'ford-svgrepo-com.svg',
  'gmc-svgrepo-com.svg',
  'hyundai-svgrepo-com.svg',
  'jaguar-alt-svgrepo-com.svg',
  'jeep-alt-svgrepo-com.svg',
  'kia-svgrepo-com.svg',
  'land-rover-svgrepo-com.svg',
  'lotus-svgrepo-com.svg',
  'mercedes-benz-svgrepo-com.svg',
  'mini-alt-svgrepo-com.svg',
  'mitsubishi-svgrepo-com.svg',
  'opel-svgrepo-com.svg',
  'peugeot-alt-svgrepo-com.svg',
  'subaru-svgrepo-com.svg',
  'tesla-svgrepo-com.svg',
  'toyota-svgrepo-com.svg',
  'volkswagen-svgrepo-com.svg',
];

const LOGOS = LOGO_FILES.map(
  (file) => `${PUBLIC_URL}/brand-logos/${file}`.replace(/\/+/g, '/')
);

export default LOGOS;
