import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'zelda_map_visited_locations';

// 从 localStorage 加载已访问的位置
const loadVisitedLocations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.warn('Failed to load visited locations from localStorage:', error);
  }
  return new Set();
};

// 保存已访问的位置到 localStorage
const saveVisitedLocations = (visitedSet) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(visitedSet)));
  } catch (error) {
    console.warn('Failed to save visited locations to localStorage:', error);
  }
};

/**
 * LocationComponent - 管理地图标记的访问状态
 * 
 * 功能：
 * 1. 管理哪些标记被双击访问过
 * 2. 将访问状态存储到浏览器 localStorage
 * 3. 提供切换访问状态的方法
 */
export default function useLocationComponent() {
  const [visitedLocations, setVisitedLocations] = useState(() => loadVisitedLocations());
  const [version, setVersion] = useState(0); // 用于触发重新渲染

  // 保存到 localStorage（当 visitedLocations 变化时）
  useEffect(() => {
    saveVisitedLocations(visitedLocations);
  }, [visitedLocations]);

  // 切换位置的访问状态
  const toggleLocationVisited = useCallback((locationId) => {
    setVisitedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      setVersion(v => v + 1); // 更新版本号以触发重新渲染
      return newSet;
    });
  }, []);

  // 检查位置是否被访问过
  const isLocationVisited = useCallback((locationId) => {
    return visitedLocations.has(locationId);
  }, [visitedLocations]);

  // 清除所有访问记录
  const clearAllVisited = useCallback(() => {
    setVisitedLocations(new Set());
  }, []);

  return {
    visitedLocations,
    toggleLocationVisited,
    isLocationVisited,
    clearAllVisited,
    version // 返回版本号用于依赖项
  };
}
