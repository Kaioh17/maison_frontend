export const vehicleMakes = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'Nissan',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Lexus',
  'Volkswagen',
  'Hyundai',
  'Kia',
  'Mazda',
  'Subaru',
  'Jeep',
  'Dodge',
  'Chrysler',
  'Buick',
  'Cadillac',
  'Lincoln',
  'Acura',
  'Infiniti',
  'Volvo',
  'Jaguar',
  'Land Rover',
  'Porsche',
  'Ferrari',
  'Lamborghini',
  'McLaren',
  'Bentley',
  'Rolls-Royce',
  'Tesla',
  'Rivian',
  'Lucid',
  'Other'
]

export const vehicleModelsByMake: { [key: string]: string[] } = {
  'Toyota': [
    'Camry', 'Corolla', 'Prius', 'RAV4', 'Highlander', 'Sienna', 'Tacoma', 'Tundra', '4Runner', 'Sequoia', 'Land Cruiser', 'Avalon', 'Venza', 'Crown', 'bZ4X'
  ],
  'Honda': [
    'Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'HR-V', 'Passport', 'Ridgeline', 'Insight', 'Clarity', 'e:NP1', 'CR-Z', 'S2000'
  ],
  'Ford': [
    'F-150', 'F-250', 'F-350', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Bronco', 'Ranger', 'Maverick', 'Transit', 'Focus', 'Fusion', 'Taurus'
  ],
  'Chevrolet': [
    'Silverado 1500', 'Silverado 2500', 'Silverado 3500', 'Camaro', 'Corvette', 'Equinox', 'Traverse', 'Tahoe', 'Suburban', 'Colorado', 'Trailblazer', 'Bolt', 'Malibu', 'Impala'
  ],
  'Nissan': [
    'Altima', 'Sentra', 'Maxima', 'Rogue', 'Murano', 'Pathfinder', 'Armada', 'Frontier', 'Titan', 'Leaf', 'Ariya', '370Z', 'GT-R'
  ],
  'BMW': [
    '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'i3', 'i4', 'i7', 'iX', 'M3', 'M5', 'M8', 'Z4'
  ],
  'Mercedes-Benz': [
    'A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'EQS', 'EQB', 'EQE', 'AMG GT', 'SL', 'G-Class'
  ],
  'Audi': [
    'A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'e-tron GT', 'RS e-tron GT', 'TT', 'R8'
  ],
  'Lexus': [
    'ES', 'IS', 'LS', 'GS', 'RX', 'NX', 'GX', 'LX', 'UX', 'LC', 'RC', 'LFA'
  ],
  'Volkswagen': [
    'Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas', 'ID.4', 'ID.Buzz', 'Arteon', 'Touareg', 'Polo', 'T-Cross'
  ],
  'Hyundai': [
    'Elantra', 'Sonata', 'Accent', 'Veloster', 'Tucson', 'Santa Fe', 'Palisade', 'Venue', 'Kona', 'Ioniq 5', 'Ioniq 6', 'Nexo'
  ],
  'Kia': [
    'Forte', 'K5', 'Rio', 'Stinger', 'Sportage', 'Sorento', 'Telluride', 'Soul', 'Niro', 'EV6', 'Carnival'
  ],
  'Mazda': [
    'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-9', 'CX-90', 'MX-30', 'MX-5 Miata', 'RX-8'
  ],
  'Subaru': [
    'Impreza', 'Legacy', 'WRX', 'WRX STI', 'Crosstrek', 'Forester', 'Outback', 'Ascent', 'BRZ', 'Solterra'
  ],
  'Jeep': [
    'Wrangler', 'Gladiator', 'Cherokee', 'Grand Cherokee', 'Compass', 'Renegade', 'Wagoneer', 'Grand Wagoneer'
  ],
  'Dodge': [
    'Challenger', 'Charger', 'Durango', 'Journey', 'Grand Caravan', 'Viper', 'Dart', 'Avenger'
  ],
  'Chrysler': [
    '300', 'Pacifica', 'Voyager', '200', 'Sebring', 'PT Cruiser'
  ],
  'Buick': [
    'Encore', 'Envision', 'Enclave', 'Regal', 'LaCrosse', 'Verano', 'Cascada'
  ],
  'Cadillac': [
    'CT4', 'CT5', 'CT6', 'XT4', 'XT5', 'XT6', 'Escalade', 'ATS', 'CTS', 'XTS', 'SRX'
  ],
  'Lincoln': [
    'Aviator', 'Corsair', 'Nautilus', 'Navigator', 'Continental', 'MKZ', 'MKX', 'MKC'
  ],
  'Acura': [
    'ILX', 'TLX', 'RLX', 'RDX', 'MDX', 'NSX', 'Integra', 'CL', 'TSX', 'RSX'
  ],
  'Infiniti': [
    'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX55', 'QX60', 'QX80', 'G37', 'M37', 'FX'
  ],
  'Volvo': [
    'S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40', 'Polestar 1', 'Polestar 2'
  ],
  'Jaguar': [
    'XE', 'XF', 'XJ', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace', 'F-Pace SVR'
  ],
  'Land Rover': [
    'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery', 'Discovery Sport', 'Defender'
  ],
  'Porsche': [
    '911', 'Cayman', 'Boxster', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Carrera GT'
  ],
  'Ferrari': [
    'F8', 'SF90', '296', '812', 'Roma', 'Portofino', 'F12', 'LaFerrari', 'Enzo'
  ],
  'Lamborghini': [
    'Huracán', 'Aventador', 'Urus', 'Revuelto', 'Countach', 'Diablo', 'Murciélago', 'Gallardo'
  ],
  'McLaren': [
    '720S', '765LT', 'Artura', '750S', 'P1', 'Senna', 'Speedtail', 'F1'
  ],
  'Bentley': [
    'Continental GT', 'Flying Spur', 'Bentayga', 'Mulliner', 'Arnage', 'Brooklands'
  ],
  'Rolls-Royce': [
    'Phantom', 'Ghost', 'Wraith', 'Dawn', 'Cullinan', 'Spectre', 'Silver Shadow', 'Corniche'
  ],
  'Tesla': [
    'Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster', 'Semi'
  ],
  'Rivian': [
    'R1T', 'R1S', 'R2', 'R3', 'R3X'
  ],
  'Lucid': [
    'Air', 'Gravity', 'Sapphire'
  ],
  'Other': [
    'Custom', 'Import', 'Vintage', 'Classic', 'Modified'
  ]
}

export const getVehicleModels = (make: string): string[] => {
  return vehicleModelsByMake[make] || []
}
