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

const MapComponent = ({ catalog, location }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  console.log("update MapComponent");

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
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapContainerRef} style={CONTAINER_STYLE} />;
};

export default MapComponent;