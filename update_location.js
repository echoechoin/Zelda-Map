import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 location.json
const locationPath = path.join(__dirname, 'src/assets/map/location.json');
const locations = JSON.parse(fs.readFileSync(locationPath, 'utf8'));

// 创建类别到 icon 的映射
const categoryToIcon = {
  'Shrine': 'shrine.png',
  'Tower': 'tower.png',
  'Stable': 'stable.png',
  'Village': 'village.png',
  'Settlement': 'settlement.png',
  'Castle': 'castle.png',
  'Fountain': 'fountain.png',
  'Statue': 'statue.png',
  'Pot': 'pot.png',
  'Treasure': 'treasure.png',
  'Seed': 'seed.png',
  'Guardian': 'guardian.png',
  'Hinox': 'hinox.png',
  'Lynel': 'lynel.png',
  'Talus': 'talus.png',
  'Molduga': 'molduga.png',
  'Armor': 'armor.png',
  'Dye': 'dye.png',
  'Jewelry': 'jewelry.png',
  'Lab': 'lab.png',
  'Inn': 'inn.png',
  'Store': 'store.png',
  'Raft': 'raft.png',
  'Mainquest': 'mainquest.png',
  'Sidequest': 'sidequest.png',
  'Shrinequest': 'shrinequest.png',
  'Memory': 'memory.png',
  'Objective': 'objective.png',
};

// 处理每个 location
const updatedLocations = locations.map(location => {
  // 获取 name 的最后一个单词作为类别
  const words = location.name.split(' ');
  const category = words.length > 0 ? words[words.length - 1] : '';
  
  // 根据类别获取对应的 icon
  let icon = categoryToIcon[category] || 'objective.png'; // 默认使用 objective.png
  
  // 特殊处理：如果 name 包含特定关键词，使用对应的 icon
  const nameLower = location.name.toLowerCase();
  if (nameLower.includes('resurrection')) {
    icon = 'shrine_resurrection.png';
  } else if (nameLower.includes('dlc') || nameLower.includes('champion')) {
    icon = 'shrine_dlc.png';
  }
  
  // 创建新的 location 对象，在 name 字段后添加 icon 字段
  const keys = Object.keys(location);
  const nameIndex = keys.indexOf('name');
  const newObj = {};
  
  // 按顺序添加字段，在 name 后插入 icon
  keys.forEach((key) => {
    if (key === 'name') {
      newObj[key] = location[key];
      newObj['icon'] = icon; // 在 name 后添加 icon
    } else if (key !== 'icon') {
      newObj[key] = location[key];
    }
  });
  
  return newObj;
});

// 写回文件
fs.writeFileSync(locationPath, JSON.stringify(updatedLocations, null, 4), 'utf8');
console.log(`已更新 ${updatedLocations.length} 个 location 对象`);
console.log('完成！');
