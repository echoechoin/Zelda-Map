import { useMemo } from 'react';
import MapComponent from "./MapComponent.jsx";
import CatalogComponent from "./CatalogComponent.jsx";
import catalogData from '../assets/map/catalog.json';
import locationData from '../assets/map/location.json';
import { useImmer } from "use-immer";

// 提取样式对象到组件外部，避免每次渲染都创建新对象
const catalogStyle = {
  width: '300px',
  height: '100vh',
  position: 'fixed',
  top: 0,
  right: 0,
  backgroundColor: 'white'
};

function ZeldaMapComponent() {
  const [catalog, updateCatalog] = useImmer(catalogData);

  // 使用 useMemo 缓存 props 对象，避免子组件不必要的重新渲染
  const mapProps = useMemo(() => ({
    catalog,
    location: locationData
  }), [catalog]);

  const catalogProps = useMemo(() => ({
    catalog,
    updateCatalog,
    style: catalogStyle
  }), [catalog, updateCatalog]);

  return (
    <>
      <MapComponent {...mapProps} />
      <CatalogComponent {...catalogProps} />
    </>
  );
}

export default ZeldaMapComponent;
  