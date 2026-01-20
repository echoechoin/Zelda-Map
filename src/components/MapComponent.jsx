import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 提取常量，避免在组件内部重复计算
const TILE_SIZE = 256;
const MAP_CENTER = [-TILE_SIZE / 2, TILE_SIZE / 2];
const DEFAULT_ZOOM = 2;
const TILE_BOUNDS = new L.LatLngBounds(
  new L.LatLng(0, 0),
  new L.LatLng(-TILE_SIZE, TILE_SIZE)
);

// 地图配置对象，提取到组件外部避免重复创建
const MAP_OPTIONS = {
  crs: L.CRS.Simple,
  attributionControl: false,
  maxBounds: TILE_BOUNDS,
  maxBoundsViscosity: 0.5,
  zoomControl: false,
  zoomAnimation: true,
  zoomAnimationThreshold: 4,
  fadeAnimation: true,
  markerZoomAnimation: false,
  inertia: true,
  inertiaDeceleration: 3000,
  wheelDebounceTime: 40,
  trackResize: false,
};

// 容器样式对象，提取到组件外部
const CONTAINER_STYLE = {
  height: '100vh',
  width: '100%',
  background: '#000',
  position: 'relative',
  zIndex: 0
};

// 递归获取所有 checked 为 true 的节点 id
const getCheckedCategoryIds = (catalog) => {
  const checkedIds = new Set();
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.checked) {
        checkedIds.add(node.id);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };
  traverse(catalog);
  return checkedIds;
};

// 从 catalog 中获取分类信息（用于创建图标）
const getCategoryInfo = (catalog) => {
  const categoryMap = new Map();
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.img) {
        categoryMap.set(node.id, {
          img: node.img,
          color: node.color
        });
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };
  traverse(catalog);
  return categoryMap;
};

// 创建 Leaflet 图标
const createIcon = (iconUrl, color) => {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const MapComponent = ({ catalog, location }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapMarkerRef = useRef([]); // 用于存储和更新地图标记

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, MAP_OPTIONS)
      .setView(MAP_CENTER, DEFAULT_ZOOM);

    L.tileLayer('./src/assets/map/tiles/{z}_{x}_{y}.png', {
      minZoom: 0,
      maxZoom: 7,
      noWrap: true,
      bounds: TILE_BOUNDS,
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        // 清理所有标记
        mapMarkerRef.current.forEach(({ marker }) => {
          mapInstanceRef.current.removeLayer(marker);
        });
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        mapMarkerRef.current = [];
      }
    };
  }, []);

  // 计算需要显示的标记
  const visibleLocations = useMemo(() => {
    if (!catalog || !location) return [];
    
    const checkedCategoryIds = getCheckedCategoryIds(catalog);
    return location.filter(loc => 
      checkedCategoryIds.has(loc.markerCategoryId) && loc.visible === "1"
    );
  }, [catalog, location]);

  // 更新标记：添加新标记，删除不需要的标记
  useEffect(() => {
    if (!mapInstanceRef.current || !catalog) return;

    const categoryInfo = getCategoryInfo(catalog);
    const currentMarkerIds = new Set(mapMarkerRef.current.map(m => m.itemId));
    const visibleLocationIds = new Set(visibleLocations.map(loc => loc.id));

    // 删除不再需要的标记
    mapMarkerRef.current = mapMarkerRef.current.filter(({ itemId, marker }) => {
      if (!visibleLocationIds.has(itemId)) {
        try {
          mapInstanceRef.current.removeLayer(marker);
        } catch (error) {
          console.warn('Failed to remove marker:', error);
        }
        return false;
      }
      return true;
    });

    // 添加新标记
    visibleLocations.forEach(loc => {
      if (!currentMarkerIds.has(loc.id)) {
        // 直接使用 catalog 中的图标
        const category = categoryInfo.get(loc.markerCategoryId);
        if (category && category.img) {
          try {
            // 构建图标路径
            const iconPath = `./src/assets/map/icons/${category.img}`;
            const icon = createIcon(iconPath, category.color);
            
            // 创建标记（注意 y 坐标是负数，需要转换）
            const lat = parseFloat(loc.y);
            const lng = parseFloat(loc.x);
            
            if (!isNaN(lat) && !isNaN(lng)) {
              const marker = L.marker([lat, lng], { icon })
                .addTo(mapInstanceRef.current)
                .bindPopup(loc.name || '');
              
              mapMarkerRef.current.push({
                itemId: loc.id,
                categoryId: loc.markerCategoryId,
                marker
              });
            }
          } catch (error) {
            console.warn('Failed to create marker for location:', loc.id, error);
          }
        }
      }
    });
  }, [visibleLocations, catalog]);

  return <div ref={mapContainerRef} style={CONTAINER_STYLE} />;
};

export default MapComponent;