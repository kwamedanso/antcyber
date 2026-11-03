import React from 'react';
import SearchableSelect from './SearchableSelect';
import CurrencyInput from './CurrencyInput';
import styles from './styles/AccountBalanceInput.module.css';

const AccountBalanceInput = ({ 
  label, 
  labelPlacement = 'top', 
  id, 
  accountOptions = [], 
  accountValue, 
  onAccountChange, 
  onAccountSearch,
  amountValue, 
  onAmountChange, 
  isLoadingAccount = false,
  currencySymbol = 'GH₵',
  error 
}) => {
  
  const containerClass = `${styles.wrapper} ${
    labelPlacement === 'left' ? styles.layoutLeft : styles.layoutTop
  }`;

  return (
    <div className={containerClass}>
      {label && labelPlacement !== 'none' && (
        <label className={styles.mainLabel}>{label}</label>
      )}

      <div className={styles.inputsRow}>
        <div className={styles.accountCol}>
          <SearchableSelect
            labelPlacement="none"
            id={`${id}-acc`}
            options={accountOptions}
            value={accountValue}
            onChange={(e) => onAccountChange && onAccountChange(e.target.value)}
            onSearchChange={onAccountSearch}
            isLoading={isLoadingAccount}
            placeholder="Select ledger account..."
          />
        </div>
        <div className={styles.amountCol}>
          <CurrencyInput
            labelPlacement="none"
            id={`${id}-amt`}
            currencySymbol={currencySymbol}
            value={amountValue}
            onChange={(e) => onAmountChange && onAmountChange(e.target.value)}
          />
        </div>
      </div>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
};

export default AccountBalanceInput;