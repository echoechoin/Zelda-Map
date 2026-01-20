import MapComponent from "./MapComponent.jsx";
import CatalogComponent from "./CatalogComponent.jsx";
import catalogData from '../assets/map/catalog.json';
import locationData from '../assets/map/location.json';
import { useImmer } from "use-immer";

function ZeldaMapComponent() {
  const [catalog, updateCatalog] = useImmer(catalogData);

  return (
    <>
      <MapComponent
        catalog = {catalog}
        location = {locationData}
      />
      <CatalogComponent
        catalog = {catalog}
        updateCatalog = {updateCatalog}
        style = {{ width: '300px', height: '100vh', position: 'fixed', top: 0, right: 0, backgroundColor: 'white'}}
      />
    </>
  )
}

export default ZeldaMapComponent;
  