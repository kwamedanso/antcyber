// components/ui/MultiSearchableSelect.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/MultiSearchableSelect.module.css';

/**
 * Multi-select dropdown with search.
 *
 * Props:
 *  - label, labelPlacement, id, error, info — same as SearchableSelect
 *  - options: [{ value, label }]
 *  - value: array of selected values (e.g. ['uuid-1', 'uuid-2'])
 *  - onChange: (nextArrayOfValues) => void
 *  - onSearchChange: (text) => void      (optional — for remote search)
 *  - isLoading: boolean
 *  - placeholder: string
 *  - getChipLabel?: (option) => string   (optional override for chip text)
 *  - disabled
 */
const MultiSearchableSelect = ({
  label,
  labelPlacement,
  id,
  error,
  info,
  options = [],
  value = [],
  onChange,
  onSearchChange,
  isLoading = false,
  placeholder = 'Search or select...',
  getChipLabel,
  disabled = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const ulRef = useRef(null);

  const selectedSet = useMemo(() => new Set(value), [value]);

  // Options filtered out when already selected — we still show them in the
  // dropdown but marked as selected so users can toggle them off.
  const visibleOptions = options;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Highlight first unselected option when opening
  useEffect(() => {
    if (isOpen) {
      const firstUnselected = visibleOptions.findIndex(
        (opt) => !selectedSet.has(opt.value)
      );
      setHighlightedIndex(firstUnselected >= 0 ? firstUnselected : -1);
    }
  }, [isOpen, visibleOptions, selectedSet]);

  // Scroll highlighted into view
  useEffect(() => {
    if (highlightedIndex >= 0 && ulRef.current) {
      const item = ulRef.current.children[highlightedIndex];
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);
    if (!isOpen) setIsOpen(true);
    if (onSearchChange) onSearchChange(text);
  };

  const toggleOption = (option) => {
    const next = selectedSet.has(option.value)
      ? value.filter((v) => v !== option.value)
      : [...value, option.value];

    if (onChange) onChange(next);

    // Keep the dropdown open and clear the search so the user can add more.
    setInputValue('');
    if (onSearchChange) onSearchChange('');
  };

  const removeChip = (val, e) => {
    if (e) e.stopPropagation();
    if (onChange) onChange(value.filter((v) => v !== val));
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!visibleOptions.length) return;
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, visibleOptions.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!visibleOptions.length) return;
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && visibleOptions[highlightedIndex]) {
          toggleOption(visibleOptions[highlightedIndex]);
        }
        break;
      case 'Backspace':
        // Remove the last chip when the input is empty
        if (!inputValue && value.length) {
          e.preventDefault();
          onChange(value.slice(0, -1));
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        e.target.blur();
        break;
      default:
        break;
    }
  };

  const chipLabelFor = (val) => {
    const opt = options.find((o) => o.value === val);
    if (opt) return getChipLabel ? getChipLabel(opt) : opt.label;
    return String(val);
  };

  const selectedOptions = value
    .map((val) => options.find((o) => o.value === val) || { value: val, label: chipLabelFor(val) })
    .filter(Boolean);

  return (
    <InputWrapper
      label={label}
      labelPlacement={labelPlacement}
      htmlFor={id}
      error={error}
      info={info}
    >
      <div className={styles.container} ref={containerRef}>
        <div
          className={`${styles.inputWrapper} ${disabled ? styles.disabled : ''}`}
          onClick={() => !disabled && setIsOpen(true)}
        >
          <input
            type="text"
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => !disabled && setIsOpen(true)}
            placeholder={
              selectedOptions.length
                ? 'Add more…'
                : placeholder
            }
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            autoComplete="off"
            disabled={disabled}
            {...props}
          />

          <div className={styles.actions}>
            {isLoading && <span className={styles.spinner} />}
            {value.length > 0 && !disabled && (
              <span className={styles.countBadge}>{value.length}</span>
            )}
            <span
              className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}
            />
          </div>
        </div>

        {selectedOptions.length > 0 && (
          <ul className={styles.chips}>
            {selectedOptions.map((opt) => (
              <li key={opt.value} className={styles.chip}>
                <span className={styles.chipLabel}>{opt.label}</span>
                <button
                  type="button"
                  className={styles.chipRemove}
                  onClick={(e) => removeChip(opt.value, e)}
                  aria-label={`Remove ${opt.label}`}
                  disabled={disabled}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}

        {isOpen && (
          <ul className={styles.dropdown} ref={ulRef}>
            {isLoading && visibleOptions.length === 0 ? (
              <li className={styles.statusMessage}>Searching…</li>
            ) : visibleOptions.length > 0 ? (
              visibleOptions.map((option, index) => {
                const isSelected = selectedSet.has(option.value);
                const isHighlighted = index === highlightedIndex;
                return (
                  <li
                    key={option.value}
                    onClick={() => toggleOption(option)}
                    className={`${styles.optionRow} ${
                      isSelected ? styles.selectedRow : ''
                    } ${isHighlighted ? styles.highlightedRow : ''}`}
                  >
                    <span className={styles.checkbox}>
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className={styles.optionLabel}>{option.label}</span>
                  </li>
                );
              })
            ) : (
              <li className={styles.statusMessage}>No matches found</li>
            )}
          </ul>
        )}
      </div>
    </InputWrapper>
  );
};

export default MultiSearchableSelect;