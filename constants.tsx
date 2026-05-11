
import { Plant, PlantCategory, Tool } from './types';

export const MOCK_PLANTS: Plant[] = [
  {
    id: '1',
    name: 'Fiddle Leaf Fig',
    price: 15500, // PKR
    category: PlantCategory.INDOOR,
    size: 'Large',
    growthStage: 'Sapling',
    sunlight: 'Bright Indirect',
    watering: 'Once a week',
    soil: 'Well-draining peat mix',
    imageUrl: 'https://images.unsplash.com/photo-1597055181300-e3633a207519?auto=format&fit=crop&w=400',
    description: 'Stunning large-leafed tropical tree.',
    stock: 10,
    maintenanceLevel: 'Moderate',
    healthScore: 88,
    status: 'Healthy',
    aiInsight: 'Optimal leaf turgor detected'
  },
  {
    id: '2',
    name: 'Snake Plant',
    price: 4500, // PKR
    category: PlantCategory.INDOOR,
    size: 'Medium',
    growthStage: 'Mature',
    sunlight: 'Low to Bright',
    watering: 'Every 2-3 weeks',
    soil: 'Cactus mix',
    imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bac?auto=format&fit=crop&w=400',
    description: 'Indestructible air purifier.',
    stock: 25,
    maintenanceLevel: 'Easy',
    healthScore: 95,
    status: 'Healthy',
    aiInsight: 'Excellent nocturnal CO2 absorption'
  },
  {
    id: '3',
    name: 'Peace Lily',
    price: 6500, // PKR
    category: PlantCategory.INDOOR,
    size: 'Medium',
    growthStage: 'Mature',
    sunlight: 'Low to Medium',
    watering: 'Twice a week',
    soil: 'Loamy',
    imageUrl: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=400',
    description: 'Elegant white blooms and dark leaves.',
    stock: 15,
    maintenanceLevel: 'Easy',
    healthScore: 42,
    status: 'Warning',
    aiInsight: 'High transpiration; needs hydration'
  },
  {
    id: '4',
    name: 'Calathea Orbifolia',
    price: 9500, // PKR
    category: PlantCategory.INDOOR,
    size: 'Medium',
    growthStage: 'Sapling',
    sunlight: 'Medium Indirect',
    watering: 'Twice a week',
    soil: 'Moisture-retentive',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400',
    description: 'Striking oversized silver-green leaves.',
    stock: 8,
    maintenanceLevel: 'Expert',
    healthScore: 25,
    status: 'Critical',
    aiInsight: 'Humidity levels critically low'
  }
];

export const GARDEN_TOOLS: Tool[] = [
  { id: 't1', name: 'Victorian Trellis', imageUrl: 'https://cdn-icons-png.flaticon.com/512/3233/3233497.png', category: 'construction' },
  { id: 't2', name: 'Royal Stone Fountain', imageUrl: 'https://cdn-icons-png.flaticon.com/512/3516/3516353.png', category: 'maintenance' },
  { id: 't3', name: 'Classic Terracotta Pot', imageUrl: 'https://cdn-icons-png.flaticon.com/512/628/628283.png', category: 'maintenance' },
  { id: 't4', name: 'Solar Path Torch', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2164/2164631.png', category: 'construction' },
  { id: 't5', name: 'Handcrafted Oak Bench', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2635/2635398.png', category: 'maintenance' },
  { id: 't6', name: 'Garden Dwarf Statue', imageUrl: 'https://cdn-icons-png.flaticon.com/512/3043/3043598.png', category: 'maintenance' },
  { id: 't7', name: 'Antique Water Well', imageUrl: 'https://cdn-icons-png.flaticon.com/512/3246/3246261.png', category: 'construction' }
];
