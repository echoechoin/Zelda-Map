import { useEffect, useRef, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useLocationComponent from './LocationComponent';

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

// 提示框样式
const TIP_BOX_STYLE = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  color: '#000',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  zIndex: 1000,
  maxWidth: '320px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  fontFamily: 'system-ui, -apple-system, sans-serif'
};

const CLOSE_BUTTON_STYLE = {
  position: 'absolute',
  top: '4px',
  right: '4px',
  background: 'transparent',
  border: 'none',
  color: '#000',
  cursor: 'pointer',
  fontSize: '20px',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  padding: 0,
  lineHeight: 1
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
const createIcon = (iconUrl, color, isVisited = false) => {
  // 如果已访问，使用 divIcon 并应用灰色滤镜
  if (isVisited) {
    return L.divIcon({
      className: 'custom-marker-icon visited',
      html: `<img src="${iconUrl}" style="width: 20px; height: 20px; filter: grayscale(100%); opacity: 0.6;" alt="" />`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });
  }
  
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
  const { toggleLocationVisited, isLocationVisited, visitedLocations, version } = useLocationComponent();
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // 确保地图容器背景为黑色
    if (mapContainerRef.current) {
      mapContainerRef.current.style.backgroundColor = '#000';
    }

    const map = L.map(mapContainerRef.current, MAP_OPTIONS)
      .setView(MAP_CENTER, DEFAULT_ZOOM);

    // 设置 Leaflet 地图容器的背景色
    const mapContainer = map.getContainer();
    if (mapContainer) {
      mapContainer.style.backgroundColor = '#000';
    }

    L.tileLayer(`${import.meta.env.BASE_URL}assets/map/tiles/{z}_{x}_{y}.png`, {
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

    // 添加新标记和更新已存在标记的访问状态
    visibleLocations.forEach(loc => {
      const isVisited = isLocationVisited(loc.id);
      const category = categoryInfo.get(loc.markerCategoryId);
      
      if (!category || !category.img) return;
      
      if (!currentMarkerIds.has(loc.id)) {
        // 创建新标记
        try {
          const iconPath = `${import.meta.env.BASE_URL}assets/map/icons/${category.img}`;
          const icon = createIcon(iconPath, category.color, isVisited);
          
          const lat = parseFloat(loc.y);
          const lng = parseFloat(loc.x);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng], { icon })
              .addTo(mapInstanceRef.current)
              .bindPopup(loc.name || '');
            
            // 添加双击事件
            marker.on('dblclick', () => {
              toggleLocationVisited(loc.id);
            });
            
            mapMarkerRef.current.push({
              itemId: loc.id,
              categoryId: loc.markerCategoryId,
              marker,
              category,
              isVisited
            });
          }
        } catch (error) {
          console.warn('Failed to create marker for location:', loc.id, error);
        }
      } else {
        // 更新已存在标记的访问状态
        const markerData = mapMarkerRef.current.find(m => m.itemId === loc.id);
        if (markerData && markerData.category) {
          // 检查当前标记的访问状态
          const currentIsVisited = markerData.isVisited || false;
          
          if (currentIsVisited !== isVisited) {
            // 更新图标
            const iconPath = `${import.meta.env.BASE_URL}assets/map/icons/${markerData.category.img}`;
            const newIcon = createIcon(iconPath, markerData.category.color, isVisited);
            markerData.marker.setIcon(newIcon);
            // 更新存储的访问状态
            markerData.isVisited = isVisited;
          }
        }
      }
    });
  }, [visibleLocations, catalog, version, toggleLocationVisited, isLocationVisited]);

  return (
    <div style={CONTAINER_STYLE}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#000'
        }} 
      />
      {showTip && (
        <div style={TIP_BOX_STYLE}>
          <button
            style={CLOSE_BUTTON_STYLE}
            onClick={() => setShowTip(false)}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            aria-label="close tips"
          >
            ×
          </button>
          <div style={{ paddingRight: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>💡 Tips</div>
            <div style={{ lineHeight: '1.5' }}>
            Double-click the map marker to mark it as visited (gray), and double-click again to undo the marker.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;