import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({catalog, location }) => {
  // 容器 ref（挂载 DOM 元素）
  const mapContainerRef = useRef(null);
  // 地图实例 ref（存储 Leaflet 地图对象）
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // 1. 检查容器是否存在，且地图未初始化
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // 2. 定义 z = 0 的时候 CRS.Simple 边界：[[yMin, xMin], [yMax, xMax]]
    //  设置为第一层瓦片的 (x,y) 像素大小
    const bounds = new L.LatLngBounds(
      new L.LatLng(0, 0),      // 左上
      new L.LatLng(-256, 256)  // 右下 (y轴向上为负) 
    );

    // 3. 初始化地图（容器是 mapContainerRef.current）
    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.Simple,
      attributionControl: false,  // 右下角是否显示属性
      maxBounds: bounds,          // 边界
      maxBoundsViscosity: 0.5,    // 调整地图拖动到边界时的 “阻力感”

      // control
      zoomControl: false,

      // Animation
      zoomAnimation: true,        // 开启缩放动画（默认true，确保没被关闭）
      zoomAnimationThreshold: 4,  // 缩放级别差超过4才禁用动画（提高阈值）
      fadeAnimation: true,        // 瓦片加载时淡入动画（避免突然闪现/消失）
      markerZoomAnimation: false, // 若没有标记点，关闭标记点缩放动画（减少开销）
      inertia: true,              // 拖动惯性（间接优化缩放后的顺滑度）
      inertiaDeceleration: 3000,  // 惯性减速（数值越大越顺滑）
      wheelDebounceTime: 40,      // 鼠标滚轮防抖（减少频繁缩放触发）
      trackResize: false,         // 若地图容器尺寸固定，关闭尺寸追踪（减少重绘）
    }).setView([-256 / 2, 256/2], 2); // 中心位置，默认缩放比例

    // 4. 配置瓦片层（注意：React 中静态资源路径建议用 public 文件夹）
    // 推荐：将地图瓦片放到 public/maps 目录下，路径改为 /maps/{z}_{x}_{y}.png
    L.tileLayer('./src/assets/map/tiles/{z}_{x}_{y}.png', {
      minZoom: 0,
      maxZoom: 7,
      noWrap: true,
      bounds: bounds,
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    }).addTo(map);

    // 5. 存储地图实例到 ref
    mapInstanceRef.current = map;

    // 6. 清理函数：组件卸载时销毁地图
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{ 
        height: '100vh', 
        width: '100%', 
        background: '#000',
        position: 'relative',
        zIndex: 0 
      }}
    />
  );
};

export default MapComponent;