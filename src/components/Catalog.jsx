import { Box, Typography } from '@mui/material';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem } from '@mui/x-tree-view';
import { useTreeItemModel } from '@mui/x-tree-view/hooks';
import Button from '@mui/material/Button';
import catalog from '../assets/map/catalog.json';
import DeleteIcon from '@mui/icons-material/Delete';
import './Catalog.css';

export default function Catalog({ style }) {
  const customTreeItem = (props) => {
    const item = useTreeItemModel(props.itemId);
    const hasChildren = item.children && item.children.length > 0;
    const sx = { 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1
    }
    return (
      <TreeItem
        {...props}
        label = {
          <Box sx = {sx}>
            {!hasChildren && item.img && (
              <img src={`./src/assets/map/icons/${item.img}`}
                  style={{ width: 20, height: 20, objectFit: 'contain' }}
              />
            )}
            <Typography 
              component="span"
              sx={hasChildren ? { 
                fontFamily: 'HyliaSerif, serif',
                fontFeatureSettings: 'normal'
              } : {}}
            >
              {props.label}
            </Typography>
          </Box>
        }
      />
    )
  }

  return (
    <Box style={{ ...style, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        display: 'flex',
        gap: '2px',
        padding: '2px 20px',
        height: '30px',
        flexShrink: 0,
      }}>
        <Button variant="contained" sx={{ flex: 1 }}>All</Button>
        <Button variant="contained" startIcon={<DeleteIcon />} sx={{ flex: 1 }}>Clear</Button>
      </Box>
      <Box sx={{
        overflowY: 'auto',
        overflowX: 'hidden',
        flex: 1,
        minHeight: 0,
      }}>
        <RichTreeView multiSelect checkboxSelection
          items = {catalog}
          getItemId = {item => item.id}
          getItemLabel = {item => item.name}
          getItemChildren = {item => item.children}
          slots = {{ item: customTreeItem }}
        />
      </Box>
    </Box>
  );
}