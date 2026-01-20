import { useMemo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem } from '@mui/x-tree-view';
import { useTreeItemModel } from '@mui/x-tree-view/hooks';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import './Catalog.css';

// 提取样式对象到组件外部，避免重复创建
const LABEL_BOX_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 1
};

const ICON_STYLE = {
  width: 20,
  height: 20,
  objectFit: 'contain'
};

const HEADER_TYPOGRAPHY_SX = {
  fontFamily: 'HyliaSerif, serif',
  fontFeatureSettings: 'normal'
};

const HEADER_BOX_SX = {
  display: 'flex',
  gap: '2px',
  padding: '2px 20px',
  height: '30px',
  flexShrink: 0,
};

const CONTENT_BOX_SX = {
  overflowY: 'auto',
  overflowX: 'hidden',
  flex: 1,
  minHeight: 0,
};

const BUTTON_SX = { flex: 1 };

const getSelectedItems = (catalog) => {
  const selectedItems = [];
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.checked) {
        selectedItems.push(node.id);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };
  traverse(catalog);
  return selectedItems;
};

// 在 immer 的 draft 中递归更新 checked 状态
// selectedIds 已经包含了由于 selectionPropagation 而自动选中的子节点
const updateCheckedInDraft = (draft, selectedIds) => {
  const traverse = (nodes) => {
    for (const node of nodes) {
      // 根据节点是否在 selectedIds 中设置 checked 状态
      // selectionPropagation 会确保：当父节点被选中时，子节点也会在 selectedIds 中
      // 当用户单独取消选中子节点时，子节点会从 selectedIds 中移除
      node.checked = selectedIds.includes(node.id);
      
      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };
  traverse(draft);
};

export default function CatalogComponent({ catalog, updateCatalog, style }) {
  // 使用 useCallback 缓存函数，避免每次渲染都创建新函数
  const customTreeItem = useCallback((props) => {
    const item = useTreeItemModel(props.itemId);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <TreeItem
        {...props}
        label={
          <Box sx={LABEL_BOX_SX}>
            {!hasChildren && item.img && (
              <img
                src={`./src/assets/map/icons/${item.img}`}
                style={ICON_STYLE}
                alt=""
              />
            )}
            <Typography
              component="span"
              sx={hasChildren ? HEADER_TYPOGRAPHY_SX : {}}
            >
              {props.label}
            </Typography>
          </Box>
        }
      />
    );
  }, []);

  // 使用 useMemo 缓存合并后的样式对象
  const containerStyle = useMemo(() => ({
    ...style,
    display: 'flex',
    flexDirection: 'column'
  }), [style]);

  // 使用 useMemo 缓存 slots 对象
  const slots = useMemo(() => ({
    item: customTreeItem
  }), [customTreeItem]);

  // 使用 useMemo 计算选中项，基于 catalog 中的 checked 属性
  // 这样当 catalog 变化时，选中状态也会更新
  const selectedItems = useMemo(() => getSelectedItems(catalog), [catalog]);

  // 使用 useCallback 缓存回调函数
  const getItemId = useCallback((item) => item.id, []);
  const getItemLabel = useCallback((item) => item.name, []);
  const getItemChildren = useCallback((item) => item.children, []);
  const handleSelectionChange = useCallback((_, value) => {
    // value 是选中的 id 数组，使用 immer 更新 catalog
    updateCatalog(draft => {
      updateCheckedInDraft(draft, value);
    });
  }, [updateCatalog]);

  return (
    <Box style={containerStyle}>
      <Box sx={HEADER_BOX_SX}>
        <Button variant="outlined" sx={BUTTON_SX}>
          All
        </Button>
        <Button variant="outlined" startIcon={<DeleteIcon />} sx={BUTTON_SX}>
          Clear
        </Button>
      </Box>
      <Box sx={CONTENT_BOX_SX}>
        <RichTreeView
          multiSelect
          checkboxSelection
          items={catalog}
          getItemId={getItemId}
          getItemLabel={getItemLabel}
          getItemChildren={getItemChildren}
          slots={slots}
          selectedItems={selectedItems}
          onSelectedItemsChange={handleSelectionChange}
          selectionPropagation={{ descendants: true }}
        />
      </Box>
    </Box>
  );
}