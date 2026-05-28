const CSV_URL = '/data/all-vehicles-model.csv';

let cachedLines = null;
let cachedHeaderMap = null;

const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const parseCsvLine = (line, delimiter = ';') => {
  const out = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      out.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  out.push(current);
  return out;
};

const getHeaderMap = (headerLine) => {
  const headers = parseCsvLine(headerLine);
  const map = new Map();
  headers.forEach((header, index) => {
    map.set(header, index);
  });
  return map;
};

const pickValue = (fields, headerMap, headerName) => {
  const index = headerMap.get(headerName);
  if (index == null) return '';
  return fields[index] || '';
};

const loadCsv = async () => {
  if (cachedLines && cachedHeaderMap) return { lines: cachedLines, headerMap: cachedHeaderMap };

  const response = await fetch(CSV_URL);
  if (!response.ok) {
    throw new Error('Impossible de charger le fichier CSV vehicules.');
  }

  const text = await response.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) {
    throw new Error('Le fichier CSV vehicules est vide.');
  }

  cachedLines = lines;
  cachedHeaderMap = getHeaderMap(lines[0]);

  return { lines: cachedLines, headerMap: cachedHeaderMap };
};

export const findVehicleCsvMatch = async (vehicule) => {
  const make = normalize(vehicule?.marque);
  const model = normalize(vehicule?.modele);
  const year = normalize(vehicule?.annee);

  if (!make || !model || !year) return null;

  const { lines, headerMap } = await loadCsv();

  const makeHeader = 'Make';
  const modelHeader = 'Model';
  const yearHeader = 'Year';
  const baseModelHeader = 'baseModel';

  for (let i = 1; i < lines.length; i += 1) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length < headerMap.size) continue;

    const rowMake = normalize(pickValue(fields, headerMap, makeHeader));
    const rowModel = normalize(pickValue(fields, headerMap, modelHeader));
    const rowYear = normalize(pickValue(fields, headerMap, yearHeader));
    const rowBaseModel = normalize(pickValue(fields, headerMap, baseModelHeader));

    if (rowYear !== year || rowMake !== make) continue;
    if (rowModel !== model && rowBaseModel !== model) continue;

    return {
      fuelType: pickValue(fields, headerMap, 'Fuel Type'),
      fuelType1: pickValue(fields, headerMap, 'Fuel Type1'),
      transmission: pickValue(fields, headerMap, 'Transmission'),
      drive: pickValue(fields, headerMap, 'Drive'),
      cylinders: pickValue(fields, headerMap, 'Cylinders'),
      engineDisplacement: pickValue(fields, headerMap, 'Engine displacement'),
      vehicleClass: pickValue(fields, headerMap, 'Vehicle Size Class'),
      cityMpg: pickValue(fields, headerMap, 'City Mpg For Fuel Type1'),
      highwayMpg: pickValue(fields, headerMap, 'Highway Mpg For Fuel Type1'),
      combinedMpg: pickValue(fields, headerMap, 'Combined Mpg For Fuel Type1'),
      annualFuelCost: pickValue(fields, headerMap, 'Annual Fuel Cost For Fuel Type1'),
      ghgScore: pickValue(fields, headerMap, 'GHG Score'),
      epaScore: pickValue(fields, headerMap, 'EPA Fuel Economy Score'),
      modelName: pickValue(fields, headerMap, 'Model'),
      year: pickValue(fields, headerMap, 'Year'),
    };
  }

  return null;
};
