import React, { useState } from 'react';
import {
  FiPlus,
  FiTrash2,
  FiX,
  FiSearch,
  FiPackage,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import styles from './styles/AddItems.module.css';

// Custom Components
import Button from './Button';
import TextInput from './TextInput';
import SelectInput from './SelectInput';

const AddItems = ({
  items = [],
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  
  // Column configuration
  columns = [],
  
  // Data options for selects
  variantOptions = [],
  uomOptions = [],
  priceTypeOptions = [],
  currencyOptions = [],
  
  // Modal state
  showAddMultipleModal = false,
  setShowAddMultipleModal = () => {},
  
  // Custom renderers
  renderColumn = null,
  
  // Labels
  entityLabel = 'Item',
  entityPluralLabel = 'Items',
  addRowLabel = 'Add Row',
  addMultipleLabel = 'Add Multiple',
  emptyStateLabel = 'No items added yet',
  emptyStateSubLabel = 'Click "Add Row" or "Add Multiple" to add items',
  
  // Callbacks
  onItemClick = null,
}) => {
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [editingItemId, setEditingItemId] = useState(null);

  // Initialize new item with default values from columns
  const initializeNewItem = () => {
    const initial = {};
    columns.forEach(col => {
      if (col.defaultValue !== undefined) {
        initial[col.key] = col.defaultValue;
      } else if (col.type === 'select' && col.options && col.options.length > 0) {
        initial[col.key] = col.options[0]?.value || '';
      } else if (col.type === 'text' || col.type === 'number') {
        initial[col.key] = '';
      }
    });
    return initial;
  };

  // Handle add new row
  const handleAddRow = () => {
    // Check required fields
    const requiredFields = columns.filter(col => col.required);
    const isValid = requiredFields.every(col => {
      const value = newItem[col.key];
      return value !== undefined && value !== '' && value !== null;
    });

    if (!isValid) {
      return;
    }

    onAddItem({
      ...newItem,
      id: Date.now().toString(),
    });
    
    setNewItem(initializeNewItem());
    setIsAddingRow(false);
  };

  // Handle add multiple from modal
  const handleAddMultiple = (variantId) => {
    const qty = selectedVariants[variantId] || 1;
    const variant = variantOptions.find(v => v.value === variantId);
    if (!variant) return;

    const newItemData = {};
    columns.forEach(col => {
      if (col.key === 'variant_id') {
        newItemData[col.key] = variantId;
      } else if (col.key === 'uom_id' && variant.uom) {
        newItemData[col.key] = variant.uom;
      } else if (col.key === 'unit_price' && variant.price) {
        newItemData[col.key] = variant.price;
      } else if (col.key === 'quantity') {
        newItemData[col.key] = qty;
      } else if (col.defaultValue !== undefined) {
        newItemData[col.key] = col.defaultValue;
      } else {
        newItemData[col.key] = '';
      }
    });

    onAddItem({
      ...newItemData,
      id: Date.now().toString() + Math.random(),
    });

    setSelectedVariants(prev => {
      const newState = { ...prev };
      delete newState[variantId];
      return newState;
    });
  };

  // Handle add all selected variants
  const handleAddAllSelected = () => {
    const variantIds = Object.keys(selectedVariants);
    variantIds.forEach(id => {
      handleAddMultiple(id);
    });
  };

  // Update selected variant quantity in modal
  const updateSelectedVariantQty = (variantId, value) => {
    const qty = parseInt(value) || 1;
    setSelectedVariants(prev => ({
      ...prev,
      [variantId]: qty,
    }));
  };

  // Toggle variant selection in modal
  const toggleVariantSelection = (variantId) => {
    setSelectedVariants(prev => {
      const newState = { ...prev };
      if (newState[variantId]) {
        delete newState[variantId];
      } else {
        newState[variantId] = 1;
      }
      return newState;
    });
  };

  // Filter variants for modal
  const filteredModalVariants = variantOptions.filter(variant =>
    variant.label.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
    variant.sku?.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  // Get selected variant count
  const selectedCount = Object.keys(selectedVariants).length;

  // Format currency
  const formatCurrency = (amount, currencyId = 'usd') => {
    const currency = currencyOptions.find(c => c.value === currencyId);
    return `${currency?.symbol || '$'}${parseFloat(amount).toFixed(2)}`;
  };

  // Calculate total
  const calculateTotal = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    return qty * price;
  };

  // Get variant details
  const getVariantDetails = (variantId) => {
    return variantOptions.find(v => v.value === variantId);
  };

  // Get currency symbol
  const getCurrencySymbol = (currencyId) => {
    const currency = currencyOptions.find(c => c.value === currencyId);
    return currency?.symbol || '$';
  };

  // Render column value
  const renderCellValue = (item, column) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === 'currency') {
      return formatCurrency(value, item.currency_id);
    }

    if (column.type === 'select' && column.options) {
      const option = column.options.find(opt => opt.value === value);
      return option?.label || value || '—';
    }

    if (column.type === 'variant' && value) {
      const variant = getVariantDetails(value);
      return (
        <div className={styles.itemVariantInfo}>
          <span className={styles.variantName}>{variant?.label || 'Unknown'}</span>
          {variant?.sku && (
            <span className={styles.variantSku}>{variant.sku}</span>
          )}
        </div>
      );
    }

    if (column.type === 'total') {
      return <strong>{formatCurrency(calculateTotal(item), item.currency_id)}</strong>;
    }

    return value || '—';
  };

  // Render column header
  const renderColumnHeader = (column) => {
    return column.label;
  };

  // Render form field for adding row
  const renderFormField = (column) => {
    const value = newItem[column.key] || '';
    
    if (column.type === 'select') {
      return (
        <div className={styles.gridItem} key={column.key}>
          <SelectInput
            options={column.options || []}
            value={value}
            onChange={(e) => setNewItem({ ...newItem, [column.key]: e.target.value })}
            placeholder={column.placeholder || `Select ${column.label}...`}
            label={column.label}
            required={column.required}
          />
        </div>
      );
    }

    if (column.type === 'number') {
      return (
        <div className={styles.gridItem} key={column.key}>
          <TextInput
            type="number"
            step={column.step || "any"}
            placeholder={column.placeholder || "0.00"}
            value={value}
            onChange={(e) => setNewItem({ ...newItem, [column.key]: e.target.value })}
            label={column.label}
            required={column.required}
          />
        </div>
      );
    }

    return (
      <div className={styles.gridItem} key={column.key}>
        <TextInput
          type="text"
          placeholder={column.placeholder || `Enter ${column.label}...`}
          value={value}
          onChange={(e) => setNewItem({ ...newItem, [column.key]: e.target.value })}
          label={column.label}
          required={column.required}
        />
      </div>
    );
  };

  return (
    <div className={styles.itemsContainer}>
      {/* Items Header */}
      <div className={styles.itemsHeader}>
        <div className={styles.itemsHeaderLeft}>
          <FiPackage size={16} />
          <span>{entityPluralLabel}</span>
          <span className={styles.itemCount}> ({items.length})</span>
        </div>
        <div className={styles.itemsHeaderRight}>
          <button
            className={styles.itemsActionBtn}
            onClick={() => {
              setNewItem(initializeNewItem());
              setIsAddingRow(true);
            }}
          >
            <FiPlus size={14} />
            {addRowLabel}
          </button>
          {variantOptions.length > 0 && (
            <button
              className={`${styles.itemsActionBtn} ${styles.itemsActionBtnPrimary}`}
              onClick={() => setShowAddMultipleModal(true)}
            >
              <FiPlus size={14} />
              {addMultipleLabel}
            </button>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className={styles.itemsTableWrapper}>
        {items.length === 0 && !isAddingRow ? (
          <div className={styles.emptyItems}>
            <FiPackage size={40} />
            <p>{emptyStateLabel}</p>
            <span>{emptyStateSubLabel}</span>
          </div>
        ) : (
          <table className={styles.itemsTable}>
            {items.length > 0 && <thead>
              <tr>
                <th className={styles.colNo}>#</th>
                {columns.map(col => (
                  <th key={col.key} className={styles[`col${col.key.charAt(0).toUpperCase() + col.key.slice(1)}`] || styles.colDefault}>
                    {renderColumnHeader(col)}
                  </th>
                ))}
                <th className={styles.colAction}></th>
              </tr>
            </thead>}
            <tbody>
              {items.map((item, index) => (
                <tr 
                  key={item.id || index} 
                  className={onItemClick ? styles.clickableRow : ''}
                  onClick={() => onItemClick && onItemClick(item)}
                >
                  <td className={styles.colNo}>{index + 1}</td>
                  {columns.map(col => (
                    <td key={col.key} className={styles[`col${col.key.charAt(0).toUpperCase() + col.key.slice(1)}`] || styles.colDefault}>
                      {renderCellValue(item, col)}
                    </td>
                  ))}
                  <td className={styles.colAction}>
                    <button
                      className={styles.removeItemBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.id);
                      }}
                      title={`Remove ${entityLabel}`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Row Form */}
      {isAddingRow && (
        <div className={styles.addRowForm}>
          <div className={styles.formGrid}>
            {columns.map(col => renderFormField(col))}
          </div>
          <div className={styles.addRowActions}>
            <button
              className={styles.cancelAddBtn}
              onClick={() => {
                setIsAddingRow(false);
                setNewItem(initializeNewItem());
              }}
            >
              <FiX size={14} />
              Cancel
            </button>
            <button
              className={styles.saveAddBtn}
              onClick={handleAddRow}
            >
              <FiPlus size={14} />
              Add {entityLabel}
            </button>
          </div>
        </div>
      )}

      {/* Add Multiple Modal */}
      {showAddMultipleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddMultipleModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{addMultipleLabel}</h3>
              <button onClick={() => setShowAddMultipleModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalSearch}>
                <FiSearch size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                />
              </div>
              <div className={styles.modalVariantList}>
                {filteredModalVariants.map(variant => (
                  <div
                    key={variant.value}
                    className={`${styles.modalVariantItem} ${selectedVariants[variant.value] ? styles.selected : ''}`}
                  >
                    <div 
                      className={styles.modalVariantInfo}
                      onClick={() => toggleVariantSelection(variant.value)}
                    >
                      <div className={styles.modalVariantName}>{variant.label}</div>
                      <div className={styles.modalVariantMeta}>
                        <span>SKU: {variant.sku}</span>
                        <span>Stock: {variant.stock}</span>
                        <span>Price: {formatCurrency(variant.price)}</span>
                      </div>
                    </div>
                    <div className={styles.modalVariantActions}>
                      <div className={styles.modalVariantQty}>
                        <input
                          type="number"
                          min="1"
                          value={selectedVariants[variant.value] || 1}
                          onChange={(e) => updateSelectedVariantQty(variant.value, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <button
                        className={styles.modalAddBtn}
                        onClick={() => handleAddMultiple(variant.value)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
                {filteredModalVariants.length === 0 && (
                  <div className={styles.noVariants}>
                    <p>No products found</p>
                  </div>
                )}
              </div>
              {selectedCount > 0 && (
                <div className={styles.modalActions}>
                  <span>{selectedCount} items selected</span>
                  <div>
                    <button
                      className={styles.clearSelectedBtn}
                      onClick={() => setSelectedVariants({})}
                    >
                      Clear All
                    </button>
                    <button
                      className={styles.addAllBtn}
                      onClick={handleAddAllSelected}
                    >
                      Add All ({selectedCount})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItems;